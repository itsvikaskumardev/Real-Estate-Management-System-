import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import API_URL from "../../config";
import {
  HiLocationMarker,
  HiOutlineHome,
  HiArrowsExpand,
  HiChatAlt,
  HiHeart,
  HiOutlineLogout,
  HiShare,
  HiFlag,
  HiBadgeCheck,
  HiChevronRight,
  HiOutlineUserGroup,
  HiOutlineViewGrid,
  HiCalendar,
  HiX,
  HiChevronLeft,
  HiCollection,
  HiOutlineHeart,
} from "react-icons/hi";
import { HiStar, HiOutlineStar } from "react-icons/hi";
import Navbar from "../../components/common/Navbar";
import PropertyCard from "../../components/common/PropertyCard";
import { useAuth } from "../../context/AuthContext";
import { propertyDetailsStyles as s } from "../../assets/dummyStyles";

const PropertyDetails = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inquiry, setInquiry] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [inquiryStatus, setInquiryStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/property/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setProperty(res.data.property);
        setSimilarProperties(res.data.similarProperties || []);

        if (user && user.role === "buyer") {
          const wishRes = await axios.get(`${API_URL}/api/wishlist`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const found = wishRes.data.some((item) => (item.property?.id || item.property?._id) === id);
          setIsInWishlist(found);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to load property details.");
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, user, token]);

  const handleWishlistToggle = async () => {
    if (!user) return navigate("/login");
    try {
      if (isInWishlist) {
        await axios.delete(`${API_URL}/api/wishlist/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsInWishlist(false);
      } else {
        await axios.post(
          `${API_URL}/api/wishlist/${id}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setIsInWishlist(true);
      }
    } catch (err) {
      alert("Failed to update wishlist.");
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");

    if (user.role !== "buyer") return alert("Only buyers can send inquiries");

    setInquiryStatus({ ...inquiryStatus, loading: true });
    try {
      await axios.post(
        `${API_URL}/api/inquiry`,
        {
          propertyId: id,
          message: inquiry.message,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setInquiryStatus({ loading: false, success: true, error: null });
      setInquiry({ ...inquiry, message: "" });
    } catch (err) {
      setInquiryStatus({
        loading: false,
        success: false,
        error: "Failed to send inquiry.",
      });
    }
  };

  const handleChatStart = async () => {
    if (!user) return navigate("/login");
    if (user.role !== "buyer")
      return alert("Only buyers can chat with sellers");

    try {
      const res = await axios.post(
        `${API_URL}/api/chat/start`,
        {
          propertyId: id,
          sellerId: (property.seller?.id || property.seller?._id),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const chat = res.data;

      await axios.post(
        `${API_URL}/api/chat/send`,
        {
          chatId: (chat.id || chat._id),
          text: `Hi! I am very interested in your property: ${property.title}. Could you provide more details?`,
          image: property.images[0],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      navigate("/chat-messages", { state: { chat } });
    } catch (err) {
      console.error("Error starting chat:", err);
      alert("Failed to start chat.");
    }
  };

  const handlePurchaseClick = () => {
    if (!user) return navigate("/login");
    if (user.role !== "buyer") return alert("Only buyers can purchase properties");
    setShowPurchaseModal(true);
  };

  const executePurchase = async () => {
    setShowPurchaseModal(false);
    setPurchaseLoading(true);
    try {
      await axios.post(`${API_URL}/api/buyer/purchase/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Purchase successful!", { duration: 5000 });
      const res = await axios.get(`${API_URL}/api/property/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setProperty(res.data.property);
    } catch (err) {
      alert("Failed to purchase property.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (loading)
    return (
      <div className="loader-full-page">
        <div className="loader"></div>
      </div>
    );
  if (error || !property)
    return (
      <div
        className="container"
        style={{ padding: "4rem", textAlign: "center" }}
      >
        {error || "Property not found"}
      </div>
    );

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(property.price);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = () =>
    setLightboxIndex((prev) => (prev + 1) % property.images.length);
  const prevImage = () =>
    setLightboxIndex(
      (prev) => (prev - 1 + property.images.length) % property.images.length,
    );

  const isOwner = user && property?.seller && (user.id || user._id) === (property.seller.id || property.seller._id);

  return (
    <div className={s.pageContainer}>
      <Navbar />

      <main className={s.mainContainer}>
        {/* Breadcrumbs */}
        <nav className={s.breadcrumbs}>
          <Link to="/" className={s.breadcrumbLink}>
            Home
          </Link>
          <HiChevronRight />
          <Link to="/properties" className={s.breadcrumbLink}>
            Listings
          </Link>
          <HiChevronRight />
          <span className={s.breadcrumbCurrent}>{property.title}</span>
        </nav>

        <div className={s.galleryContainer}>
          {/* Desktop Grid */}
          <div
            className={s.galleryGrid}
            style={{
              gridTemplateColumns:
                property.images.length > 1 ? "repeat(4, 1fr)" : "1fr",
              gridTemplateRows:
                property.images.length > 1 ? "repeat(2, 180px)" : "400px",
            }}
          >
            {/* Main Large Image */}
            <div
              className={s.galleryMainItem(property.images.length > 1)}
              onClick={() => openLightbox(0)}
            >
              <img
                src={property.images[0]}
                alt="Main Property"
                className={s.galleryImage}
              />
            </div>

            {/* Side Images */}
            {property.images.slice(1, 5).map((img, idx) => (
              <div
                key={idx}
                className={s.gallerySideItem}
                onClick={() => openLightbox(idx + 1)}
              >
                <img
                  src={img}
                  alt={`Property Interior ${idx + 1}`}
                  className={s.galleryImage}
                />
                {idx === 3 && property.images.length > 5 && (
                  <div className={s.galleryMoreOverlay}>
                    +{property.images.length - 5}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Only Slider */}
          <div className={s.mobileSliderContainer}>
            <div className={s.mobileSliderTrack}>
              {property.images.map((img, idx) => (
                <div
                  key={idx}
                  className={s.mobileSlide}
                  onClick={() => openLightbox(idx)}
                >
                  <img
                    src={img}
                    alt={`Slide ${idx + 1}`}
                    className={s.mobileSlideImage}
                  />
                  <div className={s.mobileSlideCounter}>
                    {idx + 1} / {property.images.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lightbox Modal */}
        {lightboxIndex !== null && (
          <div className={s.lightboxOverlay} onClick={closeLightbox}>
            <button onClick={closeLightbox} className={s.lightboxCloseBtn}>
              <HiX size={24} className={s.lightboxCloseIcon} />
            </button>

            <div
              className={s.lightboxContent}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={property.images[lightboxIndex]}
                alt={`Property Full ${lightboxIndex + 1}`}
                className={s.lightboxImage}
              />

              {property.images.length > 1 && (
                <>
                  <button onClick={prevImage} className={s.lightboxPrevBtn}>
                    <HiChevronLeft size={30} />
                  </button>
                  <button onClick={nextImage} className={s.lightboxNextBtn}>
                    <HiChevronRight size={30} />
                  </button>
                </>
              )}

              <div className={s.lightboxCounter}>
                {lightboxIndex + 1} / {property.images.length}
              </div>
            </div>
          </div>
        )}

        {/* Main Content & Sidebar Grid */}
        <div className={s.detailsLayout}>
          {/* Left Column: Property Info */}
          <div className={s.infoColumn}>
            <div className={s.infoHeader}>
              <div className={s.titleWrapper}>
                <div className={s.badgeWrapper}>
                  <span className={s.premiumBadge}>Premium Listing</span>
                </div>
                <h1 className={s.propertyTitle}>{property.title}</h1>
                <p className={s.propertyLocation}>
                  <HiLocationMarker className={s.locationIcon} />
                  <span className={s.locationText}>
                    {property.area}, {property.city}, India
                  </span>
                </p>
              </div>
              <div className={s.actionButtons}>
                {(!user || user.role === "buyer") && (
                  <button
                    onClick={handleWishlistToggle}
                    className={s.wishlistButton(isInWishlist)}
                  >
                    {isInWishlist ? (
                      <HiHeart size={26} fill="#ef4444" />
                    ) : (
                      <HiOutlineHeart size={26} />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats Boxes */}
            <div className={s.statsGrid}>
              {[
                {
                  label: "Bedrooms",
                  value: property.bhk || 0,
                  icon: HiOutlineHome,
                },
                {
                  label: "Bathrooms",
                  value:
                    property.bathrooms ||
                    Math.max(1, (parseInt(property.bhk) || 1) - 1),
                  icon: HiOutlineUserGroup,
                },
                {
                  label: "Furnishing",
                  value: property.furnishing || "N/A",
                  icon: HiCollection,
                },
                {
                  label: "Living Area",
                  value: `${property.areaSize} sqft`,
                  icon: HiOutlineViewGrid,
                },
                {
                  label: "Type",
                  value: property.propertyType,
                  icon: HiCalendar,
                },
              ].map((stat, i) => (
                <div key={i} className={s.statCard}>
                  {stat.icon && <stat.icon size={18} className={s.statIcon} />}
                  <div className={s.statValue}>{stat.value}</div>
                  <div className={s.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Description Section */}
            <div className={s.descriptionSection}>
              <h3 className={s.sectionTitle}>Description</h3>
              <p className={s.descriptionText}>
                {property.description ||
                  "No description available for this property."}
              </p>
            </div>

            {/* Amenities List */}
            <div className={s.amenitiesSection}>
              <h3 className={s.sectionTitle}>Amenities</h3>
              <div className={s.amenitiesGrid}>
                {(property.amenities?.length
                  ? property.amenities
                  : ["Parking", "Security", "Water Supply", "Power Backup"]
                ).map((amn, i) => (
                  <div key={i} className={s.amenityItem}>
                    <HiBadgeCheck size={18} className={s.amenityIcon} />
                    <span className={s.amenityText}>{amn}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className={s.sidebarColumn}>
            {/* Price Card */}
            <div
              className={s.priceCard}
              style={{ background: property.status?.toLowerCase() === "sold" ? "#64748b" : "var(--primary)" }}
            >
              <div className={s.priceCardLabel}>
                {property.status?.toLowerCase() === "sold"
                  ? "Final Sale Price"
                  : property.status?.toLowerCase() === "rent"
                  ? "Rental Details"
                  : "Listing Price"}
              </div>
              <div className={s.priceCardValue}>
                {property.status?.toLowerCase() === "rent"
                  ? `₹${Number(property.price).toLocaleString("en-IN")}`
                  : formattedPrice}
                {property.status?.toLowerCase() === "rent" && (
                  <span className={s.priceCardPeriod}> /month</span>
                )}
              </div>
              {property.status?.toLowerCase() === "rent" && (
                <div className={s.rentDetails}>
                  <div className={s.rentDetailRow}>
                    <span className={s.rentDetailLabel}>Security Deposit</span>
                    <span className={s.rentDetailValue}>
                      ₹
                      {Number(property.securityDeposit || 0).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                  <div className={s.rentDetailRow}>
                    <span className={s.rentDetailLabel}>Maintenance</span>
                    <span className={s.rentDetailValue}>
                      ₹
                      {Number(property.maintenance || 0).toLocaleString(
                        "en-IN",
                      )}
                      /mo
                    </span>
                  </div>
                </div>
              )}
              <div className={s.priceCardAvailability}>
                {property.status?.toLowerCase() === "sold" ? (
                  <span style={{ fontWeight: "bold", fontSize: "1.1rem", textTransform: "uppercase" }}>Already Sold</span>
                ) : (
                  <>
                    Available for{" "}
                    {property.status?.toLowerCase() === "rent" ? "Rent" : "Sale"}
                  </>
                )}
              </div>
            </div>

            {/* Seller & Contact */}
            <div className={s.sellerCard}>
              <div className={s.sellerInfo}>
                <div className={s.sellerAvatar}>
                  <img
                    src={
                      property.seller?.profilePic ||
                      `https://ui-avatars.com/api/?name=${property.seller?.name || "Seller"}&background=0d6e59&color=fff`
                    }
                    alt="Agent"
                    className={s.sellerAvatarImage}
                  />
                </div>
                <div className={s.sellerDetails}>
                  <div className={s.sellerNameLink}>
                    <h4 className={s.sellerName}>
                      {property.seller?.name || "Seller"}
                    </h4>
                  </div>
                  <div className={s.sellerVerifiedBadge}>
                    <HiBadgeCheck className={s.verifiedIcon} /> Verified Seller
                  </div>
                </div>
              </div>

              {!isOwner && (
                <>
                  <div className={s.chatButtonWrapper}>
                    {property.status?.toLowerCase() === "sale" && (
                      <button 
                        className={s.inquirySubmitButton} 
                        style={{ marginBottom: '10px', backgroundColor: '#059669' }} 
                        onClick={handlePurchaseClick}
                        disabled={purchaseLoading}
                      >
                        {purchaseLoading ? "Processing..." : "Buy Now"}
                      </button>
                    )}
                    <button className={s.chatButton} onClick={handleChatStart}>
                      <HiChatAlt /> Chat
                    </button>
                  </div>

                  {/* Inquiry Form */}
                  {property.status?.toLowerCase() !== "sold" ? (
                    <>
                      <h4 className={s.inquiryFormTitle}>Inquire</h4>
                      <form onSubmit={handleInquirySubmit}>
                        {user?.role === "buyer" ? (
                          <>
                            <textarea
                              placeholder="Your Message..."
                              value={inquiry.message}
                              onChange={(e) =>
                                setInquiry({ ...inquiry, message: e.target.value })
                              }
                              className={s.inquiryTextarea}
                              required
                            />
                            <button
                              type="submit"
                              className={s.inquirySubmitButton}
                              disabled={inquiryStatus.loading}
                            >
                              {inquiryStatus.loading ? "Sending..." : "Send Inquiry"}
                            </button>
                            {inquiryStatus.success && (
                              <p className={s.inquirySuccessMessage}>Inquiry sent!</p>
                            )}
                          </>
                        ) : (
                          <div className={s.inquiryDisabledMessage}>
                            <p className={s.inquiryDisabledText}>
                              {user
                                ? "Only buyers can send inquiries."
                                : "Please login as a buyer to send inquiries."}
                            </p>
                            {!user && (
                              <Link to="/login" className={s.inquiryLoginButton}>
                                Login
                              </Link>
                            )}
                          </div>
                        )}
                      </form>
                    </>
                  ) : (
                    <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '0.5rem', textAlign: 'center', marginTop: '1rem', color: '#64748b', fontWeight: '500' }}>
                      This property is no longer accepting inquiries.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Additional Details Box */}
        <div className={s.additionalDetails}>
          <h3 className={s.detailsTitle}>Property Details</h3>
          <div className={s.detailsGrid}>
            {[
              {
                label: "Property ID",
                value: (property.id || property._id).slice(-8).toUpperCase(),
              },
              {
                label: "Added On",
                value: new Date(property.createdAt).toLocaleDateString(),
              },
              { label: "Property Type", value: property.propertyType },
              { label: "Status", value: property.status?.toLowerCase() === "sold" ? "Sold" : `For ${property.status}` },
            ].map((detail, i) => (
              <div key={i} className={s.detailRow}>
                <span className={s.detailLabel}>{detail.label}</span>
                <span className={s.detailValue}>{detail.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Similar Properties */}
        <section className={s.similarSection}>
          <div className={s.similarHeader}>
            <div>
              <h2 className={s.similarTitle}>Similar Properties</h2>
              <p className={s.similarSubtitle}>
                Listings you might like in {property.city}.
              </p>
            </div>
            <Link to="/properties" className={s.similarAllLink}>
              All Listings <HiChevronRight />
            </Link>
          </div>
          <div className={s.similarGrid}>
            {similarProperties.length > 0 ? (
              similarProperties
                .slice(0, 3)
                .map((p) => <PropertyCard key={(p.id || p._id)} property={p} />)
            ) : (
              <div className={s.similarEmptyState}>
                No similar properties found in this location.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && createPortal(
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "0.5rem", width: "90%", maxWidth: "400px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem", color: "#1e293b" }}>Confirm Purchase</h3>
            <p style={{ color: "#475569", marginBottom: "1.5rem" }}>
              Are you sure you want to purchase {property.title} for {formattedPrice}?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button
                onClick={() => setShowPurchaseModal(false)}
                style={{ padding: "0.5rem 1rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", backgroundColor: "#f8fafc", color: "#475569", cursor: "pointer", transition: "all 0.2s" }}
              >
                Cancel
              </button>
              <button
                onClick={executePurchase}
                style={{ padding: "0.5rem 1rem", border: "none", borderRadius: "0.375rem", backgroundColor: "#059669", color: "#fff", cursor: "pointer", transition: "all 0.2s" }}
              >
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PropertyDetails;
