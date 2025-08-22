import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Car, 
  Save, 
  ArrowLeft,
  Loader
} from 'lucide-react';
import api from '../lib/api';

const EditListingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Fetch vehicle data
  const { data: vehicleData, isLoading, error } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const response = await api.get(`/vehicles/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      // Populate form with existing data
      setFormData({
        title: data.data.title || '',
        description: data.data.description || '',
        price: data.data.price || '',
        is_negotiable: data.data.is_negotiable || false,
        year: data.data.year || '',
        color: data.data.color || '',
        condition: data.data.condition || 'used',
        transmission: data.data.transmission || 'manual',
        fuel_type: data.data.fuel_type || 'petrol',
        engine_capacity: data.data.engine_capacity || '',
        engine_power: data.data.engine_power || '',
        mileage: data.data.mileage || '',
        city: data.data.city || '',
        state: data.data.state || '',
        address: data.data.address || '',
        contact_name: data.data.contact_name || '',
        contact_phone: data.data.contact_phone || '',
        contact_email: data.data.contact_email || '',
        show_phone: data.data.show_phone || true,
        show_email: data.data.show_email || false,
        status: data.data.status || 'active',
        social_media_links: data.data.social_media_links || {
          facebook: '',
          instagram: '',
          twitter: '',
          youtube: '',
          tiktok: '',
          whatsapp: '',
        },
      });
    },
  });

  // Update vehicle mutation
  const updateVehicleMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put(`/vehicles/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      navigate(`/vehicles/${data.data.id}`, {
        state: { message: 'Vehicle listing updated successfully!' }
      });
    },
    onError: (error) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateVehicleMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading vehicle data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-4">The vehicle you're trying to edit doesn't exist or you don't have permission to edit it.</p>
          <button
            onClick={() => navigate('/dashboard/my-listings')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to My Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/my-listings')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to My Listings
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Edit Vehicle Listing</h1>
            <p className="mt-2 text-gray-600">Update your vehicle information</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title[0]}</p>}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description[0]}</p>}
            </div>

            {/* Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (PKR) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price[0]}</p>}
              </div>

              <div className="flex items-center pt-8">
                <input
                  type="checkbox"
                  id="is_negotiable"
                  checked={formData.is_negotiable}
                  onChange={(e) => handleInputChange('is_negotiable', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_negotiable" className="ml-2 text-sm text-gray-700">
                  Price is negotiable
                </label>
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Vehicle Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year[0]}</p>}
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.color && <p className="text-red-500 text-sm mt-1">{errors.color[0]}</p>}
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
                <select
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="certified_pre_owned">Certified Pre-owned</option>
                </select>
                {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition[0]}</p>}
              </div>

              {/* Transmission */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transmission *</label>
                <select
                  value={formData.transmission}
                  onChange={(e) => handleInputChange('transmission', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                  <option value="cvt">CVT</option>
                  <option value="semi_automatic">Semi-Automatic</option>
                </select>
                {errors.transmission && <p className="text-red-500 text-sm mt-1">{errors.transmission[0]}</p>}
              </div>

              {/* Fuel Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type *</label>
                <select
                  value={formData.fuel_type}
                  onChange={(e) => handleInputChange('fuel_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                  <option value="cng">CNG</option>
                  <option value="lpg">LPG</option>
                </select>
                {errors.fuel_type && <p className="text-red-500 text-sm mt-1">{errors.fuel_type[0]}</p>}
              </div>

              {/* Mileage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mileage (KM) *</label>
                <input
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => handleInputChange('mileage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.mileage && <p className="text-red-500 text-sm mt-1">{errors.mileage[0]}</p>}
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Listing Status</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="sold">Sold</option>
                <option value="expired">Expired</option>
              </select>
              {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>}
            </div>
          </div>

          {/* Social Media Links */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Social Media Links (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                <input
                  type="url"
                  value={formData.social_media_links?.facebook || ''}
                  onChange={(e) => handleInputChange('social_media_links', {
                    ...formData.social_media_links,
                    facebook: e.target.value
                  })}
                  placeholder="https://facebook.com/yourprofile"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                <input
                  type="url"
                  value={formData.social_media_links?.instagram || ''}
                  onChange={(e) => handleInputChange('social_media_links', {
                    ...formData.social_media_links,
                    instagram: e.target.value
                  })}
                  placeholder="https://instagram.com/yourprofile"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                <input
                  type="tel"
                  value={formData.social_media_links?.whatsapp || ''}
                  onChange={(e) => handleInputChange('social_media_links', {
                    ...formData.social_media_links,
                    whatsapp: e.target.value
                  })}
                  placeholder="+92 300 1234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                <input
                  type="url"
                  value={formData.social_media_links?.youtube || ''}
                  onChange={(e) => handleInputChange('social_media_links', {
                    ...formData.social_media_links,
                    youtube: e.target.value
                  })}
                  placeholder="https://youtube.com/yourchannel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/my-listings')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateVehicleMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{updateVehicleMutation.isPending ? 'Updating...' : 'Update Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListingPage;
