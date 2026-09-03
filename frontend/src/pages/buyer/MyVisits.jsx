import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API_URL from "../../config";
import { useAuth } from "../../context/AuthContext";
import { HiOutlineCalendar, HiOutlineClock, HiOutlineLocationMarker, HiCheckCircle, HiXCircle } from "react-icons/hi";

const MyVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/buyer/visits`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVisits(res.data.visits);
      } catch (err) {
        console.error("Failed to fetch site visits", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, [token]);

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
    <>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>My Scheduled Visits</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Track and manage your upcoming property tours.</p>

      {visits.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px dashed #cbd5e1' }}>
          <HiOutlineCalendar size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.5rem' }}>No Visits Scheduled</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>You haven't requested any property visits yet.</p>
          <Link to="/properties" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', backgroundColor: '#059669', color: 'white', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: '500' }}>
            Browse Properties
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {visits.map((visit) => {
            const statusConfig = getStatusColor(visit.status);
            return (
              <div key={visit.id} style={{ display: 'flex', backgroundColor: '#fff', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '200px', flexShrink: 0 }}>
                  <img 
                    src={visit.propertyImage || "https://placehold.co/400x300?text=No+Image"} 
                    alt={visit.propertyTitle} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <Link to={`/property/${visit.propertyId}`} style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', textDecoration: 'none' }}>
                        {visit.propertyTitle}
                      </Link>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: statusConfig.bg, color: statusConfig.text }}>
                        {statusConfig.icon} {visit.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <HiOutlineCalendar /> {new Date(visit.visitDate).toLocaleDateString()}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <HiOutlineClock /> {new Date(visit.visitDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {visit.message && (
                      <p style={{ fontSize: '0.875rem', color: '#475569', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', borderLeft: '3px solid #cbd5e1' }}>
                        "{visit.message}"
                      </p>
                    )}
                  </div>
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Seller: <strong>{visit.sellerName}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {visit.status === 'Pending' && (
                        <button style={{ padding: '6px 12px', fontSize: '0.875rem', borderRadius: '4px', border: '1px solid #ef4444', backgroundColor: 'transparent', color: '#ef4444', cursor: 'pointer' }}>
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </>
  );
};

export default MyVisits;
