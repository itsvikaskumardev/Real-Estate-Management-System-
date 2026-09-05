import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import API_URL from "../../config";
import { useAuth } from "../../context/AuthContext";
import { HiOutlineCalendar, HiOutlineClock, HiCheckCircle, HiXCircle, HiCheck, HiX, HiOutlineLocationMarker } from "react-icons/hi";
import { myPropertiesStyles as s, myInquiriesStyles as inqStyles } from "../../assets/dummyStyles";

const VisitRequests = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchVisits();
  }, [token]);

  const fetchVisits = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/seller/visits`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVisits(res.data.visits);
    } catch (err) {
      console.error("Failed to fetch site visits", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.patch(`${API_URL}/api/seller/visits/${id}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Visit ${status.toLowerCase()}!`);
      // Update local state
      setVisits(visits.map(v => v.id === id ? { ...v, status } : v));
    } catch (err) {
      alert("Failed to update visit status.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved": return { bg: "#dcfce7", text: "#166534", icon: <HiCheckCircle /> };
      case "Rejected": return { bg: "#fee2e2", text: "#991b1b", icon: <HiXCircle /> };
      case "Completed": return { bg: "#dbeafe", text: "#1e3a8a", icon: <HiCheckCircle /> };
      default: return { bg: "#fef3c7", text: "#92400e", icon: <HiOutlineClock /> };
    }
  };

  if (loading) {
    return <div className="loader-full-page"><div className="loader"></div></div>;
  }

  return (
    <div className={`${inqStyles.containerFadeIn} ${inqStyles.pt0}`}>
      <div className={inqStyles.mb12}>
        <h1 className={inqStyles.heading}>Visit Requests</h1>
        <p className={inqStyles.textMuted}>Review and manage property visit requests from interested buyers.</p>
      </div>

      {visits.length === 0 ? (
        <div className={s.emptyStateContainer}>
          <div className={s.emptyStateIcon} style={{ background: '#f1f5f9', color: '#64748b' }}>
            <HiOutlineCalendar size={32} />
          </div>
          <h3 className={s.emptyStateTitle}>No Visit Requests</h3>
          <p className={s.emptyStateText}>You don't have any pending site visit requests at the moment.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
          {visits.map((visit) => {
            const statusConfig = getStatusColor(visit.status);
            return (
              <div key={visit.id} style={{ display: 'flex', backgroundColor: '#fff', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', transition: 'box-shadow 0.2s ease-in-out' }} 
                   onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'} 
                   onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}>
                
                {/* Image Placeholder (Optional visual pop like SellerOffers) */}
                <div style={{ width: '200px', height: '100%', minHeight: '200px', flexShrink: 0, backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #e2e8f0' }}>
                   <HiOutlineLocationMarker size={48} color="#cbd5e1" />
                </div>

                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <Link to={`/property/${visit.propertyId}`} style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', textDecoration: 'none' }}>
                        {visit.propertyTitle}
                      </Link>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: statusConfig.bg, color: statusConfig.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {statusConfig.icon} {visit.status}
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px', letterSpacing: '0.05em' }}>Requested By</div>
                        <div style={{ fontSize: '1rem', color: '#0f172a', fontWeight: '600' }}>{visit.buyerName}</div>
                        <div style={{ fontSize: '0.875rem', color: '#475569', marginTop: '2px' }}>{visit.buyerEmail}</div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px', letterSpacing: '0.05em' }}>Date & Time</div>
                        <div style={{ fontSize: '1rem', color: '#0f172a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <HiOutlineCalendar color="#3b82f6" /> {new Date(visit.visitDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <HiOutlineClock color="#3b82f6" /> {new Date(visit.visitDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    {visit.message && (
                      <div style={{ fontSize: '0.875rem', color: '#475569', backgroundColor: '#fff', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid #3b82f6', fontStyle: 'italic', boxShadow: 'inset 0 0 0 1px #e2e8f0' }}>
                        "{visit.message}"
                      </div>
                    )}
                  </div>
                  
                  {visit.status === 'Pending' && (
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                      <button 
                        onClick={() => handleUpdateStatus(visit.id, 'Approved')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', flex: 1, transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
                      >
                        <HiCheck size={20} /> Approve Visit
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(visit.id, 'Rejected')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', flex: 1, transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                      >
                        <HiX size={20} /> Decline
                      </button>
                    </div>
                  )}
                  {visit.status === 'Approved' && (
                    <div style={{ marginTop: '1.5rem', display: 'flex' }}>
                      <button 
                        onClick={() => handleUpdateStatus(visit.id, 'Completed')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', width: '100%', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                      >
                        <HiCheckCircle size={20} /> Mark as Completed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VisitRequests;
