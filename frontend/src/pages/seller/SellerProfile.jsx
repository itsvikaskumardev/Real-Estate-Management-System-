import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../../config";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiCheck,
  HiX,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineClock,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { profileStyles as s, contactStyles as cs } from "../../assets/dummyStyles";

const SellerProfile = () => {
  const { user, setUser, token, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeProfilePic, setRemoveProfilePic] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  useEffect(() => {
    // Refresh user state to get latest onboarding status
    refreshUser();

    const fetchDocuments = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/seller/documents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setDocuments(res.data.documents);
        }
      } catch (err) {
        console.error("Failed to fetch documents", err);
      } finally {
        setDocsLoading(false);
      }
    };
    fetchDocuments();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setRemoveProfilePic(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("phone", formData.phone);
      data.append("address", formData.address);
      if (imageFile) {
        data.append("profilePic", imageFile);
      }
      if (removeProfilePic) {
        data.append("removeProfilePic", "true");
      }

      const res = await axios.put(`${API_URL}/api/user/profile`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        const updatedUser = { ...user, ...res.data.user };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsEditing(false);
        setImageFile(null);
        setImagePreview(null);
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.containerWrapper(user?.role)}>
      <div className={s.mainContainer(user?.role)}>
        <header className={s.header}>
          <h1 className={s.pageTitle}>Seller Profile</h1>
          <p className={s.pageSubtitle}>
            Manage your personal information and view your onboarding documents.
          </p>
        </header>

        <div className={s.card}>
          <div className={s.profileHeader}>
            <div className={s.avatarSection}>
              <div className={s.avatarWrapper}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className={s.avatarImage}
                  />
                ) : !removeProfilePic && user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    className={s.avatarImage}
                  />
                ) : (
                  <span className={s.avatarPlaceholder}>
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              {isEditing && (
                <>
                  <label className={s.uploadButton}>
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <HiOutlineUser size={20} />
                  </label>
                  {(imagePreview ||
                    (!removeProfilePic && user?.profilePic)) && (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                        setRemoveProfilePic(true);
                      }}
                      className={s.removeButton}
                      title="Remove Profile Picture"
                    >
                      <HiX size={20} />
                    </button>
                  )}
                </>
              )}
            </div>
            <div>
              <h2 className={s.userName}>{user?.name}</h2>
              <span className={s.roleBadge}>{user?.role?.toUpperCase()}</span>
              <div style={{ marginTop: '8px', fontSize: '0.875rem', fontWeight: '500', color: user?.onboardingStatus === 'Completed' ? '#059669' : '#d97706' }}>
                Onboarding: {user?.onboardingStatus || 'Incomplete'}
              </div>
            </div>
          </div>

          {error && <div className={s.errorMessage}>{error}</div>}

          {isEditing ? (
            <form onSubmit={handleUpdate} className={s.editForm}>
              <div>
                <label className={s.label}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={s.input}
                  required
                />
              </div>
              <div>
                <label className={s.label}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength="10"
                  pattern="\d*"
                  className={s.input}
                  placeholder="Enter your 10-digit phone number"
                />
              </div>
              <div>
                <label className={s.label}>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={s.textarea}
                  placeholder="Enter your full address"
                ></textarea>
              </div>
              <div className={s.formActions}>
                <button
                  type="submit"
                  disabled={loading}
                  className={s.saveButton}
                >
                  <HiCheck size={20} /> {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setImagePreview(null);
                    setImageFile(null);
                    setRemoveProfilePic(false);
                  }}
                  className={s.cancelButton}
                >
                  <HiX size={20} /> Cancel
                </button>
              </div>
            </form>
          ) : success ? (
            <div className={cs.successContainer} style={{ padding: "3rem", margin: "0 auto", maxWidth: "600px" }}>
              <HiOutlineCheckCircle size={64} className={cs.successIcon} />
              <h2 className={cs.successTitle}>Profile Updated!</h2>
              <p className={cs.successMessage}>
                Your profile has been updated successfully.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className={cs.successButton}
              >
                Close
              </button>
            </div>
          ) : (
            <div className={s.infoSection}>
              <div className={s.infoItem}>
                <div className={s.infoIcon}>
                  <HiOutlineMail size={24} />
                </div>
                <div>
                  <div className={s.infoLabel}>Email Address</div>
                  <div className={s.infoValue}>{user?.email}</div>
                </div>
              </div>

              <div className={s.infoItem}>
                <div className={s.infoIcon}>
                  <HiOutlinePhone size={24} />
                </div>
                <div>
                  <div className={s.infoLabel}>Phone Number</div>
                  <div className={s.infoValue}>
                    {user?.phone || "Not provided"}
                  </div>
                </div>
              </div>

              <div className={s.infoItem}>
                <div className={s.infoIcon}>
                  <HiOutlineLocationMarker size={24} />
                </div>
                <div>
                  <div className={s.infoLabel}>Location / Address</div>
                  <div className={s.infoValue}>
                    {user?.address || "Not provided"}
                  </div>
                </div>
              </div>

              <div className={s.editButtonWrapper}>
                <button
                  onClick={() => setIsEditing(true)}
                  className={s.editProfileButton}
                >
                  Edit Profile Details
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Documents Section */}
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineDocumentText size={24} color="#0d6e59" /> Onboarding Documents
          </h2>
          
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            {docsLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading documents...</div>
            ) : documents.length === 0 ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#64748b' }}>
                <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '50%', marginBottom: '1rem' }}>
                  <HiOutlineDocumentText size={32} color="#94a3b8" />
                </div>
                <p>No documents uploaded yet.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem' }}>Document</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem' }}>Status</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem' }}>Uploaded On</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem' }}>Verified On</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{doc.documentType}</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '2px' }}>{doc.documentName}</div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        {doc.status === "Pending" && <span style={{ color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '500' }}>Pending</span>}
                        {(doc.status === "Uploaded" || doc.status === "UnderReview") && <span style={{ color: '#b45309', backgroundColor: '#fef3c7', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><HiOutlineClock /> Under Review</span>}
                        {doc.status === "Verified" && <span style={{ color: '#047857', backgroundColor: '#d1fae5', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><HiOutlineCheckCircle /> Approved</span>}
                        {doc.status === "Rejected" && <span style={{ color: '#b91c1c', backgroundColor: '#fee2e2', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><HiOutlineExclamationCircle /> Rejected</span>}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', color: '#475569', fontSize: '0.875rem' }}>
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', color: '#475569', fontSize: '0.875rem' }}>
                        {doc.verifiedAt ? new Date(doc.verifiedAt).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                        <a 
                          href={doc.fileUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          title="View Document"
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', backgroundColor: '#f1f5f9', color: '#0ea5e9', borderRadius: '6px', transition: 'background-color 0.2s', textDecoration: 'none' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                        >
                          <HiOutlineEye size={20} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
