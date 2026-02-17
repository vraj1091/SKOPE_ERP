import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { CyberButton } from './NextGenUI'; // Import CyberButton for consistency

interface CampaignFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaign_type: 'whatsapp',
    trigger_type: 'manual',
    message_template: '',
    subject: '',
    store_id: user?.store_id || 1,
    geo_location: '',
    start_date: '',
    end_date: '',
    send_time: '',
    days_before_trigger: 0,
    discount_code: '',
    discount_percentage: 0,
    target_customers: {}
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const campaignData = {
        name: formData.name,
        description: formData.description || null,
        campaign_type: formData.campaign_type,
        trigger_type: formData.trigger_type,
        message_template: formData.message_template,
        subject: formData.subject || null,
        store_id: formData.store_id,
        target_customers: formData.target_customers || null,
        geo_location: formData.geo_location || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        send_time: formData.send_time || null,
        days_before_trigger: formData.days_before_trigger || null,
        discount_code: formData.discount_code || null,
        discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage.toString()) : null
      };

      await axios.post('/api/v1/campaigns/', campaignData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to create campaign';
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const messageTemplates = {
    birthday: "🎉 Happy Birthday {customer_name}! 🎂\n\nWe're celebrating YOU today! Get {discount}% OFF on your next purchase.\nUse code: {code}\n\nValid for 7 days. Visit us now! 🎁",
    warranty: "⚠️ Important: Warranty Expiring Soon!\n\nDear {customer_name},\n\nYour product warranty expires in {days} days. Get it serviced or upgrade now!\n\nCall: {store_phone}\n\n🔧 We're here to help!",
    festival: "✨ {festival} Special Offer! ✨\n\nHello {customer_name}!\n\nCelebrate with {discount}% OFF on all products!\nUse code: {code}\n\nOffer valid till {end_date}\n\n🎊 Shop Now!",
    abandoned_cart: "🛒 You left something behind!\n\nHi {customer_name},\n\nComplete your purchase now and get {discount}% OFF!\n\nCode: {code}\nValid for 24 hours only!\n\n💳 Checkout now!",
    referral: "👥 Refer & Earn!\n\nDear {customer_name},\n\nRefer a friend and both get {discount}% OFF!\n\nYour referral code: {code}\n\n💰 Start earning rewards today!",
    no_purchase: "💜 We Miss You!\n\nHi {customer_name},\n\nIt's been a while! Come back and get {discount}% OFF your next purchase.\n\nCode: {code}\nValid for 7 days!\n\n🛍️ See you soon!"
  };

  const loadTemplate = (trigger: string) => {
    const template = messageTemplates[trigger as keyof typeof messageTemplates];
    if (template) {
      setFormData(prev => ({ ...prev, message_template: template }));
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all";
  const labelClasses = "block text-sm font-semibold text-gray-300 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campaign Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>
            Campaign Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={inputClasses}
            placeholder="e.g., Diwali Sale 2024"
          />
        </div>

        <div>
          <label className={labelClasses}>
            Campaign Type *
          </label>
          <select
            name="campaign_type"
            value={formData.campaign_type}
            onChange={handleChange}
            required
            className={inputClasses}
          >
            <option value="whatsapp" className="bg-gray-900 text-white">📱 WhatsApp</option>
            <option value="sms" className="bg-gray-900 text-white">💬 SMS</option>
            <option value="email" className="bg-gray-900 text-white">📧 Email</option>
            <option value="notification" className="bg-gray-900 text-white">🔔 Notification</option>
          </select>
        </div>
      </div>

      {/* Trigger Type */}
      <div>
        <label className={labelClasses}>
          Trigger Type *
        </label>
        <select
          name="trigger_type"
          value={formData.trigger_type}
          onChange={(e) => {
            handleChange(e);
            loadTemplate(e.target.value);
          }}
          required
          className={inputClasses}
        >
          <option value="manual" className="bg-gray-900 text-white">✋ Manual</option>
          <option value="birthday" className="bg-gray-900 text-white">🎂 Birthday</option>
          <option value="festival" className="bg-gray-900 text-white">🎉 Festival</option>
          <option value="warranty_expiry" className="bg-gray-900 text-white">⚠️ Warranty Expiry</option>
          <option value="cart_abandoned" className="bg-gray-900 text-white">🛒 Cart Abandoned</option>
          <option value="no_purchase_30_days" className="bg-gray-900 text-white">⏰ No Purchase (30 days)</option>
          <option value="purchase_anniversary" className="bg-gray-900 text-white">🎊 Purchase Anniversary</option>
          <option value="geo_targeted" className="bg-gray-900 text-white">📍 Geo-Targeted</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className={labelClasses}>
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={2}
          className={inputClasses}
          placeholder="Brief description of your campaign..."
        />
      </div>

      {/* Message Template */}
      <div>
        <label className={labelClasses}>
          Message Template *
        </label>
        <div className="text-xs text-gray-500 mb-2">
          Use variables: {'{customer_name}'}, {'{discount}'}, {'{code}'}, {'{days}'}, {'{festival}'}, {'{end_date}'}
        </div>
        <textarea
          name="message_template"
          value={formData.message_template}
          onChange={handleChange}
          required
          rows={6}
          className={`${inputClasses} font-mono text-sm`}
          placeholder="Type your message here..."
        />
      </div>

      {/* Discount Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>
            Discount Code
          </label>
          <input
            type="text"
            name="discount_code"
            value={formData.discount_code}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g., DIWALI24"
          />
        </div>

        <div>
          <label className={labelClasses}>
            Discount %
          </label>
          <input
            type="number"
            name="discount_percentage"
            value={formData.discount_percentage}
            onChange={handleChange}
            min="0"
            max="100"
            className={inputClasses}
            placeholder="10"
          />
        </div>
      </div>

      {/* Scheduling */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={labelClasses}>
            Start Date
          </label>
          <input
            type="datetime-local"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>
            End Date
          </label>
          <input
            type="datetime-local"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>
            Send Time (HH:MM)
          </label>
          <input
            type="time"
            name="send_time"
            value={formData.send_time}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
      </div>

      {/* Days Before Trigger */}
      {(formData.trigger_type === 'warranty_expiry' || formData.trigger_type === 'birthday') && (
        <div>
          <label className={labelClasses}>
            Days Before Trigger
          </label>
          <input
            type="number"
            name="days_before_trigger"
            value={formData.days_before_trigger}
            onChange={handleChange}
            min="0"
            className={inputClasses}
            placeholder="7"
          />
          <p className="text-xs text-gray-500 mt-1">Send message X days before the event</p>
        </div>
      )}

      {/* Geo Location */}
      {formData.trigger_type === 'geo_targeted' && (
        <div>
          <label className={labelClasses}>
            Geo Location
          </label>
          <input
            type="text"
            name="geo_location"
            value={formData.geo_location}
            onChange={handleChange}
            className={inputClasses}
            placeholder="City, State, or Pincode"
          />
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4 pt-4 border-t border-white/10">
        <CyberButton
          type="submit"
          disabled={loading}
          className="flex-1 justify-center"
        >
          {loading ? '🔄 Creating...' : '🚀 Create Campaign'}
        </CyberButton>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-lg font-semibold text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CampaignForm;

