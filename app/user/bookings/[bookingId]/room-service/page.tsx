'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import UserLayout from '@/app/components/layouts/UserLayout';
import { Button, Card, Form, Spinner, Nav, Tab, Row, Col, Modal } from 'react-bootstrap';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  createGuestOrder,
  fetchGuestMenu,
  fetchGuestOrders,
  upsertGuestOrder,
  type GuestMenuCategory,
  type GuestMenuItem,
  type GuestRestaurantOrder,
} from '@/app/helpers/restaurant';
import { useGetAccountDetailsQuery } from '@/lib/store/services/apiService';
import {
  businessPublicId,
  fetchGuestReservation,
  roomServicePath,
  reservationRoomNumber,
} from '@/app/helpers/bookings';
import { orderStatusVariant, subscribeRestaurantReservation } from '@/app/helpers/restaurant-cable';
import { calculatePaystackCardFee } from '@/app/helpers/paystack-fees';
import { BsArrowClockwise } from 'react-icons/bs';
import MenuItemImage from '@/app/components/MenuItemImage';

type CartLine = { menu_item_id: number; name: string; price: number; quantity: number };

type SubmitPhase = 'idle' | 'paystack' | 'verifying' | 'placing';

export default function RoomServicePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  const businessKey = searchParams.get('businessId')?.trim() || '';
  const reservationId = Number(searchParams.get('reservationId'));
  const roomNumber = searchParams.get('roomNumber') || '';
  const historyOnly = searchParams.get('historyOnly') === '1' || searchParams.get('historyOnly') === 'true';

  const [canOrder, setCanOrder] = useState(!historyOnly);
  const [canViewOrders, setCanViewOrders] = useState(true);

  const [menu, setMenu] = useState<GuestMenuCategory[]>([]);
  const [orders, setOrders] = useState<GuestRestaurantOrder[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>('idle');
  const [activeTab, setActiveTab] = useState(historyOnly ? 'history' : 'order');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card' | 'offline'>('offline');
  const [menuSearch, setMenuSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [menuView, setMenuView] = useState<'grid' | 'list'>('grid');
  const [previewItem, setPreviewItem] = useState<GuestMenuItem | null>(null);
  const { data: account } = useGetAccountDetailsQuery();

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (!businessKey || !reservationId) return;
    if (!options?.silent) setLoading(true);
    try {
      const orderList = await fetchGuestOrders(businessKey, reservationId);
      setOrders(orderList);
      if (canOrder) {
        const categories = await fetchGuestMenu(businessKey);
        setMenu(categories);
      } else {
        setMenu([]);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [businessKey, reservationId, canOrder]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load({ silent: true });
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!businessKey || !reservationId) return;
    return subscribeRestaurantReservation(businessKey, reservationId, (msg) => {
      if (msg.event === 'menu_item_availability_changed') {
        const item = msg.payload?.item as GuestMenuItem | undefined;
        const available = msg.payload?.available as boolean | undefined;
        const itemId = item?.id;

        if (itemId != null && available === false) {
          setMenu((prev) =>
            prev.map((cat) => ({
              ...cat,
              items: (cat.items || []).filter((i) => i.id !== itemId),
            }))
          );
          setCart((prev) => prev.filter((line) => line.menu_item_id !== itemId));
        } else {
          fetchGuestMenu(businessKey).then(setMenu).catch(() => {});
        }
        return;
      }

      if (
        msg.event === 'order_status_changed' ||
        msg.event === 'order_created' ||
        msg.event === 'order_paid'
      ) {
        const order = msg.payload?.order as GuestRestaurantOrder | undefined;
        if (order?.id) {
          setOrders((prev) => upsertGuestOrder(prev, order));
          if (msg.event === 'order_status_changed' && order.status) {
            toast.success(`Order ${(order.order_number || '').replace(/\s+/g, '')} is now ${order.status}`);
          }
        } else {
          fetchGuestOrders(businessKey, reservationId).then(setOrders).catch(() => {});
        }
      }
    });
  }, [businessKey, reservationId]);

  useEffect(() => {
    if (!bookingId) return;
    fetchGuestReservation(bookingId)
      .then((r) => {
        const orderAllowed = !!r.can_order_room_service;
        const viewAllowed = orderAllowed || !!r.has_room_service_orders;
        setCanOrder(orderAllowed);
        setCanViewOrders(viewAllowed);

        if (!orderAllowed && !viewAllowed) {
          toast.error(
            r.checked_out_at
              ? 'Room service is not available after check-out'
              : r.checked_in_at
                ? 'Room service ordering closed after checkout time'
                : 'Room service is only available while you are checked in'
          );
          router.replace(`/user/bookings/${bookingId}`);
          return;
        }

        if (!orderAllowed) {
          setActiveTab('history');
        }

        const expectedKey = businessPublicId(r.business);
        if (expectedKey && businessKey && businessKey !== expectedKey && String(r.business?.id) !== businessKey) {
          router.replace(
            roomServicePath(bookingId, {
              businessUniqueId: expectedKey,
              reservationId: r.id,
              roomNumber: reservationRoomNumber(r) || roomNumber,
              historyOnly: !orderAllowed,
            })
          );
        }
      })
      .catch(() => {});
  }, [bookingId, businessKey, roomNumber, router]);

  const menuItems = useMemo(
    () =>
      menu.flatMap((c) =>
        (c.items || []).map((item) => ({
          ...item,
          restaurant_menu_category_id: item.restaurant_menu_category_id ?? c.id,
        }))
      ),
    [menu]
  );

  const filteredMenuItems = useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    return menuItems.filter((item) => {
      const cat = menu.find((c) => c.id === item.restaurant_menu_category_id);
      if (categoryFilter !== 'all' && String(item.restaurant_menu_category_id) !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (cat?.name || '').toLowerCase().includes(q)
      );
    });
  }, [menuItems, menuSearch, categoryFilter, menu]);

  const addItem = (item: GuestMenuItem) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.menu_item_id === item.id);
      if (existing) {
        return prev.map((l) =>
          l.menu_item_id === item.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [...prev, { menu_item_id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const adjustQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.menu_item_id === id ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((s, l) => s + l.price * l.quantity, 0);

  const cardFee = useMemo(
    () => (paymentMethod === 'card' && cartTotal > 0 ? calculatePaystackCardFee(cartTotal) : null),
    [paymentMethod, cartTotal]
  );

  const amountDue = cardFee?.charge_amount ?? cartTotal;

  const submitting = submitPhase !== 'idle';

  const submitButtonLabel =
    submitPhase === 'paystack'
      ? 'Opening payment…'
      : submitPhase === 'verifying'
        ? 'Verifying payment…'
        : submitPhase === 'placing'
          ? 'Placing order…'
          : 'Place order';

  const placeOrder = async (paystackReference?: string) => {
    const order = await createGuestOrder(businessKey, reservationId, {
      notes: notes.trim() || undefined,
      payment_method: paymentMethod,
      paystack_reference: paystackReference,
      items: cart.map((l) => ({ menu_item_id: l.menu_item_id, quantity: l.quantity })),
    });
    toast.success('Order placed');
    setCart([]);
    setNotes('');
    setOrders((prev) => upsertGuestOrder(prev, order));
    setActiveTab('history');
  };

  const submit = async () => {
    if (!canOrder) {
      toast.error('New room service orders are not available after checkout time');
      return;
    }
    if (cart.length === 0) {
      toast.error('Add at least one item');
      return;
    }
    if (paymentMethod === 'wallet') {
      const balance = Number(account?.wallet_balance || 0);
      if (balance < cartTotal) {
        toast.error('Insufficient wallet balance');
        return;
      }
    }
    try {
      if (paymentMethod === 'card') {
        const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
        const PaystackPop = (window as typeof window & { PaystackPop?: new () => { newTransaction: (o: Record<string, unknown>) => void } }).PaystackPop;
        if (!key || !PaystackPop) {
          toast.error('Card payments are not available');
          return;
        }
        const breakdown = calculatePaystackCardFee(cartTotal);
        const ref = `RS${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        setSubmitPhase('paystack');
        const paystack = new PaystackPop();
        paystack.newTransaction({
          key,
          email: account?.email || 'guest@shettar.com',
          amount: Math.round(breakdown.charge_amount * 100),
          ref,
          onSuccess: async (transaction: { reference?: string }) => {
            const reference = transaction?.reference;
            if (!reference) {
              toast.error('Payment reference missing');
              setSubmitPhase('idle');
              return;
            }
            setSubmitPhase('verifying');
            try {
              setSubmitPhase('placing');
              await placeOrder(reference);
            } catch (e: unknown) {
              toast.error(e instanceof Error ? e.message : 'Failed to place order');
            } finally {
              setSubmitPhase('idle');
            }
          },
          onCancel: () => {
            toast.error('Payment cancelled');
            setSubmitPhase('idle');
          },
        });
        return;
      }
      setSubmitPhase('placing');
      await placeOrder();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to place order');
    } finally {
      setSubmitPhase('idle');
    }
  };

  if (!businessKey || !reservationId) {
    return (
      <UserLayout>
        <p className="text-secondary">Invalid booking link — business reference is missing.</p>
        <Link href="/user/bookings">Back to bookings</Link>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div>
            <Button variant="link" className="p-0 mb-2" onClick={() => router.back()}>
              ← Back
            </Button>
            <h4 className="mb-0">{canOrder ? 'Room service' : 'My orders'}</h4>
            <p className="text-secondary small mb-0">
              Booking {bookingId}
              {roomNumber ? ` · Room ${roomNumber}` : ''}
            </p>
          </div>
          <Button
            variant="outline-secondary"
            size="sm"
            className="d-flex align-items-center justify-content-center"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            aria-label="Refresh room service"
            title="Refresh"
          >
            <BsArrowClockwise size={18} className={refreshing ? 'spin' : ''} />
          </Button>
        </div>
      </div>

      {!canViewOrders ? (
        <p className="text-secondary">No room service orders for this stay.</p>
      ) : (
      <Tab.Container activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)}>
        {canOrder ? (
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="order">Order</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="history">My orders</Nav.Link>
          </Nav.Item>
        </Nav>
        ) : null}

        <Tab.Content>
          {canOrder ? (
          <Tab.Pane eventKey="order" mountOnEnter unmountOnExit>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
              </div>
            ) : menuItems.length === 0 ? (
              <p className="text-secondary">No menu items available.</p>
            ) : (
              <Row className="g-4">
                <Col lg={7}>
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                        <h6 className="fw-bold mb-0">Menu</h6>
                        <div className="btn-group btn-group-sm">
                          <Button
                            variant={menuView === 'grid' ? 'primary' : 'outline-primary'}
                            onClick={() => setMenuView('grid')}
                          >
                            Grid
                          </Button>
                          <Button
                            variant={menuView === 'list' ? 'primary' : 'outline-primary'}
                            onClick={() => setMenuView('list')}
                          >
                            List
                          </Button>
                        </div>
                      </div>
                      <div className="d-flex flex-column sm:flex-row gap-2 mb-3">
                        <Form.Control
                          placeholder="Search menu…"
                          value={menuSearch}
                          onChange={(e) => setMenuSearch(e.target.value)}
                        />
                        <Form.Select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          style={{ maxWidth: 200 }}
                        >
                          <option value="all">All categories</option>
                          {menu.map((c) => (
                            <option key={c.id} value={String(c.id)}>
                              {c.name}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                      {filteredMenuItems.length === 0 ? (
                        <p className="text-secondary small mb-0">No items match your search.</p>
                      ) : menuView === 'grid' ? (
                        <div className="row g-2">
                          {filteredMenuItems.map((item) => (
                            <div key={item.id} className="col-6 col-md-4">
                              <div
                                role="button"
                                tabIndex={0}
                                className="w-100 text-start border rounded p-2 h-100 bg-white hover-shadow"
                                onClick={() => addItem(item)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    addItem(item);
                                  }
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                {item.image_url ? (
                                  <button
                                    type="button"
                                    className="w-100 p-0 border-0 bg-transparent d-block mb-2"
                                    aria-label={`View ${item.name}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPreviewItem(item);
                                    }}
                                  >
                                    <MenuItemImage
                                      src={item.image_url}
                                      alt={item.name}
                                      className="rounded"
                                      style={{ height: 72 }}
                                    />
                                  </button>
                                ) : (
                                  <div
                                    className="w-100 bg-light rounded mb-2 d-flex align-items-center justify-content-center text-muted small"
                                    style={{ height: 72 }}
                                  >
                                    No image
                                  </div>
                                )}
                                <div className="small fw-semibold text-truncate">{item.name}</div>
                                <div className="small text-primary">
                                  ₦{Number(item.price).toLocaleString()} +
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="vstack gap-2">
                          {filteredMenuItems.map((item) => (
                            <div
                              key={item.id}
                              role="button"
                              tabIndex={0}
                              className="d-flex align-items-center gap-3 border rounded p-2"
                              onClick={() => addItem(item)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  addItem(item);
                                }
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              {item.image_url ? (
                                <button
                                  type="button"
                                  className="p-0 border-0 bg-transparent flex-shrink-0"
                                  aria-label={`View ${item.name}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewItem(item);
                                  }}
                                >
                                  <MenuItemImage
                                    src={item.image_url}
                                    alt={item.name}
                                    className="rounded"
                                    style={{ width: 56, height: 56 }}
                                  />
                                </button>
                              ) : null}
                              <div className="flex-grow-1 min-w-0">
                                <div className="fw-semibold">{item.name}</div>
                              </div>
                              <span className="btn btn-sm btn-outline-primary">
                                ₦{Number(item.price).toLocaleString()} +
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={5}>
                  {cart.length > 0 ? (
                    <Card className="border-primary shadow-sm sticky-top" style={{ top: 16 }}>
                      <Card.Body>
                        <h6 className="fw-bold mb-3">Your cart</h6>
                        {cart.map((line) => (
                          <div
                            key={line.menu_item_id}
                            className="d-flex justify-content-between align-items-center mb-2"
                          >
                            <span className="small">{line.name}</span>
                            <div className="d-flex align-items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={() => adjustQty(line.menu_item_id, -1)}
                              >
                                −
                              </Button>
                              <span className="fw-bold">{line.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={() => adjustQty(line.menu_item_id, 1)}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Form.Group className="mt-3">
                          <Form.Label className="small">Notes (optional)</Form.Label>
                          <Form.Control
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Special instructions"
                          />
                        </Form.Group>
                        <Form.Group className="mt-3">
                          <Form.Label className="small fw-semibold">Payment</Form.Label>
                          <div className="d-flex flex-column gap-2">
                            <Form.Check
                              type="radio"
                              name="pay"
                              id="pay-wallet"
                              label={`Wallet (₦${Number(account?.wallet_balance || 0).toLocaleString()} available)`}
                              checked={paymentMethod === 'wallet'}
                              onChange={() => setPaymentMethod('wallet')}
                            />
                            <Form.Check
                              type="radio"
                              name="pay"
                              id="pay-card"
                              label="Card (Paystack)"
                              checked={paymentMethod === 'card'}
                              onChange={() => setPaymentMethod('card')}
                            />
                            <Form.Check
                              type="radio"
                              name="pay"
                              id="pay-offline"
                              label="Pay at room / charge to folio"
                              checked={paymentMethod === 'offline'}
                              onChange={() => setPaymentMethod('offline')}
                            />
                          </div>
                        </Form.Group>
                        <div className="mt-3 mb-3 small">
                          <div className="d-flex justify-content-between">
                            <span className="text-secondary">Subtotal</span>
                            <span>₦{cartTotal.toLocaleString()}</span>
                          </div>
                          {cardFee && (
                            <div className="d-flex justify-content-between text-danger">
                              <span>Paystack fee</span>
                              <span>+₦{cardFee.paystack_fee.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="d-flex justify-content-between fw-bold mt-1 pt-1 border-top">
                            <span>{paymentMethod === 'card' ? 'Total to pay' : 'Total'}</span>
                            <span>₦{amountDue.toLocaleString()}</span>
                          </div>
                        </div>
                        <Button
                          variant="primary"
                          className="w-100 d-flex align-items-center justify-content-center gap-2"
                          onClick={submit}
                          disabled={submitting}
                        >
                          {submitting && <Spinner size="sm" animation="border" />}
                          {submitButtonLabel}
                        </Button>
                      </Card.Body>
                    </Card>
                  ) : (
                    <Card className="border-0 bg-light">
                      <Card.Body className="text-center text-secondary small py-5">
                        Select items from the menu to build your order.
                      </Card.Body>
                    </Card>
                  )}
                </Col>
              </Row>
            )}
          </Tab.Pane>
          ) : null}

          <Tab.Pane eventKey="history" mountOnEnter>
            {loading && orders.length === 0 ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
              </div>
            ) : orders.length === 0 ? (
              <Card className="border-0 bg-light">
                <Card.Body className="text-center text-secondary py-5">
                  {canOrder ? 'No orders yet. Place an order from the Order tab.' : 'No orders for this stay.'}
                </Card.Body>
              </Card>
            ) : (
              <div className="vstack gap-3">
                {orders.map((o) => (
                  <Card key={o.id} className="shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div>
                          <h6 className="mb-1 font-monospace">
                            {(o.order_number || `Order #${o.id}`).replace(/\s+/g, '')}
                          </h6>
                          <p className="small text-secondary mb-0">
                            {new Date(o.created_at).toLocaleString()}
                          </p>
                        </div>
                        <span className={`badge bg-${orderStatusVariant(o.status)} text-capitalize`}>
                          {o.status}
                        </span>
                      </div>
                      <hr className="my-2" />
                      <div className="vstack gap-1 mb-2">
                        {o.items?.map((item) => (
                          <div key={item.id} className="small d-flex justify-content-between">
                            <span>
                              {item.quantity}× {item.name}
                            </span>
                            <span>₦{Number(item.line_total).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="d-flex justify-content-between fw-semibold">
                        <span>Total</span>
                        <span>₦{Number(o.subtotal).toLocaleString()}</span>
                      </div>
                      {o.payment_status && (
                        <p className="small text-secondary mb-0 mt-1 text-capitalize">
                          Payment: {o.payment_status.replace(/_/g, ' ')}
                        </p>
                      )}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
      )}

      <Modal
        show={!!previewItem}
        onHide={() => setPreviewItem(null)}
        centered
        size="lg"
        contentClassName="overflow-hidden border-0"
      >
        {previewItem?.image_url && (
          <div style={{ height: 'min(70vh, 480px)', width: '100%' }}>
            <MenuItemImage
              src={previewItem.image_url}
              alt={previewItem.name}
              style={{ height: 'min(70vh, 480px)', width: '100%' }}
            />
          </div>
        )}
        <Modal.Body>
          <h5 className="mb-1">{previewItem?.name}</h5>
          <p className="text-primary fw-semibold mb-0">
            ₦{Number(previewItem?.price ?? 0).toLocaleString()}
          </p>
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          <Button variant="link" className="text-secondary" onClick={() => setPreviewItem(null)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (previewItem) addItem(previewItem);
              setPreviewItem(null);
            }}
          >
            Add to cart
          </Button>
        </Modal.Footer>
      </Modal>
    </UserLayout>
  );
}
