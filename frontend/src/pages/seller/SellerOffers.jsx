import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config";
import { useAuth } from "../../context/AuthContext";
import { HiCheck, HiX, HiCurrencyRupee } from "react-icons/hi";
import { toast } from "react-hot-toast";
import { myPropertiesStyles as s, myInquiriesStyles as inqStyles } from "../../assets/dummyStyles";
import { Link } from "react-router-dom";

const SellerOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/seller/offers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffers(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load offers.");
      setLoading(false);
    }
  };

  const updateOfferStatus = async (offerId, status) => {
    try {
      await axios.put(`${API_URL}/api/seller/offers/${offerId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Offer ${status.toLowerCase()} successfully!`);
      setOffers(offers.map(o => o.id === offerId ? { ...o, status } : o));
    } catch (err) {
      toast.error("Failed to update offer status.");
    }
  };

  if (loading)
    return (
      <div className="loader-full-page">
        <div className="loader"></div>
      </div>
    );

  if (error)
    return (
      <div className={s.pageContainer}>
        <div className={s.errorMessage}>{error}</div>
      </div>
    );

  return (
    <div className={`${inqStyles.containerFadeIn} ${inqStyles.pt0}`}>
      <div className={inqStyles.mb12}>
        <h1 className={inqStyles.heading}>Offers Received</h1>
        <p className={inqStyles.textMuted}>Review and manage offers received for your properties.</p>
      </div>

      {offers.length === 0 ? (
        <div className={s.emptyStateContainer}>
          <div className={s.emptyStateIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
            <HiCurrencyRupee size={32} />
          </div>
          <h3 className={s.emptyStateTitle}>No Offers Yet</h3>
          <p className={s.emptyStateText}>
            You haven't received any offers from buyers yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
          {offers.map((offer) => (
            <div key={offer.id} style={{ display: 'flex', backgroundColor: '#fff', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '250px', height: '100%', minHeight: '180px', flexShrink: 0 }}>
                <img 
                  src={offer.propertyImageUrl || 'https://via.placeholder.com/250x180?text=No+Image'} 
                  alt={offer.propertyTitle}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Link to={`/property/${offer.propertyId}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.25rem' }}>{offer.propertyTitle}</h3>
                      </Link>
                      <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Listed Price: ₹{offer.propertyPrice.toLocaleString("en-IN")}</p>
                    </div>
                    <div style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      backgroundColor: offer.status === 'Accepted' ? '#d1fae5' : offer.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                      color: offer.status === 'Accepted' ? '#059669' : offer.status === 'Rejected' ? '#dc2626' : '#d97706'
                    }}>
                      {offer.status}
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Offer From: <span style={{ fontWeight: '500', color: '#0f172a' }}>{offer.buyerName}</span></span>
                      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Date: {new Date(offer.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>
                      ₹{offer.offerAmount.toLocaleString("en-IN")}
                    </div>
                    {offer.message && (
                      <p style={{ fontSize: '0.875rem', color: '#475569', fontStyle: 'italic', borderLeft: '2px solid #cbd5e1', paddingLeft: '0.5rem' }}>
                        "{offer.message}"
                      </p>
                    )}
                  </div>
                </div>

                {offer.status === 'Pending' && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button 
                      onClick={() => updateOfferStatus(offer.id, 'Accepted')}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', flex: 1 }}
                    >
                      <HiCheck size={20} /> Accept Offer
                    </button>
                    <button 
                      onClick={() => updateOfferStatus(offer.id, 'Rejected')}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', flex: 1 }}
                    >
                      <HiX size={20} /> Reject Offer
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOffers;
