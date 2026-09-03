import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import API_URL from "../../config";
import { useAuth } from "../../context/AuthContext";
import {
  HiOutlineTrash,
  HiOutlineExternalLink,
  HiOutlineLocationMarker,
  HiOutlineCurrencyRupee,
  HiOutlineTag,
  HiOutlineCheckCircle,
  HiOutlineSearch,
  HiOutlineFilter,
} from "react-icons/hi";
import { Link } from "react-router-dom";
import PropertyCard from "../../components/common/PropertyCard";
import { adminPropertiesStyles as s } from "../../assets/dummyStyles";

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  
  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Pagination state
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search query to avoid spamming the API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/admin/properties`, {
          params: {
            search: debouncedSearch || undefined,
            status: statusFilter || undefined,
            isVerified: verificationFilter === "true" ? true : verificationFilter === "false" ? false : undefined,
            pageNumber,
            pageSize: 12
          },
          headers: { Authorization: `Bearer ${token}` },
        });
        const props = Array.isArray(res.data)
          ? res.data
          : res.data.properties || [];
        setProperties(props);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.count || 0);
      } catch (err) {
        console.error("Failed to load properties:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [debouncedSearch, statusFilter, verificationFilter, pageNumber, token]);

  const confirmDelete = (id) => {
    setPropertyToDelete(id);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!propertyToDelete) return;
    try {
      await axios.delete(`${API_URL}/api/admin/properties/${propertyToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties(properties.filter((p) => p.id !== propertyToDelete));
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    } catch (err) {
      alert("Failed to delete property");
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    }
  };

  const handleVerify = async (id, approve) => {
    try {
      await axios.patch(`${API_URL}/api/admin/properties/${id}/verify`, { approve }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties(properties.map(p => p.id === id ? { ...p, isVerified: approve } : p));
    } catch (err) {
      alert("Failed to verify property");
    }
  };

  if (loading)
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );

  return (
    <>
      <div className={s.headerContainer}>
        <h1 className={s.pageTitle}>Property Moderation</h1>
        <p className={s.pageSubtitle}>
          Review and manage all property listings across the platform.
        </p>
      </div>

      {/* Filter Bar */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Search</label>
          <div style={{ position: 'relative' }}>
            <HiOutlineSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input
              type="text"
              placeholder="Search by title, city, or seller..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPageNumber(1);
              }}
              style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', width: '100%', outline: 'none' }}
            />
          </div>
        </div>
        
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Verification</label>
          <select
            value={verificationFilter}
            onChange={(e) => {
              setVerificationFilter(e.target.value);
              setPageNumber(1);
            }}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', width: '100%', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
          >
            <option value="">All Statuses</option>
            <option value="true">Verified Only</option>
            <option value="false">Unverified Only</option>
          </select>
        </div>

        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Listing Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPageNumber(1);
            }}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', width: '100%', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
          >
            <option value="">All Types</option>
            <option value="Sale">For Sale</option>
            <option value="Rent">For Rent</option>
            <option value="Sold">Sold</option>
          </select>
        </div>
      </div>

      <div className={s.headerContainer}>
        {/* same as headerContainer for spacing, could be separate but it's mb-12 */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div className={s.loader}></div>
          </div>
        ) : properties.length === 0 ? (
          <div className={s.emptyStateCard}>
            No properties found matching your criteria.
          </div>
        ) : (
          <div className={s.propertiesGrid}>
            {properties.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                renderActions={() => (
                  <div className={s.actionWrapper}>
                    <div className={s.sellerInfo} style={{ display: "flex", alignItems: "center", gap: "12px", flexDirection: "row" }}>
                      <img 
                        src={p.seller?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.seller?.name || "Unknown")}&background=0d6e59&color=fff&size=40`}
                        alt="Seller"
                        style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                      />
                      <div>
                        <div className={s.sellerName}>
                          Seller: {p.seller?.name || "Unknown"}
                        </div>
                        <div className={s.sellerEmail}>{p.seller?.email}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {!p.isVerified ? (
                        <button 
                          onClick={() => handleVerify(p.id, true)}
                          style={{ padding: '4px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                        >
                          Approve
                        </button>
                      ) : (
                        <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <HiOutlineCheckCircle /> Verified
                        </span>
                      )}
                    </div>

                    <div className={s.buttonGroup}>
                      <Link to={`/property/${p.id}`} className={s.viewLink}>
                        <HiOutlineExternalLink size={16} />
                      </Link>
                      <button
                        onClick={() => confirmDelete(p.id)}
                        className={s.deleteButton}
                      >
                        <HiOutlineTrash size={16} />
                      </button>
                    </div>
                  </div>
                )}
              />
            ))}
          </div>
        )}
        
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
            <button 
              onClick={() => { setPageNumber(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={pageNumber === 1}
              style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: pageNumber === 1 ? '#f8fafc' : '#fff', color: pageNumber === 1 ? '#94a3b8' : '#0f172a', cursor: pageNumber === 1 ? 'not-allowed' : 'pointer', fontWeight: '500' }}
            >
              Previous
            </button>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', fontWeight: '500', color: '#475569' }}>
              Page {pageNumber} of {totalPages}
            </div>
            <button 
              onClick={() => { setPageNumber(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={pageNumber === totalPages}
              style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: pageNumber === totalPages ? '#f8fafc' : '#fff', color: pageNumber === totalPages ? '#94a3b8' : '#0f172a', cursor: pageNumber === totalPages ? 'not-allowed' : 'pointer', fontWeight: '500' }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && createPortal(
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "0.5rem", width: "90%", maxWidth: "400px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem", color: "#1e293b" }}>Delete Property?</h3>
            <p style={{ color: "#475569", marginBottom: "1.5rem" }}>
              Are you sure you want to delete this property? This action is permanent.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ padding: "0.5rem 1rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", backgroundColor: "#f8fafc", color: "#475569", cursor: "pointer", transition: "all 0.2s" }}
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                style={{ padding: "0.5rem 1rem", border: "none", borderRadius: "0.375rem", backgroundColor: "#ef4444", color: "#fff", cursor: "pointer", transition: "all 0.2s" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default AdminProperties;
