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
import { sellerDashboardStyles as s } from "../../assets/dummyStyles";

const BuyerDashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState({
    totalPropertiesPurchased: 0,
    totalAmountSpent: 0,
    purchasedProperties: []
  });
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, offersRes] = await Promise.all([
          axios.get(`${API_URL}/api/buyer/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/buyer/offers`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setData(dashRes.data);
        setOffers(offersRes.data);
      } catch (err) {
        console.error("Failed to load buyer dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <div className="loader-full-page"><div className="loader"></div></div>;

  const handleDownloadInvoice = async (transactionId) => {
    try {
      const response = await axios.get(`${API_URL}/api/buyer/invoice/${transactionId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'text'
      });
      
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.open();
        newWindow.document.write(response.data);
        newWindow.document.close();
      } else {
        alert("Please allow popups to download the invoice.");
      }
    } catch (err) {
      console.error("Failed to download invoice:", err);
      alert("Failed to download invoice.");
    }
  };

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
    <>
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
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">Property</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">Location</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">Original Price</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">Offer Amount</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">Date</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">Status</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {data.purchasedProperties.map((p) => (
                    <tr key={p.propertyId} className="border-b border-slate-200 hover:bg-slate-50 transition-colors duration-200 group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.title} className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                              <HiOutlineHome size={20} className="text-slate-400" />
                            </div>
                          )}
                          <Link to={`/property/${p.propertyId}`} className="font-bold text-slate-800 text-sm hover:text-primary transition-colors">
                            {p.title}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-600 text-sm">{p.location}</td>
                      <td className="px-6 py-5 text-slate-600 text-sm font-medium">₹{p.originalPrice?.toLocaleString("en-IN") || p.price?.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-5 text-slate-900 font-extrabold text-sm">
                        {p.offerPrice ? `₹${p.offerPrice.toLocaleString("en-IN")}` : <span className="text-slate-400 font-semibold">No Offer</span>}
                      </td>
                      <td className="px-6 py-5 text-slate-600 text-sm font-medium">{new Date(p.transactionDate).toLocaleDateString()}</td>
                      <td className="px-6 py-5">
                        {p.status === "Completed" ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                            <HiOutlineCheckCircle size={16} /> {p.status}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                            <HiOutlineClock size={16} /> {p.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        {p.status === "Completed" && p.transactionId ? (
                          <button 
                            onClick={() => handleDownloadInvoice(p.transactionId)}
                            className="bg-slate-900 hover:bg-primary text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                          >
                            Download
                          </button>
                        ) : (
                          <span className="text-slate-400 text-sm font-medium">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className={s.listingsSection} style={{ marginTop: '2.5rem' }}>
        <div className={s.listingsHeader}>
          <h2 className={s.listingsTitle}>My Submitted Offers</h2>
        </div>

        {offers.length === 0 ? (
          <div className={s.emptyListings}>
            You haven't submitted any offers yet.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">Property</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">Offer Amount</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">Original Price</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">Date</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => (
                    <tr key={offer.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors duration-200 group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {offer.propertyImageUrl ? (
                            <img src={offer.propertyImageUrl} alt={offer.propertyTitle} className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                              <HiOutlineHome size={20} className="text-slate-400" />
                            </div>
                          )}
                          <Link to={`/property/${offer.propertyId}`} className="font-bold text-slate-800 text-sm hover:text-primary transition-colors">
                            {offer.propertyTitle}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-900 font-extrabold text-sm">₹{offer.offerAmount.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-5 text-slate-600 text-sm font-medium">₹{offer.propertyPrice.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-5 text-slate-600 text-sm font-medium">{new Date(offer.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                          offer.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 
                          offer.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {offer.status === 'Accepted' && <HiOutlineCheckCircle size={16} />}
                          {offer.status === 'Pending' && <HiOutlineClock size={16} />}
                          {offer.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BuyerDashboard;
