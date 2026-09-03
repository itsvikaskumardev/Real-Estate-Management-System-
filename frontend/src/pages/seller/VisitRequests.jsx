import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import API_URL from "../../config";
import { useAuth } from "../../context/AuthContext";
import { HiOutlineCalendar, HiOutlineClock, HiCheckCircle, HiXCircle } from "react-icons/hi";

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
      case "Completed": return { bg: "#f1f5f9", text: "#475569", icon: <HiCheckCircle /> };
      default: return { bg: "#fef3c7", text: "#92400e", icon: <HiOutlineClock /> };
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}><div className="loader"></div></div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>Visit Requests</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Manage buyers requesting to tour your properties.</p>

      {visits.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px dashed #cbd5e1' }}>
          <HiOutlineCalendar size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.5rem' }}>No Visit Requests</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>You don't have any pending site visit requests.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {visits.map((visit) => {
            const statusConfig = getStatusColor(visit.status);
            return (
              <div key={visit.id} style={{ display: 'flex', backgroundColor: '#fff', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <Link to={`/property/${visit.propertyId}`} style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#0f172a', textDecoration: 'none' }}>
                        {visit.propertyTitle}
                      </Link>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: statusConfig.bg, color: statusConfig.text }}>
                        {statusConfig.icon} {visit.status}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>Requested By</div>
                        <div style={{ fontSize: '0.875rem', color: '#334155', fontWeight: '500' }}>{visit.buyerName}</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{visit.buyerEmail}</div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>Date & Time</div>
                        <div style={{ fontSize: '0.875rem', color: '#334155', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <HiOutlineCalendar /> {new Date(visit.visitDate).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <HiOutlineClock /> {new Date(visit.visitDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    {visit.message && (
                      <div style={{ fontSize: '0.875rem', color: '#475569', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', borderLeft: '3px solid #cbd5e1' }}>
                        "{visit.message}"
                      </div>
                    )}
                  </div>
                  
                  {visit.status === 'Pending' && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleUpdateStatus(visit.id, 'Rejected')}
                        style={{ padding: '6px 12px', fontSize: '0.875rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', cursor: 'pointer', fontWeight: '500' }}
                      >
                        Decline
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(visit.id, 'Approved')}
                        style={{ padding: '6px 12px', fontSize: '0.875rem', borderRadius: '4px', border: 'none', backgroundColor: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: '500' }}
                      >
                        Approve Visit
                      </button>
                    </div>
                  )}
                  {visit.status === 'Approved' && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleUpdateStatus(visit.id, 'Completed')}
                        style={{ padding: '6px 12px', fontSize: '0.875rem', borderRadius: '4px', border: 'none', backgroundColor: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: '500' }}
                      >
                        Mark as Completed
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
