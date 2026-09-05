import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config";
import banner from "../../assets/bannerimage.png";
import {
  HiLocationMarker,
  HiSearch,
  HiHome,
  HiOfficeBuilding,
  HiOutlineMap,
  HiLightningBolt,
  HiShieldCheck,
  HiCurrencyDollar,
  HiVideoCamera,
  HiMail,
  HiPhone,
} from "react-icons/hi";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import PropertyCard from "../../components/common/PropertyCard";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/hexagonlogo1.png";
import { landingPageStyles as s } from "../../assets/dummyStyles";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("Select Type");
  const [propertyCounts, setPropertyCounts] = useState({
    flat: 0,
    villa: 0,
    penthouse: 0,
    commercial: 0,
  });
  const [wishlistedIds, setWishlistedIds] = useState([]);

  useEffect(() => {
    fetchProperties();
    fetchCounts();
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistedIds(
        res.data
          .filter((item) => item.property)
          .map((item) => String((item.property?.id || item.property?._id))),
      );
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  };

  const handleToggleWishlist = async (propertyId) => {
    try {
      const isWishlisted = wishlistedIds.includes(propertyId);
      if (isWishlisted) {
        await axios.delete(`${API_URL}/api/wishlist/${propertyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlistedIds((prev) => prev.filter((id) => id !== propertyId));
      } else {
        await axios.post(
          `${API_URL}/api/wishlist/${propertyId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setWishlistedIds((prev) => [...prev, propertyId]);
      }
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
    }
  };

  const fetchCounts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/property/counts`);
      if (res.data.success) {
        const counts = res.data.counts;
        const normalizedCounts = {};
        Object.keys(counts).forEach(key => {
          normalizedCounts[key.toLowerCase()] = counts[key];
        });
        setPropertyCounts(normalizedCounts);
      }
    } catch (err) {
      console.error("Failed to fetch property counts:", err);
    }
  };

  const fetchProperties = async (search = "") => {
    try {
      setLoading(true);
      const url = search ? `${API_URL}/api/property?city=${encodeURIComponent(search)}` : `${API_URL}/api/property`;
      const res = await axios.get(url);
      setProperties(res.data.properties || res.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load properties. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append("city", searchTerm);
    if (propertyType !== "Select Type") params.append("type", propertyType);
    navigate(`/properties?${params.toString()}`);
  };

  const categories = [
    {
      name: "Modern Flats",
      count: propertyCounts.flat || 0,
      icon: <HiOfficeBuilding size={24} />,
      type: "flat",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Luxury Villas",
      count: propertyCounts.villa || 0,
      icon: <HiHome size={24} />,
      type: "villa",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Penthouse",
      count: propertyCounts.penthouse || 0,
      icon: <HiOfficeBuilding size={24} />,
      type: "penthouse",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Commercial",
      count: propertyCounts.commercial || 0,
      icon: <HiOfficeBuilding size={24} />,
      type: "commercial",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
  ];

  const features = [
    {
      title: "Verified Trust",
      desc: "Every listing is strictly audited for ownership, condition, and legality.",
      icon: <HiShieldCheck size={24} />,
    },
    {
      title: "Smart Search",
      desc: "Our AI-driven algorithms help you find the best matches based on preferences.",
      icon: <HiLightningBolt size={24} />,
    },
    {
      title: "Best Value",
      desc: "Direct-from-owner listings and zero-commission options to ensure competitive prices.",
      icon: <HiCurrencyDollar size={24} />,
    },
    {
      title: "Virtual Tours",
      desc: "High-definition 3D tours allow you to experience the property from home.",
      icon: <HiVideoCamera size={24} />,
    },
  ];

  return (
    <div className={s.bgMain}>
      <Navbar />

      {/* Hero Section */}
      <section className={s.heroSection}>
        <div className={s.heroContent}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50/80 border border-emerald-100 text-emerald-700 font-semibold text-sm mb-6 shadow-sm hover:shadow transition-shadow backdrop-blur-sm">
            <HiShieldCheck size={18} /> Trusted by 20,000+ homeowners
          </div>
          <h1 className={`${s.heroTitle} tracking-tight`}>
            Find Your <span className={s.textGradient}>Perfect</span> Next
            Chapter.
          </h1>
          <p className={s.heroSubtitle}>
            Experience the most advanced real estate search platform. Discover
            verified listings, connect with top agents, and find a place you'll
            love.
          </p>

          {/* Integrated Search */}
          <form onSubmit={handleSearch} className={s.searchForm}>
            <div className={s.searchField}>
              <div className={s.textPrimary}>
                <HiLocationMarker size={26} />
              </div>
              <div className={s.flexCol}>
                <label className={s.labelSmall}>Location</label>
                <input
                  type="text"
                  placeholder="Where are you looking?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={s.inputTransparent}
                />
              </div>
            </div>
            <div className={s.searchDivider}></div>
            <div className={s.searchField}>
              <div className={s.textPrimary}>
                <HiHome size={26} />
              </div>
              <div className={s.flexCol}>
                <label className={s.labelSmall}>Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className={`${s.inputTransparent} cursor-pointer`}
                >
                  <option value="Select Type">Select Type</option>
                  <option value="flat">Flat/Apartment</option>
                  <option value="villa">Villa/House</option>
                  <option value="penthouse">Penthouse</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
            </div>
            <button type="submit" className={`${s.searchButton} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgba(16,185,129,0.3)] active:scale-95 flex items-center justify-center gap-2`}>
              <HiSearch size={22} /> Search
            </button>
          </form>

          {/* Stats */}
          <div className={s.statsContainer}>
            <div className={s.statItemFlex}>
              <h3 className={s.statNumber}>12k+</h3>
              <p className={s.statLabel}>Ready Properties</p>
            </div>
            <div className={s.statItemBorder}>
              <h3 className={s.statNumber}>500+</h3>
              <p className={s.statLabel}>Agent Network</p>
            </div>
            <div className={s.statItemBorder}>
              <h3 className={s.statNumber}>4.9/5</h3>
              <p className={s.statLabel}>User Rating</p>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className={s.heroImageContainer}>
          <div className={s.imageWrapper}>
            <img src={banner} alt="Luxury Home" className={s.heroImage} />
            {/* Verified Badge Overlay */}
            <div className={`${s.verifiedBadge} backdrop-blur-md bg-white/95 border border-slate-100 shadow-2xl hover:-translate-y-1.5 transition-all duration-300 rounded-2xl`}>
              <div className="bg-emerald-50 p-2.5 rounded-xl shadow-sm">
                <HiShieldCheck size={28} className="text-emerald-600" />
              </div>
              <div className="flex flex-col gap-0.5">
                <h4 className="font-bold text-slate-800 text-sm md:text-base">Verified Listing</h4>
                <p className="text-slate-500 text-xs md:text-sm font-medium">
                  Inspected by our professional team
                </p>
              </div>
              <span className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full shadow-lg border-2 border-white">Pre-Approved</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className={s.categorySection}>
        <div className={s.container}>
          <div className={s.categoryHeader}>
            <div className={s.categoryHeaderText}>
              <h2 className={s.categoryTitle}>Browse by Category</h2>
              <p className={s.categoryDesc}>
                Explore curated collections of properties tailored to your
                specific lifestyle and needs.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-sm:gap-4 mt-8">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-[2rem] cursor-pointer group h-[320px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(16,185,129,0.2)]"
                onClick={() => navigate(`/properties?type=${cat.type}`)}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/50 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end items-start text-white">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20 transition-all duration-500 group-hover:bg-primary group-hover:scale-110 group-hover:rotate-3">
                    {cat.icon}
                  </div>
                  <h3 className="text-[1.5rem] font-bold mb-2 tracking-tight group-hover:text-primary-light transition-colors duration-300">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-2.5 bg-black/30 backdrop-blur-sm py-1.5 px-3.5 rounded-full border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
                    <span className="text-white/90 font-semibold text-sm">
                      {cat.count.toLocaleString()} Properties
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={s.featuresSection}>
        <div className={s.featuresContainer}>
          <div className={s.featuresList}>
            {features.map((f, idx) => (
              <div
                key={idx}
                className={s.featureCard}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className={s.featureIconWrapper}>{f.icon}</div>
                <h3 className={s.featureTitle}>{f.title}</h3>
                <p className={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
          <div className={s.featuresContent}>
            <h2 className={s.featuresHeading}>
              Why RealEstate
              <br />
              is the <span className={s.textGradient}>Preferred Choice.</span>
            </h2>
            <p className={s.featuresSubtext}>
              We've reinvented the property search experience from the ground
              up. By focusing on transparency, technological precision, and
              user-centric design, we help you find not just a house, but a
              home.
            </p>
            <ul className={s.featuresListItems}>
              {[
                "Direct connection with certified agents",
                "Real-time market valuation data",
                "Secure document management system",
                "24/7 Premium customer support",
              ].map((item, idx) => (
                <li key={idx} className={s.listItem}>
                  <HiLightningBolt className="text-primary" /> {item}
                </li>
              ))}
            </ul>
            <a href="#process" className={s.learnMoreLink}>
              Learn more about our process &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className={s.featuredSection}>
        <div className={s.container}>
          <div className={s.featuredHeader}>
            <span className={s.featuredBadge}>Handpicked For You</span>
            <h2 className={s.featuredTitle}>Featured Collections</h2>
            <p className={s.featuredSubtitle}>
              Discover high-value properties curated by our experts for their
              exceptional design, location, and investment potential.
            </p>
          </div>

          {loading ? (
            <div className={s.loadingContainer}>
              <div className={s.loader}></div>
            </div>
          ) : error ? (
            <div className={s.errorContainer}>
              <p>{error}</p>
            </div>
          ) : (
            <div className={s.propertiesGrid}>
              {properties
                .filter((p) => p)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 3)
                .map((property) => (
                  <PropertyCard
                    key={(property.id || property._id)}
                    property={property}
                    isWishlisted={wishlistedIds.includes(String((property.id || property._id)))}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
            </div>
          )}

          <div className={s.discoverButtonContainer}>
            <button
              onClick={() => navigate("/properties")}
              className={s.discoverButton}
            >
              Discover More Properties
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="process" className={s.processSection}>
        <div className={s.container}>
          <div className={s.processHeader}>
            <span className={s.processBadge}>How It Works</span>
            <h2 className={s.processTitle}>
              Our Seamless <span className={s.textGradient}>Process</span>
            </h2>
            <p className={s.processSubtitle}>
              We've simplified the journey of finding your dream home into three
              clear, stress-free steps.
            </p>
          </div>

          <div className={s.processGrid}>
            {[
              {
                step: "01",
                title: "Smart Search",
                desc: "Leverage our AI-driven Smart Search algorithms to find the best property matches tailored to your specific preferences.",
                icon: <HiLightningBolt size={32} />,
              },
              {
                step: "02",
                title: "Virtual Tours",
                desc: "Experience your future home from anywhere with our high-definition 3D virtual tours and immersive walkthroughs.",
                icon: <HiVideoCamera size={32} />,
              },
              {
                step: "03",
                title: "Verified Trust",
                desc: "Every listing is strictly audited for ownership and condition, ensuring your peace of mind and a secure transaction.",
                icon: <HiShieldCheck size={32} />,
              },
            ].map((p, idx) => (
              <div key={idx} className={s.processCard}>
                <div className={s.stepNumber}>{p.step}</div>
                <div className={s.processIconWrapper}>{p.icon}</div>
                <h3 className={s.processCardTitle}>{p.title}</h3>
                <p className={s.processCardDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className={s.footer}>
        <div className={s.container}>
          <div className={s.footerMainGrid}>
            {/* Column 1: Brand & About */}
            <div className={s.footerBrand}>
              <div className={s.brandLogo}>
                <div className={s.brandIcon}>RE</div>
                RealEstate
              </div>
              <p className={s.brandDesc}>
                The most trusted platform for buying, selling, and renting
                premium real estate globally. We make property hunting seamless.
              </p>
              <div className={s.socialIcons}>
                {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map(
                  (Icon, idx) => (
                    <a key={idx} href="#" className={s.socialIcon}>
                      <Icon size={16} />
                    </a>
                  ),
                )}
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className={s.footerHeading}>Company</h4>
              <ul className={s.footerLinks}>
                <li>
                  <a href="/" className={s.footerLink}>
                    Home
                  </a>
                </li>
                <li>
                  <a href="/properties" className={s.footerLink}>
                    Property
                  </a>
                </li>
                <li>
                  <a href="/wishlist" className={s.footerLink}>
                    Wishlist
                  </a>
                </li>
                <li>
                  <a href="/contact" className={s.footerLink}>
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact Info */}
            <div>
              <h4 className={s.footerHeading}>Support</h4>
              <ul className={s.footerLinks}>
                <li className={s.contactInfo}>
                  <HiMail className="text-primary text-xl" />{" "}
                  contact@reestate.com
                </li>
                <li className={s.contactInfo}>
                  <HiPhone className="text-primary text-xl" /> +91 1234567890
                </li>
                <li className={s.contactInfoStart}>
                  <HiLocationMarker
                    className={`text-primary ${s.contactIcon}`}
                  />
                  123 Business Hub, India
                </li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div>
              <h4 className={s.footerHeading}>Newsletter</h4>
              <p className={s.newsletterDesc}>
                Subscribe to get the latest listings and market insights
                directly in your inbox.
              </p>
              <div className={s.newsletterInputWrapper}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={s.newsletterInput}
                />
                <button className={s.newsletterButton}>Join</button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className={s.bottomBar}>
            <div className={s.bottomBarFlex}>
              <p>
                © {new Date().getFullYear()} RealEstate. All rights reserved.
              </p>
              <div className={s.footerLegalLinks}>
                <a href="#" className={s.footerLink}>
                  Privacy Policy
                </a>
                <a href="#" className={s.footerLink}>
                  Terms of Service
                </a>
                <a href="#" className={s.footerLink}>
                  Cookies Settings
                </a>
              </div>
            </div>
            <div className={s.designCredit}>
              <img
                src={logo}
                alt="Hexagon Digital Services"
                className={s.designLogo}
              />
              <span className="text-text-muted">Designed by</span>
              <a
                href="https://hexagondigitalservices.com"
                target="_blank"
                rel="noopener noreferrer"
                className={s.designLink}
              >
                Hexagon Digital Services
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
