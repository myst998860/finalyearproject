import React from 'react';
import { AlertTriangle, Shield, ShieldOff, Trash2, X } from 'lucide-react';

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "warning", // warning, danger, info
  icon: Icon = AlertTriangle
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconColor: '#dc2626',
          confirmBg: '#dc2626',
          confirmHover: '#b91c1c',
          borderColor: '#fecaca'
        };
      case 'warning':
        return {
          iconColor: '#d97706',
          confirmBg: '#d97706',
          confirmHover: '#b45309',
          borderColor: '#fed7aa'
        };
      case 'info':
        return {
          iconColor: '#2563eb',
          confirmBg: '#2563eb',
          confirmHover: '#1d4ed8',
          borderColor: '#bfdbfe'
        };
      default:
        return {
          iconColor: '#6b7280',
          confirmBg: '#6b7280',
          confirmHover: '#4b5563',
          borderColor: '#e5e7eb'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: `1px solid ${styles.borderColor}`,
        position: 'relative'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            color: '#6b7280',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <X size={20} />
        </button>

        {/* Icon and Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '16px',
          gap: '12px'
        }}>
          <div style={{
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: `${styles.iconColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={24} color={styles.iconColor} />
          </div>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            {title}
          </h3>
        </div>

        {/* Message */}
        <p style={{
          margin: '0 0 24px 0',
          color: '#6b7280',
          lineHeight: '1.5',
          fontSize: '14px'
        }}>
          {message}
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f9fafb';
              e.target.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#d1d5db';
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: styles.confirmBg,
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = styles.confirmHover}
            onMouseLeave={(e) => e.target.style.backgroundColor = styles.confirmBg}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog; 