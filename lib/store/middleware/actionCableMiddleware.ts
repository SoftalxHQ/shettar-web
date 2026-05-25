import type { Middleware } from "@reduxjs/toolkit";

/**
 * Account notifications are handled by AccountNotificationsSync (raw WebSocket),
 * matching shettar-business. This middleware is kept as a no-op for store compatibility.
 */
export const actionCableMiddleware: Middleware = () => (next) => (action) => next(action);
