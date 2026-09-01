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
                <div key={request.id} className={s.requestCard}>
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

                  <button
                    onClick={() => handleApprove(request.id)}
                    className={s.approveButton}
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
