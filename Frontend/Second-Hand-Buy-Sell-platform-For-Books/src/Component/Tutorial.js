import React, { useEffect, useState } from "react";
import { fetchAllTutorials, fetchPurchasedTutorials, purchaseTutorial } from "../services/api";
import { toast } from 'react-toastify';
import "./Tutorial.css";

export default function Tutorial() {
  const [tutorials, setTutorials] = useState([]);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Payment simulation state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTutorial, setPaymentTutorial] = useState(null);
  const [testCredentials, setTestCredentials] = useState({ email: '', password: '' });
  const [paymentStep, setPaymentStep] = useState('credentials'); // 'credentials', 'processing', 'success'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allTuts, boughtIds] = await Promise.all([
        fetchAllTutorials(),
        fetchPurchasedTutorials().catch(() => []) // Fallback if not logged in or error
      ]);
      setTutorials(allTuts);
      setPurchasedIds(boughtIds);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWatch = (t) => {
    if (purchasedIds.includes(t.id)) {
      setSelected(t);
    } else {
      toast.info(`Please purchase "${t.title}" to watch.`);
    }
  };

  const initiatePayment = (t) => {
    setPaymentTutorial(t);
    setPaymentStep('credentials');
    setTestCredentials({ email: '', password: '' });
    setShowPaymentModal(true);
  };

  const simulateEsewaPayment = async () => {
    if (!testCredentials.email || !testCredentials.password) {
      toast.error('Please enter both email and password for eSewa payment.');
      return;
    }

    if (testCredentials.email !== 'test@esewa.com.np' || testCredentials.password !== 'test123') {
      toast.error('Invalid credentials. Please use test/test123');
      return;
    }

    setPaymentStep('processing');

    // Simulate processing
    setTimeout(async () => {
      try {
        const transactionId = "TUT-" + Date.now();
        await purchaseTutorial(paymentTutorial.id, transactionId);
        setPaymentStep('success');
        toast.success('Payment successful! Access granted.');

        // Refresh purchased list
        const updatedPurchases = await fetchPurchasedTutorials();
        setPurchasedIds(updatedPurchases);

        setTimeout(() => {
          setShowPaymentModal(false);
          setPaymentTutorial(null);
        }, 3000);
      } catch (err) {
        toast.error("Failed to record purchase: " + err.message);
        setPaymentStep('credentials');
      }
    }, 2000);
  };

  if (loading) return <div className="loading-container">Loading tutorials...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;

  return (
    <div className="tutorial-container">
      <div className="tutorial-header">
        <h2>Expert Book Bridge Tutorials</h2>
        <p>Enhance your skills with our premium content</p>
      </div>

      <div className="tutorial-grid">
        {tutorials.map((t) => {
          const isPurchased = purchasedIds.includes(t.id);
          return (
            <div key={t.id} className="tutorial-card">
              <div className="card-image">
                {t.thumbnailUrl ? <img src={t.thumbnailUrl} alt={t.title} /> : <div className="no-thumb">No Thumbnail</div>}
                {!isPurchased && <div className="premium-tag">Premium</div>}
              </div>
              <div className="card-content">
                <h3>{t.title}</h3>
                <p>{t.description}</p>
                <div className="card-footer">
                  <span className="price">Rs. {t.price}</span>
                  <div className="actions">
                    {isPurchased ? (
                      <button className="watch-btn" onClick={() => setSelected(t)}>Watch Now</button>
                    ) : (
                      <>
                        <button className="pay-btn" onClick={() => initiatePayment(t)}>Pay Now</button>
                        <button className="watch-btn locked" onClick={() => handleWatch(t)}>Watch</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Player Modal */}
      {selected && (
        <div className="video-modal" onClick={() => setSelected(null)}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected.title}</h3>
              <button className="close-btn" onClick={() => setSelected(null)}>&times;</button>
            </div>
            <video
              src={selected.videoUrl}
              controls
              autoPlay
              className="video-player"
            />
          </div>
        </div>
      )}

      {/* eSewa Payment Modal (Simulation) */}
      {showPaymentModal && paymentTutorial && (
        <div className="payment-simulation-modal">
          <div className="modal-content">
            <div className="esewa-header">
              <img src="https://esewa.com.np/common/images/esewa-logo.png" alt="eSewa" />
              <h3>eSewa Payment Simulation</h3>
            </div>

            {paymentStep === 'credentials' && (
              <div className="payment-body">
                <p>Purchasing: <strong>{paymentTutorial.title}</strong></p>
                <p className="amount">Amount: Rs. {paymentTutorial.price}</p>

                <div className="test-info">
                  <p>Use Test Credentials:</p>
                  <code>test@esewa.com.np / test123</code>
                </div>

                <div className="input-group">
                  <label>eSewa ID (Email/Phone)</label>
                  <input
                    type="text"
                    value={testCredentials.email}
                    onChange={e => setTestCredentials({ ...testCredentials, email: e.target.value })}
                    placeholder="example@email.com"
                  />
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={testCredentials.password}
                    onChange={e => setTestCredentials({ ...testCredentials, password: e.target.value })}
                    placeholder="*******"
                  />
                </div>

                <div className="modal-actions">
                  <button className="cancel-btn" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                  <button className="confirm-btn" onClick={simulateEsewaPayment}>Login & Pay</button>
                </div>
              </div>
            )}

            {paymentStep === 'processing' && (
              <div className="payment-body processing">
                <div className="spinner"></div>
                <p>Processing your payment...</p>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="payment-body success">
                <div className="success-icon">✓</div>
                <h3>Payment Successful!</h3>
                <p>You can now watch the tutorial.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
