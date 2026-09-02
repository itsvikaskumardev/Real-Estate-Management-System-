import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../../config";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineCurrencyRupee,
  HiOutlineCheckCircle,
  HiOutlineClock
} from "react-icons/hi";
import Navbar from "../../components/common/Navbar";
import { profileStyles as ps, sellerDashboardStyles as s } from "../../assets/dummyStyles";

const BuyerDashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState({
    totalPropertiesPurchased: 0,
    totalAmountSpent: 0,
    purchasedProperties: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/buyer/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to load buyer dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <div className="loader-full-page"><div className="loader"></div></div>;

  const statCards = [
    {
      title: "Total Properties",
      value: data.totalPropertiesPurchased.toString(),
      icon: HiOutlineHome,
      color: "#0d6e59",
    },
    {
      title: "Total Spent",
      value: `₹${data.totalAmountSpent.toLocaleString("en-IN")}`,
      icon: HiOutlineCurrencyRupee,
      color: "#2563eb",
    }
  ];

  return (
    <div className={ps.containerWrapper(token ? 'buyer' : null)}>
      <Navbar />
      <div className={ps.mainContainer(token ? 'buyer' : null)}>
      <header className={s.header}>
        <div className={s.headerLeft}>
          <h1 className={s.headerTitle}>Buyer Dashboard</h1>
          <p className={s.headerSubtitle}>
            Track your property purchases and overview.
          </p>
        </div>
      </header>

      <div className={s.statsGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {statCards.map((card, i) => (
          <div key={i} className={s.statCard} style={{ "--card-color": card.color }}>
            <div className={s.statIconWrapper}>
              <card.icon size={20} />
            </div>
            <div className={s.statTitle}>{card.title}</div>
            <div className={s.statValue}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className={s.listingsSection} style={{ marginTop: '2rem' }}>
        <div className={s.listingsHeader}>
          <h2 className={s.listingsTitle}>My Purchased Properties</h2>
        </div>

        {data.purchasedProperties.length === 0 ? (
          <div className={s.emptyListings}>
            You haven't purchased any properties yet.
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflowX: 'auto', border: '1px solid #e2e8f0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem' }}>Property</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem' }}>Location</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem' }}>Price</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem' }}>Date</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.purchasedProperties.map((p) => (
                  <tr key={p.propertyId} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.title} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineHome size={20} color="#94a3b8" />
                          </div>
                        )}
                        <Link to={`/property/${p.propertyId}`} style={{ fontWeight: '600', color: '#0f172a', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#0d6e59'} onMouseLeave={(e) => e.target.style.color = '#0f172a'}>
                          {p.title}
                        </Link>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', color: '#475569', fontSize: '0.875rem' }}>{p.location}</td>
                    <td style={{ padding: '1.25rem 1.5rem', color: '#0f172a', fontWeight: '500' }}>₹{p.price.toLocaleString("en-IN")}</td>
                    <td style={{ padding: '1.25rem 1.5rem', color: '#475569', fontSize: '0.875rem' }}>{new Date(p.transactionDate).toLocaleDateString()}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      {p.status === "Completed" ? (
                        <span style={{ color: '#047857', backgroundColor: '#d1fae5', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <HiOutlineCheckCircle /> {p.status}
                        </span>
                      ) : (
                        <span style={{ color: '#b45309', backgroundColor: '#fef3c7', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <HiOutlineClock /> {p.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
