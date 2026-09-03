import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../../config";
import { useAuth } from "../../context/AuthContext";
import PropertyCard from "../../components/common/PropertyCard";
import {
  HiOutlineEye,
  HiOutlineUserGroup,
  HiOutlineLibrary,
  HiOutlineCheckCircle,
  HiPlus,
  HiOutlineDownload,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiExternalLink,
  HiOutlineLogout,
  HiOutlineBell,
  HiOutlineCurrencyRupee,
} from "react-icons/hi";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { sellerDashboardStyles as s } from "../../assets/dummyStyles";

const SellerDashboard = () => {
  const { logout, token } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalProperties: 0,
    totalLeads: 0,
    totalSales: 0,
    totalRevenue: 0,
    monthlySales: [],
    propertyTypeStats: []
  });
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, propsRes, inqRes] = await Promise.all([
          axios.get(`${API_URL}/api/property/seller/analytics`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/property/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/inquiry/seller`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setAnalytics(analyticsRes.data.data);
        const props = Array.isArray(propsRes.data)
          ? propsRes.data
          : propsRes.data.properties || [];
        setProperties(props);
        setInquiries(
          Array.isArray(inqRes.data.inquiries)
            ? inqRes.data.inquiries.slice(0, 3)
            : Array.isArray(inqRes.data)
              ? inqRes.data.slice(0, 3)
              : [],
        );
        setLoading(false);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

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


  const handleExport = () => {
    const headers = ["Title", "Location", "Type", "Price", "Status", "Views"];
    const csvRows = properties.map((p) => [
      p.title,
      `${p.area}, ${p.city}`,
      p.propertyType,
      p.price,
      p.status,
      p.views || 0,
    ]);

    const csvContent = [headers, ...csvRows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "property_listings.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading)
    return (
      <div className="loader-full-page">
        <div className="loader"></div>
      </div>
    );

  const statCards = [
    {
      title: "Total Properties",
      value: analytics.totalProperties?.toLocaleString() || "0",
      icon: HiOutlineLibrary,
      color: "#0d6e59",
    },
    {
      title: "Total Leads",
      value: analytics.totalLeads?.toLocaleString() || "0",
      icon: HiOutlineUserGroup,
      color: "#0d6e59",
    },
    {
      title: "Properties Sold",
      value: analytics.totalSales?.toLocaleString() || "0",
      icon: HiOutlineCheckCircle,
      color: "#0d6e59",
    },
    {
      title: "Total Revenue",
      value: `₹${(analytics.totalRevenue || 0).toLocaleString("en-IN")}`,
      icon: HiOutlineCurrencyRupee,
      color: "#0d6e59",
    },
  ];

  const COLORS = ["#0d6e59", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];

  const filteredProperties = Array.isArray(properties)
    ? properties
        .filter(
          (p) =>
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.area.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  return (
    <>
      {/* Header */}
      <header className={s.header}>
        <div className={s.headerLeft}>
          <h1 className={s.headerTitle}>Seller Dashboard</h1>
          <p className={s.headerSubtitle}>
            Manage your property portfolio and track performance.
          </p>
        </div>
        <div className={s.headerActions}>
          <button onClick={handleExport} className={s.exportButton}>
            <HiOutlineDownload size={20} /> Export
          </button>
          <Link to="/add-property" className={s.addButton}>
            <HiPlus size={20} /> Add New
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className={s.statsGrid}>
        {statCards.map((card, i) => (
          <div
            key={i}
            className={s.statCard}
            style={{ "--card-color": card.color }}
          >
            <div className={s.statIconWrapper}>
              <card.icon size={20} />
            </div>
            <div className={s.statTitle}>{card.title}</div>
            <div className={s.statValue}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Advanced Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem' }}>Monthly Revenue (Last 6 Months)</h2>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.monthlySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 100000}L`} />
                <RechartsTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#0d6e59" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem' }}>Properties by Type</h2>
          <div style={{ height: '300px' }}>
            {analytics.propertyTypeStats && analytics.propertyTypeStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.propertyTypeStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.propertyTypeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                No properties yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Listings Section */}
      <div className={s.listingsSection}>
        <div className={s.listingsHeader}>
          <h2 className={s.listingsTitle}>Property Listings</h2>
          <div className={s.searchWrapper}>
            <HiOutlineSearch className={s.searchIcon} />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={s.searchInput}
            />
          </div>
        </div>

        {filteredProperties.length === 0 ? (
          <div className={s.emptyListings}>
            No properties found matching "{searchTerm}".
          </div>
        ) : (
          <>
            <div className={s.propertiesGrid}>
              {filteredProperties.slice(0, 3).map((p) => (
                <PropertyCard
                  key={(p.id || p._id)}
                  property={p}
                  renderActions={() => (
                    <div className={s.propertyActions}>
                      {p.status?.toLowerCase() !== "sold" && (
                        <>
                          <Link
                            to={`/edit-property/${(p.id || p._id)}`}
                            className={s.editButton}
                          >
                            <HiOutlinePencilAlt size={14} /> Edit
                          </Link>
                          <button
                            onClick={() => handleDelete((p.id || p._id))}
                            className={s.deleteButton}
                          >
                            <HiOutlineTrash size={14} /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                />
              ))}
            </div>

            {filteredProperties.length > 3 && (
              <div className={s.showMoreWrapper}>
                <Link to="/my-properties" className={s.showMoreButton}>
                  Show More Listings{" "}
                  <HiOutlinePencilAlt
                    size={18}
                    style={{ transform: "rotate(90deg)" }}
                  />
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Widgets Grid */}
      <div className={s.widgetsGrid}>
        {/* Recent Inquiries */}
        <div className={s.inquiriesWidget}>
          <h2 className={s.widgetTitle}>Recent Lead Inquiries</h2>
          <p className={s.widgetSubtitle}>
            New messages from potential buyers.
          </p>

          <div className={s.inquiriesList}>
            {inquiries.map((inq, i) => (
              <div key={(inq.id || inq._id)} className={s.inquiryItem}>
                <div className={s.inquiryLeft}>
                  <div className={s.inquiryIcon}>
                    <HiOutlineBell size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <div className={s.inquiryName}>
                      {inq.buyer?.name || "Potential Buyer"}
                    </div>
                    <div className={s.inquiryProperty}>
                      {inq.property?.title?.length > 30
                        ? inq.property?.title?.slice(0, 30) + "..."
                        : inq.property?.title}
                    </div>
                  </div>
                </div>
                <div className={s.inquiryRight}>
                  <div className={s.inquiryDate}>
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </div>
                  <span className={s.inquiryStatus(inq.status)}>
                    {inq.status === "read" ? "Read" : "New"}
                  </span>
                </div>
              </div>
            ))}
            {inquiries.length === 0 && (
              <p className={s.noInquiries}>No recent inquiries.</p>
            )}
          </div>
        </div>

        {/* Quick Tips */}
        <div className={s.tipsWidget}>
          <h2 className={s.widgetTitle}>Quick Tips</h2>

          <div className={s.tipsList}>
            <div className={s.tipCardHighViews}>
              <h4 className={s.tipTitleHighViews}>
                <HiOutlineEye size={16} /> High Views!
              </h4>
              <p className={s.tipTextHighViews}>
                Your listings are trending. Try adding video tours to increase
                interest.
              </p>
            </div>

            <div className={s.tipCardMarket}>
              <h4 className={s.tipTitleMarket}>Market Insight</h4>
              <p className={s.tipTextMarket}>
                Properties in your area are selling fast. Your prices are
                competitive.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerDashboard;
