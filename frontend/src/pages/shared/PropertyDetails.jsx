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
import EmiCalculator from "../../components/property/EmiCalculator";
import MockCheckoutModal from "../../components/property/MockCheckoutModal";
import { useAuth } from "../../context/AuthContext";
import { propertyDetailsStyles as s } from "../../assets/dummyStyles";
import PropertyReviews from "../../components/property/PropertyReviews";
import PropertyMap from "../../components/common/PropertyMap";

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
  
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitLoading, setVisitLoading] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [visitMessage, setVisitMessage] = useState("");

  const [existingOffer, setExistingOffer] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [offerLoading, setOfferLoading] = useState(false);
  const [purchaseUseOfferPrice, setPurchaseUseOfferPrice] = useState(false);
  const [showPurchaseChoiceModal, setShowPurchaseChoiceModal] = useState(false);

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

          try {
            const offersRes = await axios.get(`${API_URL}/api/buyer/offers`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const offerForThis = offersRes.data.find(o => (o.propertyId || o.property?.id) === id);
            if (offerForThis) {
               setExistingOffer(offerForThis);
            }
          } catch(e) {}
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
    
    if (existingOffer && existingOffer.status === "Accepted") {
       setShowPurchaseChoiceModal(true);
    } else {
       setPurchaseUseOfferPrice(false);
       setShowPurchaseModal(true);
    }
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    setOfferLoading(true);
    try {
      await axios.post(`${API_URL}/api/buyer/offers`, {
        propertyId: id,
        offerAmount: Number(offerAmount),
        message: offerMessage
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Offer submitted successfully!");
      setShowOfferModal(false);
      
      const offersRes = await axios.get(`${API_URL}/api/buyer/offers`, { headers: { Authorization: `Bearer ${token}` } });
      const offerForThis = offersRes.data.find(o => o.propertyId === id);
      setExistingOffer(offerForThis);
    } catch(err) {
      alert(err.response?.data?.message || "Failed to submit offer.");
    } finally {
      setOfferLoading(false);
    }
  };

  const executePurchase = async () => {
    setShowPurchaseModal(false);
    setPurchaseLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/buyer/purchase/${id}`, {
        useApprovedOfferPrice: purchaseUseOfferPrice
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const txId = response.data?.transactionId;
      
      if (txId) {
        toast.success(
          (t) => (
            <div>
              <div style={{fontWeight: 'bold', marginBottom: '10px'}}>Purchase successful!</div>
              <button 
                onClick={async () => {
                  try {
                    const invRes = await axios.get(`${API_URL}/api/buyer/invoice/${txId}`, {
                      headers: { Authorization: `Bearer ${token}` },
                      responseType: 'text'
                    });
                    const newWindow = window.open('', '_blank');
                    if (newWindow) {
                      newWindow.document.open();
                      newWindow.document.write(invRes.data);
                      newWindow.document.close();
                    }
                  } catch(e) {
                    alert("Failed to download invoice");
                  }
                  toast.dismiss(t.id);
                }}
                style={{ background: '#0d9488', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', display: 'block', width: '100%', textAlign: 'center' }}
              >
                Download Invoice
              </button>
            </div>
          ),
          { duration: 8000 }
        );
      } else {
        toast.success("Purchase successful!", { duration: 5000 });
      }

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

  const handleScheduleVisitClick = () => {
    if (!user) return navigate("/login");
    if (user.role !== "buyer") return alert("Only buyers can schedule visits");
    setShowVisitModal(true);
  };

  const executeScheduleVisit = async (e) => {
    e.preventDefault();
    if (!visitDate) return alert("Please select a date and time");
    
    setVisitLoading(true);
    try {
      await axios.post(`${API_URL}/api/buyer/visits/schedule`, {
        propertyId: id,
        visitDate: new Date(visitDate).toISOString(),
        message: visitMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Site visit requested successfully!", { duration: 5000 });
      setShowVisitModal(false);
      setVisitDate("");
      setVisitMessage("");
    } catch (err) {
      alert("Failed to schedule visit. You might already have a pending request.");
    } finally {
      setVisitLoading(false);
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
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="bg-gradient-to-r from-amber-500 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm flex items-center gap-1">
                    <HiStar /> Premium Listing
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 leading-tight font-display tracking-tight">{property.title}</h1>
                <p className="flex items-center text-slate-500 font-medium text-lg mt-2">
                  <HiLocationMarker className="text-primary mr-2" size={22} />
                  <span>
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
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
                <div key={i} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/30 group">
                  {stat.icon && <stat.icon size={28} className="text-slate-400 group-hover:text-primary transition-colors duration-300 mb-2" />}
                  <div className="text-lg font-bold text-slate-800">{stat.value}</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Description Section */}
            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm mb-8">
              <h3 className="text-xl font-bold text-slate-800 mb-4 font-display flex items-center gap-2">
                <HiOutlineViewGrid className="text-primary" />
                Description
              </h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-[1.05rem]">
                {property.description ||
                  "No description available for this property."}
              </p>
            </div>

            {/* Amenities List */}
            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm mb-8">
              <h3 className="text-xl font-bold text-slate-800 mb-6 font-display flex items-center gap-2">
                <HiCollection className="text-primary" />
                Premium Amenities
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                {(property.amenities?.length
                  ? property.amenities
                  : ["Parking", "Security", "Water Supply", "Power Backup"]
                ).map((amn, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-700 font-medium group">
                    <div className="bg-emerald-50 p-2 rounded-full text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                      <HiBadgeCheck size={20} />
                    </div>
                    <span className="text-md">{amn}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <PropertyReviews propertyId={property.id || property._id} />
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 p-0.5">
                  <img
                    src={
                      property.seller?.profilePic ||
                      `https://ui-avatars.com/api/?name=${property.seller?.name || "Seller"}&background=0d6e59&color=fff`
                    }
                    alt="Agent"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Listed By</span>
                  <h4 className="text-lg font-bold text-slate-800">
                    {property.seller?.name || "Seller"}
                  </h4>
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-max mt-1 border border-emerald-100">
                    <HiBadgeCheck size={14} /> Verified Seller
                  </div>
                </div>
              </div>

              {!isOwner && (
                <>
                  <div className={s.chatButtonWrapper} style={{ flexDirection: 'column', gap: '12px' }}>
                    {property.status?.toLowerCase() === "sale" && (
                      <button 
                        className={`${s.inquirySubmitButton} bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:-translate-y-0.5 transition-all duration-200 border-none`}
                        onClick={handlePurchaseClick}
                        disabled={purchaseLoading}
                      >
                        {purchaseLoading ? "Processing..." : "Buy Now"}
                      </button>
                    )}

                    {property.status?.toLowerCase() === "sale" && !existingOffer && user?.role === "buyer" && (
                      <button 
                        className={`${s.inquirySubmitButton} bg-amber-500 hover:bg-amber-600 text-white shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] hover:-translate-y-0.5 transition-all duration-200 border-none`}
                        onClick={() => setShowOfferModal(true)}
                      >
                        Make an Offer
                      </button>
                    )}

                    {existingOffer && (
                      <div className="mb-3 p-4 rounded-xl border border-slate-200 bg-slate-50 text-sm shadow-sm transition-shadow hover:shadow-md">
                        <div className="font-semibold text-slate-900 flex justify-between items-center">
                          <span>Your Offer:</span>
                          <span className="text-base text-primary">₹{existingOffer.offerAmount.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-slate-500">Status:</span>
                          <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                            existingOffer.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 
                            existingOffer.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {existingOffer.status}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-3 w-full">
                      <button 
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white border-none rounded-xl font-semibold cursor-pointer flex justify-center items-center gap-2 py-3.5 transition-all duration-200 hover:-translate-y-0.5 shadow-[0_4px_14px_0_rgba(59,130,246,0.39)]" 
                        onClick={handleScheduleVisitClick}
                      >
                        <HiCalendar size={20} /> Visit
                      </button>
                      <button 
                        className="flex-1 bg-white text-primary hover:bg-primary hover:text-white border border-primary rounded-xl font-semibold cursor-pointer flex justify-center items-center gap-2 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg" 
                        onClick={handleChatStart}
                      >
                        <HiChatAlt size={20} /> Chat
                      </button>
                    </div>
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
                    <div className="p-4 bg-slate-100 rounded-xl text-center mt-4 text-slate-500 font-semibold border border-slate-200">
                      This property is no longer accepting inquiries.
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* EMI Calculator */}
            {property.status?.toLowerCase() === "sale" && (
              <div style={{ marginTop: '24px' }}>
                <EmiCalculator propertyPrice={property.price} />
              </div>
            )}
          </div>
        </div>

        {/* Additional Details Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 mt-8 w-full transition-shadow hover:shadow-md">
          <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
            <HiCollection className="text-primary" size={24} />
            Property Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Property ID</span>
              <span className="font-bold text-slate-800 text-lg uppercase bg-slate-50 px-3 py-1.5 rounded-lg w-max border border-slate-100">
                {(property.id || property._id).slice(-8)}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Added On</span>
              <span className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                <HiCalendar className="text-slate-400" />
                {new Date(property.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Property Type</span>
              <span className="font-semibold text-slate-800 text-lg capitalize flex items-center gap-2">
                <HiOutlineHome className="text-slate-400" />
                {property.propertyType}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Listing Status</span>
              <div>
                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                  property.status?.toLowerCase() === "sold" 
                    ? "bg-slate-100 text-slate-600 border border-slate-200"
                    : property.status?.toLowerCase() === "rent"
                    ? "bg-blue-50 text-blue-700 border border-blue-100" 
                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                }`}>
                  {property.status?.toLowerCase() === "sold" ? "Sold Out" : `For ${property.status}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Property Location Map */}
        {property.latitude && property.longitude && (
          <PropertyMap 
            latitude={property.latitude}
            longitude={property.longitude}
            title={property.title}
            address={`${property.area}, ${property.city}`}
            property={property}
          />
        )}

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
        <MockCheckoutModal 
          property={{...property, price: purchaseUseOfferPrice && existingOffer ? existingOffer.offerAmount : property.price}} 
          onClose={() => setShowPurchaseModal(false)} 
          onConfirm={executePurchase} 
        />,
        document.body
      )}

      {/* Purchase Choice Modal (If Accepted Offer Exists) */}
      {showPurchaseChoiceModal && createPortal(
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "0.5rem", width: "90%", maxWidth: "450px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#1e293b" }}>Choose Purchase Price</h3>
            <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
              Your offer of ₹{existingOffer.offerAmount.toLocaleString("en-IN")} was approved! How would you like to proceed with the purchase?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={() => {
                  setPurchaseUseOfferPrice(true);
                  setShowPurchaseChoiceModal(false);
                  setShowPurchaseModal(true);
                }}
                style={{ padding: "1rem", border: "none", borderRadius: "0.375rem", backgroundColor: "#059669", color: "#fff", cursor: "pointer", fontWeight: "bold", fontSize: "1rem" }}
              >
                Buy at Offer Price (₹{existingOffer.offerAmount.toLocaleString("en-IN")})
              </button>
              <button
                onClick={() => {
                  setPurchaseUseOfferPrice(false);
                  setShowPurchaseChoiceModal(false);
                  setShowPurchaseModal(true);
                }}
                style={{ padding: "1rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", backgroundColor: "#f8fafc", color: "#0f172a", cursor: "pointer", fontWeight: "600" }}
              >
                Buy at Normal Price (₹{property.price.toLocaleString("en-IN")})
              </button>
            </div>
            <button
              onClick={() => setShowPurchaseChoiceModal(false)}
              style={{ marginTop: '1.5rem', width: '100%', padding: "0.75rem", border: "none", backgroundColor: "transparent", color: "#64748b", cursor: "pointer", fontWeight: "500" }}
            >
              Cancel
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Make an Offer Modal */}
      {showOfferModal && createPortal(
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "0.5rem", width: "90%", maxWidth: "450px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#1e293b" }}>Make an Offer</h3>
            <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
              Original Price: ₹{property.price.toLocaleString("en-IN")}
            </p>
            <form onSubmit={handleOfferSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#475569", marginBottom: "0.5rem" }}>Offer Amount (₹)</label>
                <input 
                  type="number" 
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1", outline: "none" }}
                  required
                  min="1"
                />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#475569", marginBottom: "0.5rem" }}>Message (Optional)</label>
                <textarea 
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder="Explain why this is a good offer..."
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1", outline: "none", minHeight: "80px", resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  style={{ padding: "0.5rem 1rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", backgroundColor: "#f8fafc", color: "#475569", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={offerLoading}
                  style={{ padding: "0.5rem 1.5rem", border: "none", borderRadius: "0.375rem", backgroundColor: "#f59e0b", color: "#fff", cursor: offerLoading ? "not-allowed" : "pointer", fontWeight: "500" }}
                >
                  {offerLoading ? "Submitting..." : "Submit Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Schedule Visit Modal */}
      {showVisitModal && createPortal(
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "0.5rem", width: "90%", maxWidth: "450px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#1e293b" }}>Schedule Site Visit</h3>
            <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
              Pick a date and time to view <strong>{property.title}</strong>.
            </p>
            <form onSubmit={executeScheduleVisit}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#475569", marginBottom: "0.5rem" }}>Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1", outline: "none" }}
                  required
                />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#475569", marginBottom: "0.5rem" }}>Message (Optional)</label>
                <textarea 
                  value={visitMessage}
                  onChange={(e) => setVisitMessage(e.target.value)}
                  placeholder="Anything specific you'd like the seller to know?"
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1", outline: "none", minHeight: "80px", resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setShowVisitModal(false)}
                  style={{ padding: "0.5rem 1rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", backgroundColor: "#f8fafc", color: "#475569", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={visitLoading}
                  style={{ padding: "0.5rem 1.5rem", border: "none", borderRadius: "0.375rem", backgroundColor: "#3b82f6", color: "#fff", cursor: visitLoading ? "not-allowed" : "pointer", fontWeight: "500" }}
                >
                  {visitLoading ? "Scheduling..." : "Request Visit"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PropertyDetails;
