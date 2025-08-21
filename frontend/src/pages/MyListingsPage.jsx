import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Car, 
  Edit, 
  Trash2, 
  Eye, 
  Heart, 
  Calendar,
  MapPin,
  DollarSign,
  Settings,
  Plus,
  Filter,
  Grid,
  List,
  MoreVertical,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import api from '../lib/api';

const MyListingsPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const queryClient = useQueryClient();

  // Fetch user's vehicles
  const { data: vehiclesData, isLoading, error, refetch } = useQuery({
    queryKey: ['my-vehicles', statusFilter, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      params.append('sort_by', sortBy);
      params.append('sort_order', sortOrder);
      params.append('per_page', '20');

      const response = await api.get(`/my-vehicles?${params.toString()}`);
      return response.data;
    },
  });

  // Delete vehicle mutation
  const deleteVehicleMutation = useMutation({
    mutationFn: async (vehicleId) => {
      const response = await api.delete(`/vehicles/${vehicleId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-vehicles']);
    },
    onError: (error) => {
      alert('Failed to delete vehicle: ' + (error.response?.data?.message || 'Unknown error'));
    },
  });

  const handleDelete = (vehicle) => {
    if (window.confirm(`Are you sure you want to delete "${vehicle.title}"? This action cannot be undone.`)) {
      deleteVehicleMutation.mutate(vehicle.id);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price).replace('PKR', 'Rs');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'sold':
        return <XCircle className="h-4 w-4 text-blue-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Car className="h-8 w-8 mr-3 text-blue-600" />
                My Listings
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your vehicle advertisements
                {vehiclesData?.pagination?.total !== undefined && (
                  <span className="ml-2 font-medium">
                    ({vehiclesData.pagination.total} total)
                  </span>
                )}
              </p>
            </div>
            
            <div className="mt-4 lg:mt-0">
              <Link
                to="/dashboard/create-listing"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Listing
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Status Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="sold">Sold</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                  <option value="updated_at-desc">Recently Updated</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="views_count-desc">Most Views</option>
                  <option value="title-asc">Title A-Z</option>
                </select>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {vehiclesData?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Active Listings</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {vehiclesData.stats.active_listings}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Eye className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Views</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {vehiclesData.data?.reduce((sum, v) => sum + (v.views_count || 0), 0) || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Favorites</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {vehiclesData.data?.reduce((sum, v) => sum + (v.favorites_count || 0), 0) || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircle className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Sold</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {vehiclesData.stats.sold_listings}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Error loading your listings</p>
            <button 
              onClick={() => refetch()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : !vehiclesData?.data?.length ? (
          <div className="text-center py-12">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            {statusFilter === 'all' ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
                <p className="text-gray-600 mb-6">Start by creating your first vehicle listing</p>
                <Link
                  to="/dashboard/create-listing"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Listing
                </Link>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {statusFilter} listings found
                </h3>
                <p className="text-gray-600 mb-6">
                  You don't have any listings with "{statusFilter}" status
                </p>
                <div className="space-x-4">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    View All Listings
                  </button>
                  <Link
                    to="/dashboard/create-listing"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Listing
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Vehicle Grid/List */}
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {vehiclesData.data.map((vehicle) => (
                <VehicleCard 
                  key={vehicle.id} 
                  vehicle={vehicle} 
                  viewMode={viewMode}
                  formatPrice={formatPrice}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                  onDelete={handleDelete}
                  isDeleting={deleteVehicleMutation.isPending}
                />
              ))}
            </div>

            {/* Pagination */}
            {vehiclesData?.pagination && vehiclesData.pagination.last_page > 1 && (
              <div className="mt-8 flex items-center justify-center">
                <div className="text-sm text-gray-700">
                  Showing {vehiclesData.pagination.from} to {vehiclesData.pagination.to} of {vehiclesData.pagination.total} listings
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Vehicle Card Component
const VehicleCard = ({ vehicle, viewMode, formatPrice, getStatusIcon, getStatusColor, onDelete, isDeleting }) => {
  const [showActions, setShowActions] = useState(false);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowActions(false);
    if (showActions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showActions]);

  const cardClass = viewMode === 'grid' 
    ? 'bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden'
    : 'bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex';

  return (
    <div className={cardClass}>
      {/* Image */}
      <div className={viewMode === 'grid' ? 'aspect-w-16 aspect-h-9 relative' : 'w-48 h-32 flex-shrink-0 relative'}>
        <img
          src={vehicle.primary_image?.path ? `http://127.0.0.1:8000/storage/${vehicle.primary_image.path}` : 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=No+Image'}
          alt={vehicle.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=No+Image';
          }}
        />
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
            {getStatusIcon(vehicle.status)}
            <span className="ml-1 capitalize">{vehicle.status}</span>
          </span>
        </div>

        {/* Featured Badge */}
        {vehicle.is_featured && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
            {vehicle.title}
          </h3>
          
          {/* Actions Menu */}
          <div className="relative ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {showActions && (
              <div
                className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1">
                  <Link
                    to={`/vehicles/${vehicle.id}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Listing
                  </Link>
                  <Link
                    to={`/dashboard/edit-listing/${vehicle.id}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Listing
                  </Link>
                  <button
                    onClick={() => onDelete(vehicle)}
                    disabled={isDeleting}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Listing
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-2xl font-bold text-green-600 mb-2">
          {formatPrice(vehicle.price)}
          {vehicle.is_negotiable && (
            <span className="text-sm font-normal text-gray-500 ml-2">Negotiable</span>
          )}
        </p>
        
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{vehicle.year}</span>
          <span className="mx-2">•</span>
          <MapPin className="h-4 w-4 mr-1" />
          <span>{vehicle.city}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <Settings className="h-4 w-4 mr-1" />
          <span>{vehicle.transmission}</span>
          <span className="mx-2">•</span>
          <span>{vehicle.fuel_type}</span>
          <span className="mx-2">•</span>
          <span>{vehicle.mileage?.toLocaleString()} km</span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {vehicle.views_count} views
            </span>
            <span className="flex items-center">
              <Heart className="h-3 w-3 mr-1" />
              {vehicle.favorites_count} favorites
            </span>
          </div>
          <span>
            {new Date(vehicle.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MyListingsPage;
