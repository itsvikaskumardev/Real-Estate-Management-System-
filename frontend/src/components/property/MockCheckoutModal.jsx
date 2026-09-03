import React, { useState } from "react";
import { HiX, HiOutlineCreditCard, HiOutlineLockClosed } from "react-icons/hi";
import { toast } from "react-hot-toast";

const MockCheckoutModal = ({ property, onClose, onConfirm }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "4242 4242 4242 4242",
    expiry: "12/26",
    cvc: "123",
    name: "John Doe",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    onConfirm();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '1rem' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '1rem', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineCreditCard /> Secure Checkout
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.25rem' }}>
            <HiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          
          {/* Order Summary */}
          <div style={{ backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Summary</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ color: '#0f172a', fontWeight: '500' }}>{property.title}</span>
              <span style={{ color: '#0f172a', fontWeight: 'bold' }}>₹{property.price.toLocaleString("en-IN")}</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
              {property.city}, {property.area}
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#334155', marginBottom: '0.25rem' }}>Name on Card</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                autoComplete="off"
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#334155', marginBottom: '0.25rem' }}>Card Details</label>
              <div style={{ display: 'flex', flexDirection: 'column', borderRadius: '0.375rem', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: 'none', borderBottom: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                  placeholder="Card Number"
                />
                <div style={{ display: 'flex' }}>
                  <input
                    type="text"
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleChange}
                    required
                    style={{ flex: 1, padding: '0.75rem', border: 'none', borderRight: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                    placeholder="MM/YY"
                  />
                  <input
                    type="text"
                    name="cvc"
                    value={formData.cvc}
                    onChange={handleChange}
                    required
                    style={{ width: '100px', padding: '0.75rem', border: 'none', outline: 'none', fontSize: '1rem' }}
                    placeholder="CVC"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: isProcessing ? '#94a3b8' : '#059669',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <HiOutlineLockClosed size={20} />
                  Pay ₹{property.price.toLocaleString("en-IN")}
                </>
              )}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem' }}>
              This is a mock checkout for testing purposes. No real transaction occurs.
            </p>
          </form>

        </div>
      </div>
    </div>
  );
};

export default MockCheckoutModal;
