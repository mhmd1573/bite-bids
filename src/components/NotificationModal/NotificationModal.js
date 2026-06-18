import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import './NotificationModal.css';

const NotificationContext = createContext(null);

const defaultConfig = {
  type: 'info',
  title: '',
  message: ''
};

const normalizeConfig = (typeOrConfig, title, message) => {
  if (typeOrConfig && typeof typeOrConfig === 'object') {
    return {
      type: typeOrConfig.type || defaultConfig.type,
      title: typeOrConfig.title || defaultConfig.title,
      message: typeOrConfig.message || defaultConfig.message
    };
  }

  return {
    type: typeOrConfig || defaultConfig.type,
    title: title || defaultConfig.title,
    message: message || defaultConfig.message
  };
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((typeOrConfig, title, message) => {
    setNotification(normalizeConfig(typeOrConfig, title, message));
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const value = useMemo(() => ({ showNotification }), [showNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notification && (
        <div className="notification-overlay" onClick={closeNotification}>
          <div
            className={`modal-content modal-sm notification-modal notification-${notification.type}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="notification-header">
              <div className="notification-icon-wrapper">
                {notification.type === 'success' ? (
                  <Check className="notification-icon" />
                ) : (
                  <AlertCircle className="notification-icon" />
                )}
              </div>
              <button
                className="modal-close"
                onClick={closeNotification}
                aria-label="Close notification"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="notification-body">
              <h3 className="notification-title">{notification.title}</h3>
              <p className="notification-message">{notification.message}</p>
            </div>

            <div className="notification-footer">
              <button
                className={`btn ${notification.type === 'error' ? 'btn-outline' : 'btn-primary'}`}
                onClick={closeNotification}
                type="button"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
