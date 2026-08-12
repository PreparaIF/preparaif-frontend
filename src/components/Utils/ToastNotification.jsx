import React, { useEffect } from 'react';
import './ToastNotification.css';

export default function ToastNotification({ toast, onClose }) {
  if (!toast) return null;

  const { type = 'info', title, message } = toast;

  return (
    <div className={`toast-notification-container toast-${type}`}>
      <div className="toast-icon-wrapper">
        {type === 'logout' && '🚪'}
        {type === 'success' && '✅'}
        {type === 'info' && '💡'}
        {type === 'warning' && '⚠️'}
      </div>
      <div className="toast-content">
        {title && <h4 className="toast-title">{title}</h4>}
        <p className="toast-message">{message}</p>
      </div>
      <button className="toast-close-btn" onClick={onClose} aria-label="Fechar notificação">
        ✕
      </button>
    </div>
  );
}
