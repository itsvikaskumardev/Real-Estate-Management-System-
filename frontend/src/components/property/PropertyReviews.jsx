import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config';
import { HiStar, HiOutlineStar, HiTrash, HiPencil } from 'react-icons/hi';
import { useNotification } from '../../context/NotificationContext';

const PropertyReviews = ({ propertyId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  const { user, token } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/property/${propertyId}/reviews`);
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || user?.role !== 'buyer') {
      alert("Only buyers can submit reviews.");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/property/reviews/${editingId}`, { rating, comment }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showNotification?.("success", "Review updated successfully");
      } else {
        await axios.post(`${API_URL}/api/property/${propertyId}/reviews`, { rating, comment }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showNotification?.("success", "Review added successfully");
      }
      
      setRating(5);
      setComment('');
      setEditingId(null);
      fetchReviews();
    } catch (err) {
      console.error(err);
      showNotification?.("error", "Failed to submit review");
    }
  };

  const handleEdit = (review) => {
    setEditingId(review.id);
    setRating(review.rating);
    setComment(review.comment);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(`${API_URL}/api/property/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification?.("success", "Review deleted");
      fetchReviews();
    } catch (err) {
      console.error(err);
      showNotification?.("error", "Failed to delete review");
    }
  };

  const renderStars = (count, interactive = false, onStarClick = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <span 
            key={star} 
            onClick={() => interactive && onStarClick(star)}
            className={`${interactive ? 'cursor-pointer' : ''} text-[#f59e0b]`}
          >
            {star <= count ? <HiStar size={20} /> : <HiOutlineStar size={20} />}
          </span>
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="mt-10">
      <h3 className="text-2xl font-bold mb-6">Reviews & Ratings</h3>
      
      <div className="flex items-center gap-4 mb-8 bg-[#f8fafc] p-6 rounded-2xl border border-[#f1f5f9]">
        <div className="text-4xl font-extrabold text-[#0d6e59]">{averageRating}</div>
        <div>
          {renderStars(Math.round(averageRating))}
          <div className="text-sm text-[#64748b] mt-1">Based on {reviews.length} review(s)</div>
        </div>
      </div>

      {user?.role === 'buyer' && (
        <form onSubmit={handleSubmit} className="mb-10 bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm">
          <h4 className="text-lg font-bold mb-4">{editingId ? 'Edit Your Review' : 'Write a Review'}</h4>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-[#475569]">Rating</label>
            {renderStars(rating, true, setRating)}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-[#475569]">Comment</label>
            <textarea 
              className="w-full p-3 rounded-xl border border-[#e2e8f0] outline-none focus:border-[#0d6e59]"
              rows="4" 
              value={comment} 
              onChange={e => setComment(e.target.value)}
              required 
              placeholder="Share your thoughts about this property..."
            ></textarea>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2.5 bg-[#0d6e59] text-white font-bold rounded-xl hover:bg-[#0a5746] transition-colors">
              {editingId ? 'Update Review' : 'Submit Review'}
            </button>
            {editingId && (
              <button type="button" onClick={() => {setEditingId(null); setRating(5); setComment('');}} className="px-6 py-2.5 bg-[#f1f5f9] text-[#475569] font-bold rounded-xl hover:bg-[#e2e8f0] transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-6 text-[#64748b]">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 bg-[#f8fafc] rounded-2xl border border-[#f1f5f9] text-[#64748b]">
          No reviews yet. Be the first to review!
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {reviews.map(review => (
            <div key={review.id} className="p-6 bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ccfbf1] text-[#0f766e] flex items-center justify-center font-bold text-lg">
                    {review.buyerName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-[#1e293b]">{review.buyerName || 'Anonymous User'}</div>
                    <div className="text-xs text-[#94a3b8]">{new Date(review.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                {user?.id === review.buyerId && (
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(review)} className="p-2 text-[#64748b] hover:text-[#0d6e59] hover:bg-[#f1f5f9] rounded-lg transition-colors">
                      <HiPencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(review.id)} className="p-2 text-[#64748b] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <HiTrash size={18} />
                    </button>
                  </div>
                )}
              </div>
              <div className="mb-3">
                {renderStars(review.rating)}
              </div>
              <p className="text-[#475569] leading-relaxed break-words">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyReviews;
