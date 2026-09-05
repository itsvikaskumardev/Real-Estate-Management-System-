import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import API_URL from "../../config";
import { useAuth } from "../../context/AuthContext";
import {
  HiSearch,
  HiFilter,
  HiAdjustments,
  HiViewGrid,
  HiViewList,
  HiOutlineChevronDown,
  HiX,
} from "react-icons/hi";
import { useNavigate, useLocation } from "react-router-dom";
import PropertyCard from "../../components/common/PropertyCard";
import Navbar from "../../components/common/Navbar";
import { toast } from "react-hot-toast";
import { propertiesStyles as s } from "../../assets/dummyStyles";

const Properties = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  // Filter states
  const [filters, setFilters] = useState({
    city: "",
    propertyType: [],
    bhk: "",
    minPrice: 0,
    maxPrice: 100000000,
    amenities: [],
    furnishing: [],
    maxAgeDays: "",
    sort: "latest",
    pageNumber: 1,
    pageSize: 9,
  });

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const propertyTypes = [
    { label: "Flat/Apartment", value: "flat" },
    { label: "Independent House/Villa", value: "villa" },
    { label: "Penthouse", value: "penthouse" },
    { label: "Commercial", value: "commercial" },
  ];
  const bhkOptions = ["1", "2", "3", "4", "5+"];
  const amenitiesOptions = [
    "Parking",
    "Swimming Pool",
    "Gym",
    "Security",
    "Play Area",
    "Elevator",
  ];
  const furnishingOptions = [
    { label: "Furnished", value: "Furnished" },
    { label: "Semi-Furnished", value: "SemiFurnished" },
    { label: "Unfurnished", value: "Unfurnished" },
  ];

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const city = queryParams.get("city") || "";
    const type = queryParams.get("type") || "";
    const bhk = queryParams.get("bhk") || "";

    const initialFilters = {
      ...filters,
      city,
      propertyType: type ? [type] : [],
      bhk,
    };

    setFilters(initialFilters);
    fetchProperties(initialFilters);
    if (user) {
      fetchWishlist();
    }
  }, [location.search, user]);

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

  const fetchProperties = async (currentFilters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (currentFilters.city) params.append("city", currentFilters.city);
      if (currentFilters.propertyType.length > 0)
        params.append("propertyType", currentFilters.propertyType.join(","));
      if (currentFilters.bhk) params.append("bhk", currentFilters.bhk);
      if (currentFilters.minPrice > 0)
        params.append("minPrice", currentFilters.minPrice);
      if (currentFilters.maxPrice)
        params.append("maxPrice", currentFilters.maxPrice);
      if (currentFilters.amenities && currentFilters.amenities.length > 0)
        params.append("amenities", currentFilters.amenities.join(","));
      if (currentFilters.furnishing && currentFilters.furnishing.length > 0)
        params.append("furnishing", currentFilters.furnishing.join(","));
      if (currentFilters.maxAgeDays)
        params.append("maxAgeDays", currentFilters.maxAgeDays);
      if (currentFilters.sort) params.append("sort", currentFilters.sort);
      params.append("pageNumber", currentFilters.pageNumber);
      params.append("pageSize", currentFilters.pageSize);

      const res = await axios.get(
        `${API_URL}/api/property?${params.toString()}`,
      );
      setProperties(res.data.properties);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.count || 0);
      setError(null);
    } catch (err) {
      setError("Failed to load properties. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTimer = useRef(null);

  const debouncedFetch = (updatedFilters) => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    fetchTimer.current = setTimeout(() => {
      fetchProperties(updatedFilters);
    }, 500);
  };

  const handleCheckboxChange = (category, value) => {
    const current = [...(filters[category] || [])];
    const index = current.indexOf(value);
    if (index === -1) {
      current.push(value);
    } else {
      current.splice(index, 1);
    }
    const updatedFilters = { ...filters, [category]: current, pageNumber: 1 };
    setFilters(updatedFilters);
    fetchProperties(updatedFilters);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    const updatedFilters = { ...filters, pageNumber: newPage };
    setFilters(updatedFilters);
    fetchProperties(updatedFilters);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value);
    const updatedFilters = { ...filters, maxPrice: value, pageNumber: 1 };
    setFilters(updatedFilters);
    debouncedFetch(updatedFilters);
  };

  const handleBhkSelect = (value) => {
    const updatedFilters = {
      ...filters,
      bhk: filters.bhk === value ? "" : value,
      pageNumber: 1
    };
    setFilters(updatedFilters);
    fetchProperties(updatedFilters);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    const updatedFilters = { ...filters, sort: newSort, pageNumber: 1 };
    setFilters(updatedFilters);
    fetchProperties(updatedFilters);
  };

  const applyFilters = () => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    fetchProperties(filters);
  };

  const resetFilters = () => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    const reset = {
      city: "",
      propertyType: [],
      bhk: "",
      minPrice: 0,
      maxPrice: 100000000,
      amenities: [],
      furnishing: [],
      maxAgeDays: "",
      sort: "latest",
      pageNumber: 1,
      pageSize: 9,
    };
    setFilters(reset);
    navigate("/properties");
    navigate("/properties");
    fetchProperties(reset);
  };

  const [savingSearch, setSavingSearch] = useState(false);
  const handleSaveSearch = async () => {
    if (!user || user.role !== "buyer") {
      toast.error("Please login as a buyer to save searches.");
      return;
    }

    try {
      setSavingSearch(true);
      const title = `${filters.bhk ? filters.bhk + ' BHK' : 'Properties'} ${filters.propertyType.length > 0 ? filters.propertyType.join(', ') : ''} ${filters.city ? 'in ' + filters.city : ''}`;
      
      await axios.post(`${API_URL}/api/buyer/saved-searches`, {
        title: title || "My Saved Search",
        city: filters.city || null,
        minPrice: filters.minPrice > 0 ? filters.minPrice : null,
        maxPrice: filters.maxPrice < 100000000 ? filters.maxPrice : null,
        bhk: filters.bhk ? parseInt(filters.bhk) : null,
        propertyType: filters.propertyType.length > 0 ? filters.propertyType[0] : null,
        status: null,
        emailAlertsEnabled: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Search saved successfully! We'll alert you when matching properties are added.");
    } catch (err) {
      toast.error("Failed to save search.");
    } finally {
      setSavingSearch(false);
    }
  };

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className={s.pageContainer}>
      <Navbar />

      <div className={s.container}>
        {/* Mobile Filter Toggle */}
        <div className={s.mobileFilterButtonWrapper}>
          <button
            onClick={() => setShowMobileFilters(true)}
            className={s.mobileFilterButton}
          >
            <HiFilter /> Show Filters & Search
          </button>
        </div>

        <div className={s.layout}>
          {/* Sidebar Filters */}
          <aside
            className={`${s.sidebar} ${showMobileFilters ? s.sidebarVisible : s.sidebarHidden}`}
          >
            <div className={s.sidebarHeader}>
              <div className={s.sidebarTitleWrapper}>
                <HiFilter className={s.sidebarTitleIcon} />
                <h2 className={s.sidebarTitle}>Filters</h2>
              </div>
              <div className={s.sidebarHeaderActions}>
                {user?.role === "buyer" && (
                  <button 
                    onClick={handleSaveSearch} 
                    disabled={savingSearch} 
                    className="text-primary hover:text-primary-dark hover:underline bg-transparent border-none text-sm font-semibold cursor-pointer mr-3 transition-colors duration-200"
                  >
                    {savingSearch ? "Saving..." : "Save Search"}
                  </button>
                )}
                <button onClick={resetFilters} className={s.resetButton}>
                  Reset
                </button>
                <button
                  className={s.closeMobileFilters}
                  onClick={() => setShowMobileFilters(false)}
                >
                  <HiX />
                </button>
              </div>
            </div>

            <div className={s.filtersScrollArea}>
              {/* Location */}
              <div className={s.filterSection}>
                <label className={s.filterLabel}>Location</label>
                <div className={s.searchInputWrapper}>
                  <HiSearch className={s.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by city..."
                    value={filters.city}
                    onChange={(e) => {
                      const updatedFilters = {
                        ...filters,
                        city: e.target.value,
                      };
                      setFilters(updatedFilters);
                      debouncedFetch(updatedFilters);
                    }}
                    className={s.searchInput}
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className={s.filterSection}>
                <label className={s.filterLabel}>Price Range</label>
                
                <div className={s.priceHeader} style={{marginTop: '10px'}}>
                  <span style={{fontSize: '0.875rem', color: '#64748b'}}>Min:</span>
                  <span className={s.priceValue}>
                    {filters.minPrice >= 10000000
                      ? `₹${(filters.minPrice / 10000000).toFixed(2)} Cr`
                      : filters.minPrice >= 100000 
                        ? `₹${(filters.minPrice / 100000).toFixed(1)} L`
                        : "₹0"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100000000"
                  step="500000"
                  value={filters.minPrice}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    const updatedFilters = { ...filters, minPrice: value, pageNumber: 1 };
                    setFilters(updatedFilters);
                    debouncedFetch(updatedFilters);
                  }}
                  className={s.priceSlider}
                />

                <div className={s.priceHeader} style={{marginTop: '15px'}}>
                  <span style={{fontSize: '0.875rem', color: '#64748b'}}>Max:</span>
                  <span className={s.priceValue}>
                    {filters.maxPrice >= 10000000
                      ? `₹${(filters.maxPrice / 10000000).toFixed(2)} Cr`
                      : `₹${(filters.maxPrice / 100000).toFixed(1)} L`}
                  </span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="100000000"
                  step="500000"
                  value={filters.maxPrice}
                  onChange={handlePriceChange}
                  className={s.priceSlider}
                />
              </div>

              {/* Property Type */}
              <div className={s.filterSection}>
                <label className={s.filterLabel}>Property Type</label>
                <div className={s.checkboxGroup}>
                  {propertyTypes.map((type) => (
                    <label key={type.value} className={s.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={filters.propertyType.includes(type.value)}
                        onChange={() =>
                          handleCheckboxChange("propertyType", type.value)
                        }
                        className={s.checkbox}
                      />
                      {type.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* BHK */}
              <div className={s.filterSection}>
                <label className={s.filterLabel}>BHK (Bedrooms)</label>
                <div className={s.bhkGroup}>
                  {bhkOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleBhkSelect(option)}
                      className={`${s.bhkButton} ${filters.bhk === option ? s.bhkButtonActive : s.bhkButtonInactive}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Furnishing */}
              <div className={s.filterSection}>
                <label className={s.filterLabel}>Furnishing</label>
                <div className={s.checkboxGroup}>
                  {furnishingOptions.map((option) => (
                    <label key={option.value} className={s.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={filters.furnishing?.includes(option.value)}
                        onChange={() =>
                          handleCheckboxChange("furnishing", option.value)
                        }
                        className={s.checkbox}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className={s.filterSection}>
                <label className={s.filterLabel}>Amenities</label>
                <div className={s.checkboxGroup}>
                  {amenitiesOptions.map((option) => (
                    <label key={option} className={s.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={filters.amenities?.includes(option)}
                        onChange={() =>
                          handleCheckboxChange("amenities", option)
                        }
                        className={s.checkbox}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              {/* Property Age */}
              <div className={s.filterSection}>
                <label className={s.filterLabel}>Listed In</label>
                <select 
                  value={filters.maxAgeDays} 
                  onChange={(e) => {
                    const updatedFilters = { ...filters, maxAgeDays: e.target.value, pageNumber: 1 };
                    setFilters(updatedFilters);
                    fetchProperties(updatedFilters);
                  }}
                  className="w-full p-3 mt-1 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-white text-slate-700 font-medium"
                >
                  <option value="">Any Time</option>
                  <option value="7">Past 7 Days</option>
                  <option value="30">Past 30 Days</option>
                  <option value="180">Past 6 Months</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className={s.mainContent}>
            {/* Header Section */}
            <div className={s.contentHeader}>
              <div>
                <span className={s.resultCount}>
                  Showing{" "}
                  <strong className={s.resultCountStrong}>
                    {loading ? "..." : totalCount}
                  </strong>{" "}
                  properties
                </span>
              </div>
              <div className={s.headerControls}>
                <div className={s.viewModeToggle}>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`${s.viewModeButton} ${viewMode === "grid" ? s.viewModeActive : s.viewModeInactive}`}
                  >
                    <HiViewGrid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`${s.viewModeButton} ${viewMode === "list" ? s.viewModeActive : s.viewModeInactive}`}
                  >
                    <HiViewList size={20} />
                  </button>
                </div>
                <div className={s.sortControl}>
                  <span className={s.sortLabel}>Sort:</span>
                  <select
                    value={filters.sort}
                    onChange={handleSortChange}
                    className={s.sortSelect}
                  >
                    <option value="latest">Latest</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Property Grid */}
            {loading ? (
              <div className={s.skeletonGrid}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={s.skeletonCard}></div>
                ))}
              </div>
            ) : error ? (
              <div className={s.errorContainer}>
                <HiX size={48} className={s.errorIcon} />
                <h3 className={s.errorTitle}>{error}</h3>
                <button onClick={applyFilters} className={s.errorButton}>
                  Try Again
                </button>
              </div>
            ) : properties.length === 0 ? (
              <div className={s.emptyContainer}>
                <div className={s.emptyIconWrapper}>
                  <HiAdjustments size={32} className={s.emptyIcon} />
                </div>
                <h2 className={s.emptyTitle}>No properties found</h2>
                <p className={s.emptyText}>Broaden your search criteria.</p>
                <button onClick={resetFilters} className={s.emptyButton}>
                  Clear All
                </button>
              </div>
            ) : (
              <div
                className={`${s.propertyList} ${viewMode === "grid" ? s.propertyListGrid : s.propertyListList}`}
              >
                {properties
                  .filter((p) => p)
                  .map((p) => (
                    <PropertyCard
                      key={(p.id || p._id)}
                      property={p}
                      isWishlisted={wishlistedIds.includes(String((p.id || p._id)))}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
              </div>
            )}
            
            {!loading && !error && totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8 mb-8">
                <button 
                  onClick={() => handlePageChange(filters.pageNumber - 1)}
                  disabled={filters.pageNumber === 1}
                  className={`px-4 py-2.5 rounded-lg border font-semibold transition-all duration-200 ${
                    filters.pageNumber === 1 
                      ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" 
                      : "bg-white border-slate-200 text-slate-700 hover:border-primary hover:text-primary shadow-sm"
                  }`}
                >
                  Previous
                </button>
                <div className="flex items-center px-4 font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm">
                  Page {filters.pageNumber} of {totalPages}
                </div>
                <button 
                  onClick={() => handlePageChange(filters.pageNumber + 1)}
                  disabled={filters.pageNumber === totalPages}
                  className={`px-4 py-2.5 rounded-lg border font-semibold transition-all duration-200 ${
                    filters.pageNumber === totalPages 
                      ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" 
                      : "bg-white border-slate-200 text-slate-700 hover:border-primary hover:text-primary shadow-sm"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {showMobileFilters && (
        <div
          onClick={() => setShowMobileFilters(false)}
          className={s.mobileOverlay}
        />
      )}
    </div>
  );
};

export default Properties;
