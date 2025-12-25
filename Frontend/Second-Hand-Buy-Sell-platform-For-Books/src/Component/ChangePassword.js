import React, { useState } from 'react';
import './ForgetPassword.css';
import { toast } from 'react-toastify';

const ChangePassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add password change logic here
    toast.success('Password changed successfully!');
  };

  return (
    <div className="fp-bg">
      <div className="fp-card">
        <h2 className="fp-title">Change Password</h2>
        <form onSubmit={handleSubmit} className="fp-form">
          <label className="fp-label">New Password</label>
          <input
            type="password"
            className="fp-input"
            placeholder="Enter new password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ marginBottom: '18px', borderBottom: '2px solid #222' }}
          />
          <label className="fp-label">Confirm Password</label>
          <input
            type="password"
            className="fp-input"
            placeholder="Confirm new password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            style={{ marginBottom: '32px', borderBottom: '2px solid #222' }}
          />
          <button type="submit" className="fp-btn">Change Password</button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword; 