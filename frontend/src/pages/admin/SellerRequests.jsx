import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import API_URL from "../../config";
import { useAuth } from "../../context/AuthContext";
import {
  HiOutlineCheckCircle,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineCheck,
  HiOutlineX
} from "react-icons/hi";
import { sellerRequestsStyles as s } from "../../assets/dummyStyles";

const SellerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/pending-sellers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setRequests(res.data.pendingSellers);
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to load seller requests:", err);
        setLoading(false);
      }
    };
    fetchRequests();
  }, [token]);

  const handleApprove = async (id) => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/admin/approve-seller/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.success) {
        setRequests(requests.filter((req) => req.id !== id));
        setShowSuccessModal(true);
      }
    } catch (err) {
      alert("Failed to approve seller");
    }
  };

  const handleVerifyDocument = async (docId, approve, sellerId) => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/admin/seller/documents/${docId}/verify`,
        { approve },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        // Update local state
        setRequests(requests.map(req => {
          if (req.id === sellerId) {
            const updatedDocs = req.documents.map(d => 
              d.id === docId ? { ...d, status: approve ? 'Verified' : 'Rejected' } : d
            );
            return { 
              ...req, 
              documents: updatedDocs,
              onboardingStatus: approve ? req.onboardingStatus : 'Incomplete' // IF rejected, status goes to incomplete
            };
          }
          return req;
        }));
      }
    } catch (err) {
      alert("Failed to verify document");
    }
  };

  const handleSecureView = async (docId) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/seller/documents/${docId}/view`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob' // Important to handle the binary stream
      });
      const url = URL.createObjectURL(res.data);
      window.open(url, '_blank');
      // Revoke the object URL after a short delay to free memory
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error(err);
      alert("Failed to securely fetch document. It may have been deleted.");
    }
  };

  if (loading)
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );

  return (
    <div className={s.container}>
      <div className={s.headerContainer}>
        <h1 className={s.pageTitle}>Seller Verification</h1>
        <p className={s.pageSubtitle}>
          Review and approve new seller registration requests.
        </p>
      </div>

      <div className={s.card}>
        <div className={s.cardInner}>
          <h2 className={s.sectionTitle}>
            Pending Requests ({requests.length})
          </h2>

          {requests.length === 0 ? (
            <div className={s.emptyState}>
              <HiOutlineCheckCircle size={48} className={s.emptyStateIcon} />
              <p>No pending seller requests at the moment.</p>
            </div>
          ) : (
            <div className={s.requestGrid}>
              {requests.map((request) => (
                <div key={request.id} className={s.requestCard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className={s.requestHeader}>
                    <div className={s.avatar}>
                      {request.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className={s.requestName}>{request.name}</div>
                      <div className={s.requestDate}>
                        <HiOutlineClock /> Joined{" "}
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '13px', marginTop: '4px', color: request.onboardingStatus === 'PendingReview' ? '#eab308' : '#64748b', fontWeight: 'bold' }}>
                        Onboarding: {request.onboardingStatus || 'Incomplete'}
                      </div>
                    </div>
                  </div>

                  <div className={s.contactInfo}>
                    <div className={s.contactItem}>
                      <HiOutlineMail size={18} className="text-primary" />{" "}
                      {request.email}
                    </div>
                    {request.phone && (
                      <div className={s.contactItem}>
                        <HiOutlinePhone size={18} className="text-primary" />{" "}
                        {request.phone}
                      </div>
                    )}
                  </div>

                  {/* Documents Section */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: 'auto' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.75rem' }}>Attached Documents</h4>
                    {(!request.documents || request.documents.length === 0) ? (
                      <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '6px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                        <p style={{ fontSize: '13px', color: '#94a3b8' }}>No documents uploaded yet.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {request.documents.map(doc => (
                          <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{doc.documentType}</div>
                              <div style={{ fontSize: '11px', fontWeight: '600', color: doc.status === 'Verified' ? '#059669' : doc.status === 'Rejected' ? '#dc2626' : '#d97706' }}>
                                Status: {doc.status}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <button 
                                onClick={() => handleSecureView(doc.id)} 
                                title="View Document Securely"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', backgroundColor: '#f1f5f9', color: '#0ea5e9', borderRadius: '4px', transition: 'background-color 0.2s', border: 'none', cursor: 'pointer' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                              >
                                <HiOutlineEye size={18} />
                              </button>
                              {doc.status !== 'Verified' && doc.status !== 'Rejected' && (
                                <>
                                  <button 
                                    onClick={() => handleVerifyDocument(doc.id, true, request.id)} 
                                    title="Approve Document"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', height: '32px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s', fontSize: '13px', fontWeight: '500' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    onClick={() => handleVerifyDocument(doc.id, false, request.id)} 
                                    title="Reject Document"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', height: '32px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s', fontSize: '13px', fontWeight: '500' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleApprove(request.id)}
                    className={s.approveButton}
                    disabled={request.onboardingStatus !== 'PendingReview' || request.documents?.some(d => d.status !== 'Verified')}
                    style={{ opacity: (request.onboardingStatus !== 'PendingReview' || request.documents?.some(d => d.status !== 'Verified')) ? 0.5 : 1 }}
                  >
                    <HiOutlineCheckCircle size={20} />
                    Approve Seller
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && createPortal(
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "0.5rem", width: "90%", maxWidth: "400px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              <HiOutlineCheckCircle size={48} style={{ color: "#10b981" }} />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem", color: "#1e293b" }}>Success</h3>
            <p style={{ color: "#475569", marginBottom: "1.5rem" }}>
              Seller approved successfully!
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={() => setShowSuccessModal(false)}
                style={{ padding: "0.5rem 1.5rem", border: "none", borderRadius: "0.375rem", backgroundColor: "#059669", color: "#fff", cursor: "pointer", transition: "all 0.2s", fontWeight: "500" }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SellerRequests;
