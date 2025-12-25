import { toast } from 'react-toastify';

// Reusable confirmation toast function
export const showConfirmationToast = (message, onConfirm, onCancel) => {
  toast.info(
    <div>
      <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '14px' }}>
        {message}
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => {
            toast.dismiss();
            if (onConfirm) onConfirm();
          }}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#c82333'}
          onMouseLeave={(e) => e.target.style.background = '#dc3545'}
        >
          Confirm
        </button>
        <button
          onClick={() => {
            toast.dismiss();
            if (onCancel) onCancel();
          }}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#5a6268'}
          onMouseLeave={(e) => e.target.style.background = '#6c757d'}
        >
          Cancel
        </button>
      </div>
    </div>,
    {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      style: {
        minWidth: '320px',
        background: '#fff',
        color: '#333',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        padding: '16px'
      }
    }
  );
};

// Specific confirmation for delete operations
export const showDeleteConfirmation = (itemName, onConfirm) => {
  showConfirmationToast(
    `Are you sure you want to delete "${itemName}"?`,
    onConfirm,
    () => console.log('Delete cancelled')
  );
};

// Specific confirmation for logout
export const showLogoutConfirmation = (onConfirm) => {
  showConfirmationToast(
    'Are you sure you want to logout?',
    onConfirm,
    () => console.log('Logout cancelled')
  );
};

// Specific confirmation for unsaved changes
export const showUnsavedChangesConfirmation = (onConfirm) => {
  showConfirmationToast(
    'You have unsaved changes. Are you sure you want to leave?',
    onConfirm,
    () => console.log('Navigation cancelled')
  );
}; 