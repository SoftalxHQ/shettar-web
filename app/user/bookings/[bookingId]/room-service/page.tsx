'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import UserLayout from '@/app/components/layouts/UserLayout';
import { Button, Card, Form, Spinner, Nav, Tab, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  createGuestOrder,
  fetchGuestMenu,
  fetchGuestOrders,
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

type CartLine = { menu_item_id: number; name: string; price: number; quantity: number };

export default function RoomServicePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  const businessKey = searchParams.get('businessId')?.trim() || '';
  const reservationId = Number(searchParams.get('reservationId'));
  const roomNumber = searchParams.get('roomNumber') || '';

  const [menu, setMenu] = useState<GuestMenuCategory[]>([]);
  const [orders, setOrders] = useState<GuestRestaurantOrder[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('order');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card' | 'offline'>('offline');
  const [menuSearch, setMenuSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [menuView, setMenuView] = useState<'grid' | 'list'>('grid');
  const { data: account } = useGetAccountDetailsQuery();

  const load = useCallback(async () => {
    if (!businessKey || !reservationId) return;
    setLoading(true);
    try {
      const [categories, orderList] = await Promise.all([
        fetchGuestMenu(businessKey),
        fetchGuestOrders(businessKey, reservationId),
      ]);
      setMenu(categories);
      setOrders(orderList);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [businessKey, reservationId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!bookingId) return;
    fetchGuestReservation(bookingId)
      .then((r) => {
        if (!r.can_order_room_service) {
          toast.error(
            r.checked_out_at
              ? 'Room service is not available after check-out'
              : 'Room service is only available while you are checked in'
          );
          router.replace(`/user/bookings/${bookingId}`);
          return;
        }
        const expectedKey = businessPublicId(r.business);
        if (expectedKey && businessKey && businessKey !== expectedKey && String(r.business?.id) !== businessKey) {
          router.replace(
            roomServicePath(bookingId, {
              businessUniqueId: expectedKey,
              reservationId: r.id,
              roomNumber: reservationRoomNumber(r) || roomNumber,
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
  };

  const adjustQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.menu_item_id === id ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((s, l) => s + l.price * l.quantity, 0);

  const placeOrder = async (paystackReference?: string) => {
    await createGuestOrder(businessKey, reservationId, {
      notes: notes.trim() || undefined,
      payment_method: paymentMethod,
      paystack_reference: paystackReference,
      items: cart.map((l) => ({ menu_item_id: l.menu_item_id, quantity: l.quantity })),
    });
    toast.success('Order placed');
    setCart([]);
    setNotes('');
    await load();
    setActiveTab('history');
  };

  const submit = async () => {
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
    setSubmitting(true);
    try {
      if (paymentMethod === 'card') {
        const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
        if (!key || !(window as any).PaystackPop) {
          toast.error('Card payments are not available');
          setSubmitting(false);
          return;
        }
        const ref = `RS${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        const handler = (window as any).PaystackPop.setup({
          key,
          email: account?.email || 'guest@shettar.com',
          amount: Math.round(cartTotal * 100),
          ref,
          callback: async (response: { reference: string }) => {
            try {
              await placeOrder(response.reference);
            } catch (e: unknown) {
              toast.error(e instanceof Error ? e.message : 'Failed to place order');
            } finally {
              setSubmitting(false);
            }
          },
          onClose: () => setSubmitting(false),
        });
        handler.openIframe();
        return;
      }
      await placeOrder();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
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
        <Button variant="link" className="p-0 mb-2" onClick={() => router.back()}>
          ← Back
        </Button>
        <h4 className="mb-0">Room service</h4>
        <p className="text-secondary small mb-0">
          Booking {bookingId}
          {roomNumber ? ` · Room ${roomNumber}` : ''}
        </p>
      </div>

      <Tab.Container activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="order">Order</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="history">My orders</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="order">
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
                              <button
                                type="button"
                                className="w-100 text-start border rounded p-2 h-100 bg-white hover-shadow"
                                onClick={() => addItem(item)}
                                style={{ cursor: 'pointer' }}
                              >
                                {item.image_url ? (
                                  <img
                                    src={item.image_url}
                                    alt=""
                                    className="w-100 rounded mb-2"
                                    style={{ height: 72, objectFit: 'cover' }}
                                  />
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
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="vstack gap-2">
                          {filteredMenuItems.map((item) => (
                            <div
                              key={item.id}
                              className="d-flex align-items-center gap-3 border rounded p-2"
                            >
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt=""
                                  className="rounded flex-shrink-0"
                                  style={{ width: 56, height: 56, objectFit: 'cover' }}
                                />
                              ) : null}
                              <div className="flex-grow-1 min-w-0">
                                <div className="fw-semibold">{item.name}</div>
                                {item.description && (
                                  <div className="small text-secondary text-truncate">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                              <Button size="sm" variant="outline-primary" onClick={() => addItem(item)}>
                                ₦{Number(item.price).toLocaleString()} +
                              </Button>
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
                        <p className="fw-bold mt-3 mb-3">Total: ₦{cartTotal.toLocaleString()}</p>
                        <Button variant="primary" className="w-100" onClick={submit} disabled={submitting}>
                          {submitting ? <Spinner size="sm" animation="border" /> : 'Place order'}
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

          <Tab.Pane eventKey="history">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
              </div>
            ) : orders.length === 0 ? (
              <p className="text-secondary">No orders yet.</p>
            ) : (
              <div className="vstack gap-3">
                {orders.map((o) => (
                  <Card key={o.id}>
                    <Card.Body>
                      <div className="d-flex justify-content-between">
                        <h6 className="mb-0 font-monospace">
                          {(o.order_number || `Order #${o.id}`).replace(/\s+/g, '')}
                        </h6>
                        <span className="badge bg-secondary text-capitalize">{o.status}</span>
                      </div>
                      <p className="small text-secondary mb-2">
                        ₦{Number(o.subtotal).toLocaleString()}
                        {o.payment_status ? ` · ${o.payment_status}` : ''}
                      </p>
                      {o.items?.map((item) => (
                        <div key={item.id} className="small">
                          {item.quantity}× {item.name}
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </UserLayout>
  );
}
