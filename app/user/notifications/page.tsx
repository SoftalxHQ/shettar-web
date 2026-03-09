'use client';

import UserLayout from '@/app/components/layouts/UserLayout';
import { useNotifications, NotificationItem } from '@/app/context/NotificationContext';
import toast from 'react-hot-toast';
import { Card, CardBody, CardHeader, ListGroup, ListGroupItem, Button } from 'react-bootstrap';
import { BsBellFill, BsCheckAll, BsCalendarCheckFill, BsWalletFill, BsLightningChargeFill, BsTrash } from 'react-icons/bs';
import clsx from 'clsx';
import DeleteConfirmModal from '@/app/components/Common/DeleteConfirmModal';
import { useState } from 'react';

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + "y ago";
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + "mo ago";
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + "d ago";
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + "h ago";
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + "m ago";
  return "just now";
}

function getNotificationIcon(title: string, message: string) {
  const content = (title + ' ' + message).toLowerCase();
  if (content.includes('booking')) return { icon: BsCalendarCheckFill, color: 'text-success', bg: 'bg-success' };
  if (content.includes('wallet') || content.includes('payment') || content.includes('funded')) return { icon: BsWalletFill, color: 'text-primary', bg: 'bg-primary' };
  if (content.includes('airtime') || content.includes('data')) return { icon: BsLightningChargeFill, color: 'text-warning', bg: 'bg-warning' };
  return { icon: BsBellFill, color: 'text-info', bg: 'bg-info' };
}

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, deleteNotification, loading } = useNotifications();
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: number | 'all' | null; isAll: boolean }>({
    show: false,
    id: null,
    isAll: false
  });

  const handleDeleteClick = (id: number | 'all', isAll = false) => {
    setDeleteModal({ show: true, id, isAll });
  };

  return (
    <UserLayout>
      <Card className="bg-mode shadow">
        <CardHeader className="bg-transparent border-bottom d-flex justify-content-between align-items-center p-3">
          <h5 className="card-header-title mb-0">
            <BsBellFill className="me-2 mb-1" size={22} />
            Notifications
            {unreadCount > 0 && (
              <span className="badge bg-danger bg-opacity-10 text-danger ms-2">
                {unreadCount} Unread
              </span>
            )}
          </h5>
          <div className="d-flex gap-2">
            <Button
              variant="link"
              className="p-0 text-primary fw-bold text-decoration-none small"
              onClick={() => markAsRead('all')}
              disabled={notifications.length === 0}
            >
              <BsCheckAll className="me-1" />
              Mark all as read
            </Button>
            <Button
              variant="link"
              className="p-0 text-danger fw-bold text-decoration-none small ms-2"
              onClick={() => handleDeleteClick('all', true)}
              disabled={notifications.length === 0}
            >
              <BsTrash className="me-1" />
              Delete all
            </Button>
          </div>
        </CardHeader>

        <CardBody className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : notifications.length > 0 ? (
            <ListGroup className="list-group-flush list-unstyled">
              {notifications.map((notification) => (
                <ListGroupItem
                  key={notification.id}
                  className={clsx('p-4 border-0 border-bottom', { 'bg-light bg-opacity-50': !notification.read_at })}
                >
                  <div className="d-sm-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-start">
                      <div className={clsx('avatar avatar-sm me-3 flex-shrink-0')}>
                        {(() => {
                          const { icon: Icon, color, bg } = getNotificationIcon(notification.title, notification.message);
                          return (
                            <div className={clsx('avatar-img rounded-circle d-flex align-items-center justify-content-center', bg, 'bg-opacity-15', color)} style={{ width: '40px', height: '40px' }}>
                              <Icon size={20} />
                            </div>
                          );
                        })()}
                      </div>
                      <div>
                        <h6 className={clsx('mb-1', { 'fw-bold': !notification.read_at })}>{notification.title}</h6>
                        <p className="mb-0 small">{notification.message}</p>
                        <span className="small text-muted">{timeAgo(notification.created_at)}</span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      {!notification.read_at && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-secondary text-primary-hover mt-2 mt-sm-0"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-danger-hover mt-2 mt-sm-0"
                        onClick={() => handleDeleteClick(notification.id)}
                        title="Delete notification"
                      >
                        <BsTrash size={16} />
                      </Button>
                    </div>
                  </div>
                </ListGroupItem>
              ))}
            </ListGroup>
          ) : (
            <div className="text-center p-5">
              <div className="avatar avatar-lg bg-light rounded-circle mb-3 m-auto d-flex align-items-center justify-content-center">
                <BsBellFill size={30} className="text-muted" />
              </div>
              <h6>No notifications yet</h6>
              <p className="small mb-0">We&apos;ll notify you when something important happens.</p>
            </div>
          )}
        </CardBody>
      </Card>

      <DeleteConfirmModal
        show={deleteModal.show}
        isAll={deleteModal.isAll}
        onHide={() => setDeleteModal({ ...deleteModal, show: false })}
        onConfirm={() => {
          if (deleteModal.id) {
            deleteNotification(deleteModal.id);
          }
        }}
      />
    </UserLayout>
  );
};

export default NotificationsPage;
