import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API_URL from "../../config";
import { useAuth } from "../../context/AuthContext";
import { HiOutlineBell, HiOutlineTrash, HiOutlineSearch, HiOutlineHome } from "react-icons/hi";

const SavedSearches = () => {
  const [searches, setSearches] = useState([]);
  const [matches, setMatches] = useState({});
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchSearches();
  }, [token]);

  const fetchSearches = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/buyer/saved-searches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearches(res.data);
      
      // Fetch matches for each search
      res.data.forEach(search => {
        fetchMatches(search.id);
      });
    } catch (err) {
      console.error("Failed to fetch saved searches", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/api/buyer/saved-searches/${id}/matches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(prev => ({ ...prev, [id]: res.data.matches }));
    } catch (err) {
      console.error("Failed to fetch matches", err);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}><div className="loader"></div></div>;
  }

  return (
    <>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>Saved Searches & Alerts</h1>
          <p style={{ color: '#64748b' }}>We'll notify you when properties matching these criteria are added.</p>
        </div>
        <Link to="/properties" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', backgroundColor: '#059669', color: 'white', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: '500' }}>
          <HiOutlineSearch size={20} /> Create New Alert
        </Link>
      </div>

      {searches.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px dashed #cbd5e1' }}>
          <HiOutlineBell size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.5rem' }}>No Alerts Set Up</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Save a search from the properties page to get notified about new listings.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {searches.map((search) => (
            <div key={search.id} style={{ backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.25rem' }}>{search.title}</h3>
                  <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                    {search.city && <span>City: <strong>{search.city}</strong></span>}
                    {search.bhk && <span>BHK: <strong>{search.bhk}</strong></span>}
                    {search.maxPrice && <span>Max Price: <strong>₹{search.maxPrice.toLocaleString('en-IN')}</strong></span>}
                    {search.propertyType && <span>Type: <strong>{search.propertyType}</strong></span>}
                  </div>
                </div>
                <div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: search.emailAlertsEnabled ? '#dcfce7' : '#f1f5f9', color: search.emailAlertsEnabled ? '#166534' : '#64748b' }}>
                    <HiOutlineBell /> {search.emailAlertsEnabled ? "Alerts On" : "Alerts Off"}
                  </span>
                </div>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#334155', marginBottom: '1rem' }}>Recent Matches</h4>
                
                {!matches[search.id] ? (
                  <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading matches...</div>
                ) : matches[search.id].length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                    No properties currently match these exact criteria. We'll email you when one gets listed!
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                    {matches[search.id].map(property => (
                      <Link to={`/property/${property.id}`} key={property.id} style={{ flexShrink: 0, width: '280px', borderRadius: '0.5rem', border: '1px solid #e2e8f0', overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <img src={property.imageUrl || "https://placehold.co/400x300"} alt={property.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                        <div style={{ padding: '1rem' }}>
                          <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.25rem' }}>{property.title}</h5>
                          <div style={{ color: '#059669', fontWeight: 'bold', marginBottom: '0.5rem' }}>₹{property.price.toLocaleString('en-IN')}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', gap: '0.5rem' }}>
                            <span>{property.city}</span> • <span>{property.bhk} BHK</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </>
  );
};

export default SavedSearches;
