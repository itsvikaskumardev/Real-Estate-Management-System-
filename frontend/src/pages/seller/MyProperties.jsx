import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config";
import { useAuth } from "../../context/AuthContext";
import {
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiExternalLink,
  HiEye,
  HiOutlineLibrary,
  HiOutlineCheckCircle,
  HiOutlineSearch
} from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";
import PropertyCard from "../../components/common/PropertyCard";
import { useNotification } from "../../context/NotificationContext";
import { myPropertiesStyles as s } from "../../assets/dummyStyles";

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const { connection } = useNotification();
  const location = useLocation();
  const [statusFilter, setStatusFilter] = useState(location.state?.statusFilter || "");
  const [verificationFilter, setVerificationFilter] = useState(location.state?.verificationFilter || "");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMyProperties();
  }, []);

  useEffect(() => {
    if (location.state) {
      if (location.state.statusFilter !== undefined) setStatusFilter(location.state.statusFilter);
      if (location.state.verificationFilter !== undefined) setVerificationFilter(location.state.verificationFilter);
    } else {
      setStatusFilter("");
      setVerificationFilter("");
    }
  }, [location.key]);

  useEffect(() => {
    if (!connection) return;

    const handlePropertyStatusUpdate = ({ propertyId, isVerified }) => {
      setProperties((prev) => 
        prev.map((p) => 
          (p.id || p._id) === propertyId 
            ? { ...p, isVerified } 
            : p
        )
      );
    };

    connection.on("PropertyStatusUpdated", handlePropertyStatusUpdate);

    return () => {
      connection.off("PropertyStatusUpdated", handlePropertyStatusUpdate);
    };
  }, [connection]);

  const fetchMyProperties = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/property/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const props = Array.isArray(res.data)
        ? res.data
        : res.data.properties || [];
      setProperties(props);
      setLoading(false);
    } catch (err) {
      setError("Failed to load your properties.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?"))
      return;
    try {
      await axios.delete(`${API_URL}/api/property/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties(properties.filter((p) => (p.id || p._id) !== id));
    } catch (err) {
      alert("Failed to delete property.");
    }
  };
  const filteredProperties = properties.filter((p) => {
    // Status filter
    if (statusFilter && p.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
    
    // Verification filter
    if (verificationFilter === "true" && !p.isVerified) return false;
    if (verificationFilter === "false" && p.isVerified) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const titleMatch = p.title?.toLowerCase().includes(query);
      const cityMatch = p.city?.toLowerCase().includes(query);
      if (!titleMatch && !cityMatch) return false;
    }
    
    return true;
  });
  if (loading)
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );
  return (
    <div className={s.fadeIn}>
      <div className={s.fadeIn}>
        <div className={s.header}>
          <div>
            <h1 className={s.heading}>My Listings</h1>
            <p className={s.subheading}>
              Manage your listed properties and their status.
            </p>
          </div>
          <Link to="/add-property" className={s.addButton}>
            Add New Listing
          </Link>
        </div>

        {/* Filter Bar */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Search</label>
            <div style={{ position: 'relative' }}>
              <HiOutlineSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
              <input
                type="text"
                placeholder="Search by title or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', width: '100%', outline: 'none' }}
              />
            </div>
          </div>
          
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Verification</label>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
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
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', width: '100%', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
            >
              <option value="">All Types</option>
              <option value="Sale">For Sale</option>
              <option value="Rent">For Rent</option>
              <option value="Sold">Sold</option>
            </select>
          </div>
        </div>

        <div className={s.content}>
          {!Array.isArray(filteredProperties) || filteredProperties.length === 0 ? (
            <div className={s.emptyCard}>
              <div className={s.emptyIconWrapper}>
                <HiOutlineLibrary size={40} color="#94a3b8" />
              </div>
              <h2 className={s.emptyTitle}>No properties found</h2>
              <p className={s.emptyText}>
                Start your journey by adding your first property listing.
              </p>
              <Link to="/add-property" className={s.emptyButton}>
                Add Your First Listing
              </Link>
            </div>
          ) : (
            <div className={s.grid}>
              {filteredProperties.map((p) => (
                <PropertyCard
                  key={(p.id || p._id)}
                  property={p}
                  renderActions={() => (
                    <>
                      <div className={s.actionContainer}>
                        {p.status?.toLowerCase() !== "sold" && !p.isVerified && (
                          <Link
                            to={`/edit-property/${(p.id || p._id)}`}
                            className={s.editButton}
                          >
                            <HiOutlinePencilAlt /> Edit
                          </Link>
                        )}
                        {p.status?.toLowerCase() !== "sold" && !p.isVerified && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete((p.id || p._id));
                            }}
                            className={s.deleteButton}
                          >
                            <HiOutlineTrash />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProperties;
