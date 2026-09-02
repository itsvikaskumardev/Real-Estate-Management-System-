import React, { useEffect, useState, useRef } from "react";
import { HiOutlineClock, HiOutlineUpload, HiOutlineCheckCircle, HiOutlineExclamationCircle } from "react-icons/hi";
import axios from "axios";
import API_URL from "../../config";
import { useAuth } from "../../context/AuthContext";
import { pendingApprovalStyles as s } from "../../assets/dummyStyles";

const REQUIRED_DOCS = ["Aadhaar Card", "PAN Card"];

const PendingApproval = () => {
  const { user, token, refreshUser } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  
  // File inputs ref
  const fileInputRefs = useRef({});

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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [token]);

  const handleFileUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(docType);
    const formData = new FormData();
    formData.append("DocumentType", docType);
    formData.append("File", file);

    try {
      await axios.post(`${API_URL}/api/seller/documents/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      await fetchDocuments();
    } catch (err) {
      alert("Failed to upload document");
    } finally {
      setUploading(null);
    }
  };

  const handleSubmitForVerification = async () => {
    try {
      await axios.post(`${API_URL}/api/seller/documents/complete-onboarding`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshUser();
    } catch (err) {
      alert("Failed to submit onboarding");
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className={s.loader}></div></div>;
  }

  const isPendingReview = user?.onboardingStatus === "PendingReview";
  
  // Check if all required docs are at least Uploaded, UnderReview, or Verified
  const allRequiredUploaded = REQUIRED_DOCS.every(reqDoc => {
    const doc = documents.find(d => d.documentType === reqDoc);
    return doc && doc.status !== "NotUploaded" && doc.status !== "Rejected";
  });

  if (isPendingReview) {
    return (
      <div className={s.container}>
        <div className={s.iconCircle}>
          <HiOutlineClock size={48} />
        </div>
        <h1 className={s.heading}>Under Review</h1>
        <p className={s.description}>
          Thank you for uploading your documents. Your seller account is currently under review by our administration team. 
          Approval usually takes less than 24 hours. You'll gain full dashboard access once verified.
        </p>
        <div className={s.buttonGroup}>
          <button onClick={() => refreshUser()} className={s.refreshButtonBase}>
            Check Status Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '3rem 2rem', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#e6f2f0', color: '#0d6e59', marginBottom: '1rem' }}>
          <HiOutlineUpload size={32} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>Complete Your Onboarding</h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto' }}>
          Please upload the following required documents to verify your identity and activate your seller account.
        </p>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Document Name</th>
              <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Verification Status</th>
              <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {REQUIRED_DOCS.map((docType) => {
              const doc = documents.find(d => d.documentType === docType);
              const status = doc?.status || "NotUploaded";
              
              return (
                <tr key={docType} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '1.25rem 1.5rem', color: '#0f172a', fontWeight: '500', fontSize: '1rem' }}>
                    {docType}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    {status === "NotUploaded" && <span style={{ color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '500' }}>Pending Upload</span>}
                    {(status === "Uploaded" || status === "UnderReview") && <span style={{ color: '#b45309', backgroundColor: '#fef3c7', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><HiOutlineClock /> Under Review</span>}
                    {status === "Verified" && <span style={{ color: '#047857', backgroundColor: '#d1fae5', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><HiOutlineCheckCircle /> Verified</span>}
                    {status === "Rejected" && <span style={{ color: '#b91c1c', backgroundColor: '#fee2e2', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><HiOutlineExclamationCircle /> Rejected</span>}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <input 
                      type="file" 
                      style={{ display: 'none' }} 
                      ref={el => fileInputRefs.current[docType] = el}
                      onChange={(e) => handleFileUpload(e, docType)}
                    />
                    
                    {uploading === docType ? (
                      <span style={{ color: '#0ea5e9', fontWeight: '500', fontSize: '0.875rem' }}>Uploading...</span>
                    ) : status === "Verified" ? (
                      <span style={{ color: '#10b981', fontWeight: '500' }}>Done</span>
                    ) : (
                      <button 
                        onClick={() => fileInputRefs.current[docType].click()}
                        style={{ 
                          padding: '0.5rem 1.25rem', 
                          backgroundColor: '#0d6e59', 
                          color: '#ffffff', 
                          border: 'none', 
                          borderRadius: '6px', 
                          cursor: 'pointer', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          fontWeight: '500',
                          fontSize: '0.875rem',
                          boxShadow: '0 2px 4px rgba(13, 110, 89, 0.2)',
                          transition: 'background-color 0.2s, transform 0.1s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#0a5444'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#0d6e59'}
                        onMouseDown={(e) => e.target.style.transform = 'scale(0.97)'}
                        onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                      >
                        <HiOutlineUpload size={16} /> {status === "NotUploaded" ? "Upload File" : "Re-upload"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSubmitForVerification}
          disabled={!allRequiredUploaded}
          style={{
            padding: '0.875rem 2rem',
            backgroundColor: allRequiredUploaded ? '#0d6e59' : '#e2e8f0',
            color: allRequiredUploaded ? '#fff' : '#94a3b8',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: allRequiredUploaded ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            boxShadow: allRequiredUploaded ? '0 4px 12px rgba(13, 110, 89, 0.3)' : 'none'
          }}
          onMouseEnter={(e) => { if(allRequiredUploaded) e.target.style.backgroundColor = '#0a5444'; }}
          onMouseLeave={(e) => { if(allRequiredUploaded) e.target.style.backgroundColor = '#0d6e59'; }}
        >
          Submit for Verification
        </button>
      </div>
    </div>
  );
};

export default PendingApproval;
