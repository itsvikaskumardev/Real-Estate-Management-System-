import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import API_URL from "../../config";
import { useAuth } from "../../context/AuthContext";
import { HiOutlineTrash, HiOutlineUserAdd } from "react-icons/hi";
import { adminUsersStyles as s, profileStyles as ps } from "../../assets/dummyStyles";

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal State for custom confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, [token]);

  const fetchAdmins = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.admins || [];
      setAdmins(data);
    } catch (err) {
      console.error("Failed to load admins:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.post(`${API_URL}/api/admin/admins`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setSuccess(res.data.message);
        setAdmins([res.data.admin, ...admins]);
        setFormData({ name: "", email: "", password: "" });
        
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create admin");
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = (id) => {
    setAdminToDelete(id);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!adminToDelete) return;
    try {
      await axios.delete(`${API_URL}/api/admin/users/${adminToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(admins.filter((a) => a.id !== adminToDelete));
      setShowDeleteModal(false);
      setAdminToDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete admin");
      setShowDeleteModal(false);
      setAdminToDelete(null);
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
        <h1 className={s.pageTitle}>Admin Management</h1>
        <p className={s.pageSubtitle}>
          Create and manage administrator accounts for the platform.
        </p>
      </div>

      <div className={s.tableContainer} style={{ marginBottom: "2rem", padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem", color: "#1e293b", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <HiOutlineUserAdd size={24} /> Create New Admin
        </h2>
        {error && <div className={ps.errorMessage} style={{ marginBottom: "1rem" }}>{error}</div>}
        {success && <div style={{ backgroundColor: "#d1fae5", color: "#065f46", padding: "0.75rem", borderRadius: "0.375rem", marginBottom: "1rem" }}>{success}</div>}
        
        <form onSubmit={handleCreateAdmin} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", alignItems: "end" }}>
          <div>
            <label className={ps.label}>Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className={ps.input}
              placeholder="Admin Name"
            />
          </div>
          <div>
            <label className={ps.label}>Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className={ps.input}
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className={ps.label}>Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className={ps.input}
              placeholder="Strong Password"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={creating}
              className={ps.saveButton}
              style={{ width: "100%", height: "2.5rem" }}
            >
              {creating ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </div>

      <div className={s.tableContainer}>
        {admins.length === 0 ? (
          <div className={s.emptyStateCard}>No admins found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className={s.table}>
              <thead className={s.thead}>
                <tr className={s.tableRow}>
                  <th className={s.thUserInfo}>Admin Info</th>
                  <th className={s.thContact}>Contact</th>
                  <th className={s.thStatus}>Status</th>
                  <th className={s.thActions}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map((admin) => (
                  <tr key={admin.id} className={s.tableRow}>
                    <td className={s.tdUserInfo}>
                      <div className="flex items-center gap-4">
                        <div className={s.userAvatar}>
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={s.userInfoName}>{admin.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className={s.tdContact}>
                      <div className={s.contactWrapper}>
                        <div className={s.contactEmail}>
                           {admin.email}
                        </div>
                        {admin.phone && (
                          <div className={s.contactPhone}>
                            {admin.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={s.tdStatus}>
                      <span className={s.statusBadgeActive}>Active</span>
                    </td>
                    <td className={s.tdActions}>
                      <div className={s.actionsWrapper}>
                        {admin.id !== user.id && (
                          <button
                            onClick={() => confirmDelete(admin.id)}
                            className={s.deleteButton}
                            title="Delete Admin"
                          >
                            <HiOutlineTrash size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && createPortal(
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "0.5rem", width: "90%", maxWidth: "400px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem", color: "#1e293b" }}>Delete Admin?</h3>
            <p style={{ color: "#475569", marginBottom: "1.5rem" }}>
              Are you sure you want to delete this admin? This action is permanent.
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

export default AdminManagement;
