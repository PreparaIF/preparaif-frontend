import React from 'react';
import { LogOut, CheckCircle2, Lightbulb, AlertTriangle, X } from 'lucide-react';
import './ToastNotification.css';

export default function ToastNotification({ toast, onClose }) {
  if (!toast) return null;

  const { type = 'info', title, message } = toast;

  return (
    <div className={`toast-notification-container toast-${type}`}>
      <div className="toast-icon-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
        {type === 'logout' && <LogOut size={20} />}
        {type === 'success' && <CheckCircle2 size={20} />}
        {type === 'info' && <Lightbulb size={20} />}
        {type === 'warning' && <AlertTriangle size={20} />}
      </div>
      <div className="toast-content">
        {title && <h4 className="toast-title">{title}</h4>}
        <p className="toast-message">{message}</p>
      </div>
      <button className="toast-close-btn" onClick={onClose} aria-label="Fechar notificação">
        <X size={16} />
      </button>
    </div>
  );
}
