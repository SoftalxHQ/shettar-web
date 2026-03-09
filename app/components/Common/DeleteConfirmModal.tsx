'use client';

import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { BsExclamationTriangle, BsTrash3 } from 'react-icons/bs';

interface DeleteConfirmModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isAll?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  show,
  onHide,
  onConfirm,
  title = "Delete Notification?",
  message = "This action cannot be undone. Are you sure you want to proceed?",
  isAll = false
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
      size="sm"
    >
      <Modal.Body className="p-4 text-center">
        <div className="mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle mb-3"
            style={{ width: '70px', height: '70px' }}
          >
            {isAll ? <BsTrash3 size={32} /> : <BsExclamationTriangle size={32} />}
          </div>
          <h4 className="fw-bold mb-2">{isAll ? "Clear Everything?" : title}</h4>
          <p className="text-secondary small px-3">
            {isAll
              ? "This will permanently remove all your notifications. This action is irreversible."
              : message}
          </p>
        </div>

        <div className="d-grid gap-2">
          <Button
            variant="danger"
            className="py-2 fw-bold shadow-sm"
            onClick={() => {
              onConfirm();
              onHide();
            }}
          >
            {isAll ? "Yes, Clear All" : "Yes, Delete IT"}
          </Button>
          <Button
            variant="light"
            className="py-2 fw-semibold text-secondary"
            onClick={onHide}
          >
            Cancel
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteConfirmModal;
