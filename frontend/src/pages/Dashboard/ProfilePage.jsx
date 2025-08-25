import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  X,
  Camera,
  Trash2,
  Eye,
  Heart,
  Car,
  TrendingUp,
  Calendar,
  Lock,
  Upload
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api, { getStorageUrl, getPlaceholderImage } from '../../lib/api';

const ProfilePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    city: '',
    state: '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/profile');
      return response.data.data;
    },
  });

  // Update form data when profile data is loaded
  useEffect(() => {
    if (profileData?.user) {
      setFormData({
        name: profileData.user.name || '',
        email: profileData.user.email || '',
        phone: profileData.user.phone || '',
        bio: profileData.user.bio || '',
        city: profileData.user.city || '',
        state: profileData.user.state || '',
      });
    }
  }, [profileData]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();

      // Append form fields
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          formDataToSend.append(key, data[key]);
        }
      });

      // Append avatar if selected
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      // Add _method field for Laravel to handle PUT with FormData
      formDataToSend.append('_method', 'PUT');

      const response = await api.post('/profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setErrors({});
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrors(error.response?.data?.errors || {});
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/profile', data);
      return response.data;
    },
    onSuccess: () => {
      setShowPasswordForm(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
      setErrors({});
      setSuccessMessage('Password updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrors(error.response?.data?.errors || {});
    },
  });

  // Delete avatar mutation
  const deleteAvatarMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/profile/avatar');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
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

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    updatePasswordMutation.mutate(passwordData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setErrors({});
    // Reset form data
    if (profileData?.user) {
      setFormData({
        name: profileData.user.name || '',
        email: profileData.user.email || '',
        phone: profileData.user.phone || '',
        bio: profileData.user.bio || '',
        city: profileData.user.city || '',
        state: profileData.user.state || '',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-32 bg-gray-200 rounded-full w-32 mx-auto mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors flex items-center space-x-2"
            style={{backgroundColor: '#008080'}}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#006666'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#008080'}
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit}>
              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : profileData?.user?.avatar ? (
                      <img
                        src={getStorageUrl(profileData.user.avatar)}
                        alt="User avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-gray-400" />
                    )}
                  </div>

                  {isEditing && (
                    <div className="absolute bottom-0 right-0">
                      <label className="bg-teal-600 text-white p-2 rounded-full cursor-pointer hover:bg-teal-700 transition-colors">
                        <Camera className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {profileData?.user?.avatar && !isEditing && (
                  <button
                    onClick={() => deleteAvatarMutation.mutate()}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm flex items-center space-x-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Remove Avatar</span>
                  </button>
                )}

                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  {profileData?.user?.name}
                </h2>
                <p className="text-gray-600">{profileData?.user?.email}</p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-2" />
                    Full Name *
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData?.user?.name || 'Not provided'}</p>
                  )}
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email Address *
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter your email"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData?.user?.email}</p>
                  )}
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-2" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="+92 300 1234567"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData?.user?.phone || 'Not provided'}</p>
                  )}
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone[0]}</p>}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-2" />
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter your city"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData?.user?.city || 'Not provided'}</p>
                  )}
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city[0]}</p>}
                </div>
              </div>

              {/* State */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter your state/province"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profileData?.user?.state || 'Not provided'}</p>
                )}
                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state[0]}</p>}
              </div>

              {/* Bio */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profileData?.user?.bio || 'No bio provided'}</p>
                )}
                {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio[0]}</p>}
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="text-teal-600 hover:text-teal-800 flex items-center space-x-2"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Change Password</span>
                  </button>

                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isLoading}
                      className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                      style={{backgroundColor: '#008080'}}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#006666'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#008080'}
                    >
                      <Save className="h-4 w-4" />
                      <span>{updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Password Change Form */}
            {showPasswordForm && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <form onSubmit={handlePasswordSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter current password"
                      />
                      {errors.current_password && <p className="text-red-500 text-sm mt-1">{errors.current_password[0]}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter new password"
                      />
                      {errors.new_password && <p className="text-red-500 text-sm mt-1">{errors.new_password[0]}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.new_password_confirmation}
                        onChange={(e) => handlePasswordChange('new_password_confirmation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({
                          current_password: '',
                          new_password: '',
                          new_password_confirmation: '',
                        });
                        setErrors({});
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updatePasswordMutation.isLoading}
                      className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50"
                      style={{backgroundColor: '#008080'}}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#006666'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#008080'}
                    >
                      {updatePasswordMutation.isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Sidebar */}
        <div className="space-y-6">
          {/* Account Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-teal-600" />
              Account Statistics
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Car className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">Total Vehicles</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {profileData?.stats?.total_vehicles || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-4 w-4 mr-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Active Listings</span>
                </div>
                <span className="font-semibold text-green-600">
                  {profileData?.stats?.active_vehicles || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-4 w-4 mr-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Sold Vehicles</span>
                </div>
                <span className="font-semibold text-blue-600">
                  {profileData?.stats?.sold_vehicles || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">Total Views</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {profileData?.stats?.total_views || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-red-500" />
                  <span className="text-sm text-gray-600">Total Favorites</span>
                </div>
                <span className="font-semibold text-red-600">
                  {profileData?.stats?.total_favorites || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-teal-600" />
              Account Information
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Member Since</span>
                <p className="font-medium text-gray-900">
                  {profileData?.user?.created_at
                    ? new Date(profileData.user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Unknown'
                  }
                </p>
              </div>

              <div>
                <span className="text-sm text-gray-600">Account Status</span>
                <div className="flex items-center mt-1">
                  <div className={`h-2 w-2 rounded-full mr-2 ${
                    profileData?.user?.is_verified ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    profileData?.user?.is_verified ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {profileData?.user?.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-600">Last Active</span>
                <p className="font-medium text-gray-900">
                  {profileData?.user?.last_active_at
                    ? new Date(profileData.user.last_active_at).toLocaleDateString()
                    : 'Unknown'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

            <div className="space-y-3">
              <Link
                to="/dashboard/create-listing"
                className="block w-full text-left px-4 py-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Upload className="h-4 w-4 mr-3 text-teal-600" />
                  <div>
                    <p className="font-medium text-gray-900">Create New Listing</p>
                    <p className="text-sm text-gray-600">Add a new vehicle for sale</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/dashboard/my-listings"
                className="block w-full text-left px-4 py-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Car className="h-4 w-4 mr-3 text-teal-600" />
                  <div>
                    <p className="font-medium text-gray-900">View My Listings</p>
                    <p className="text-sm text-gray-600">Manage your vehicles</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
