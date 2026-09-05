import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../../config";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineUserGroup,
  HiOutlineLibrary,
  HiOutlineCheckCircle,
  HiOutlineTicket,
  HiOutlineTrendingUp,
  HiOutlineViewGrid,
} from "react-icons/hi";
import { adminDashboardStyles as s } from "../../assets/dummyStyles";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    activeListings: 0,
    soldProperties: 0,
    totalPlatformRevenue: 0,
    unverifiedProperties: 0,
  });
  const [health, setHealth] = useState({
    database: { status: "Checking..." },
    mediaStorage: { status: "Checking..." },
    authService: { status: "Checking..." },
    apiGateway: { status: "Checking..." }
  });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AdminDashboard mounted");
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error("Failed to load admin dashboard stats:", err);
      }
      
      try {
        const healthRes = await axios.get(`${API_URL}/api/admin/system-health`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (healthRes.data.success) {
          setHealth(healthRes.data.health);
        }
      } catch (err) {
        console.error("Failed to load system health:", err);
        setHealth({
          database: { status: "Offline" },
          mediaStorage: { status: "Offline" },
          authService: { status: "Offline" },
          apiGateway: { status: "Offline" }
        });
      }
      setLoading(false);
    };
    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers || 0,
      icon: HiOutlineUserGroup,
      color: "#0d9488",
      bg: "#ccfbf1",
      path: "/admin/users",
    },
    {
      title: "Total Properties",
      value: stats.totalProperties || 0,
      icon: HiOutlineLibrary,
      color: "#f59e0b",
      bg: "#fef3c7",
      path: "/admin/properties",
    },
    {
      title: "Active Listings",
      value: stats.activeListings || 0,
      icon: HiOutlineTicket,
      color: "#3b82f6",
      bg: "#dbeafe",
      path: "/admin/properties",
      state: { statusFilter: "Sale" },
    },
    {
      title: "Sold Properties",
      value: stats.soldProperties || 0,
      icon: HiOutlineCheckCircle,
      color: "#10b981",
      bg: "#dcfce7",
      path: "/admin/properties",
      state: { statusFilter: "Sold" },
    },
    {
      title: "Unverified Properties",
      value: stats.unverifiedProperties || 0,
      icon: HiOutlineLibrary,
      color: "#ef4444",
      bg: "#fee2e2",
      path: "/admin/properties",
      state: { verificationFilter: "false" },
    },
    {
      title: "Platform Revenue (2%)",
      value: `₹${(stats.totalPlatformRevenue || 0).toLocaleString("en-IN")}`,
      icon: HiOutlineTrendingUp,
      color: "#8b5cf6",
      bg: "#ede9fe",
    },
  ];

  return (
    <>
      <div className={s.headerContainer}>
        <div>
          <h1 className={s.pageTitle}>Admin Overview</h1>
          <p className={s.pageSubtitle}>
            Welcome back, administrator. Here's today's summary.
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            window.location.reload();
          }}
          className={s.refreshButton}
        >
          Refresh Data
        </button>
      </div>

      <div className={s.statsGrid}>
        {statCards.map((card, i) => (
          <div 
            key={i} 
            className={s.statCard}
            onClick={() => card.path && navigate(card.path, { state: card.state })}
            style={{ cursor: card.path ? "pointer" : "default" }}
          >
            <div
              className={s.statIconContainer}
              style={{ backgroundColor: card.bg, color: card.color }}
            >
              <card.icon size={22} />
            </div>
            <div>
              <div className={s.statTitle}>{card.title}</div>
              <div className={s.statValue}>{typeof card.value === "string" ? card.value : card.value.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={s.secondGrid}>
        <div className={s.systemHealthCard}>
          <h3 className={s.systemHealthTitle}>System Health</h3>
          <div className={s.servicesContainer}>
            {[
              { name: "Database", status: health.database?.status || "Offline" },
              { name: "Media Storage", status: health.mediaStorage?.status || "Offline" },
              { name: "Auth Service", status: health.authService?.status || "Offline" },
              { name: "API Gateway", status: health.apiGateway?.status || "Offline" }
            ].map(
              (service, i) => (
                <div key={i} className={s.serviceItem}>
                  <div className={s.serviceName}>{service.name}</div>
                  <div className={s.statusContainer}>
                    <span className={s.statusDot} style={{ backgroundColor: service.status === "Online" ? "#10b981" : service.status === "Checking..." ? "#f59e0b" : "#ef4444" }}></span>
                    <span className={s.statusText} style={{ color: service.status === "Online" ? "#047857" : service.status === "Checking..." ? "#b45309" : "#b91c1c" }}>{service.status}</span>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        <div className={s.adminToolsCard}>
          <h3 className={s.adminToolsTitle}>Admin Tools</h3>
          <p className={s.adminToolsDesc}>
            Quickly manage platform resources and tasks.
          </p>
          <div className={s.adminToolsButtonsContainer}>
            <button 
              className={s.adminToolButton} 
              style={{ opacity: 0.6, cursor: "not-allowed" }}
              title="System logs are currently written to standard output. Configure a database logger (e.g. Serilog) to view them here."
              onClick={() => alert("System logs are currently only available in the application console. Enable database logging to view them here.")}
            >
              System Logs
            </button>
            <button 
              className={s.adminToolButton} 
              style={{ opacity: 0.6, cursor: "not-allowed" }}
              title="Database backups are managed automatically by the cloud infrastructure."
              onClick={() => alert("Database backups are managed automatically at the infrastructure level (e.g., AWS RDS or Azure SQL). App-level backups are disabled for security.")}
            >
              DB Backup
            </button>
            <button 
              className={s.adminToolButton} 
              style={{ opacity: 0.6, cursor: "not-allowed" }}
              title="Global settings are currently managed via appsettings.json."
              onClick={() => alert("Global platform settings are currently managed via environment variables and appsettings.json.")}
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
