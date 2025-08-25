import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Car, 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import api, { getStorageUrl, getPlaceholderImage } from '../../lib/api';

const GaragePage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch garage vehicles
  const { data: garageData, isLoading, refetch } = useQuery({
    queryKey: ['garage', statusFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await api.get(`/garage?${params}`);
      return response.data.data;
    },
  });

  // Fetch garage statistics
  const { data: statsData } = useQuery({
    queryKey: ['garage-statistics'],
    queryFn: async () => {
      const response = await api.get('/garage/statistics');
      return response.data.data;
    },
  });

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'owned': return 'bg-green-100 text-green-800';
      case 'for_sale': return 'bg-blue-100 text-blue-800';
      case 'sold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'owned': return <CheckCircle className="h-4 w-4" />;
      case 'for_sale': return <DollarSign className="h-4 w-4" />;
      case 'sold': return <Clock className="h-4 w-4" />;
      default: return <Car className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Car className="h-8 w-8 mr-3 text-teal-600" />
            My Garage
          </h1>
          <p className="text-gray-600 mt-2">Manage your personal vehicles and maintenance history</p>
        </div>
        <Link
          to="/dashboard/garage/add"
          className="bg-teal-600 text-white px-6 py-3 rounded-md hover:bg-teal-700 transition-colors flex items-center space-x-2"
          style={{backgroundColor: '#008080'}}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#006666'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#008080'}
        >
          <Plus className="h-5 w-5" />
          <span>Add Vehicle</span>
        </Link>
      </div>

      {/* Statistics Cards */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-teal-100">
                <Car className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.total_vehicles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Owned</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.owned_vehicles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">For Sale</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.for_sale_vehicles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Wrench className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Maintenance Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs {statsData.total_maintenance_cost?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or license plate..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </form>

          <div className="flex items-center space-x-4">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="owned">Owned</option>
              <option value="for_sale">For Sale</option>
              <option value="sold">Sold</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles Grid/List */}
      {garageData?.data?.length === 0 ? (
        <div className="text-center py-16">
          <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles in your garage</h3>
          <p className="text-gray-600 mb-6">Start by adding your first vehicle to track its maintenance history.</p>
          <Link
            to="/dashboard/garage/add"
            className="bg-teal-600 text-white px-6 py-3 rounded-md hover:bg-teal-700 transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Your First Vehicle</span>
          </Link>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-6'
        }>
          {garageData?.data?.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {garageData?.last_page > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            {/* Add pagination controls here */}
          </div>
        </div>
      )}
    </div>
  );
};

// Vehicle Card Component
const VehicleCard = ({ vehicle, viewMode }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'owned': return 'bg-green-100 text-green-800';
      case 'for_sale': return 'bg-blue-100 text-blue-800';
      case 'sold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'owned': return <CheckCircle className="h-4 w-4" />;
      case 'for_sale': return <DollarSign className="h-4 w-4" />;
      case 'sold': return <Clock className="h-4 w-4" />;
      default: return <Car className="h-4 w-4" />;
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-6">
        {/* Vehicle Image */}
        <div className="w-32 h-24 flex-shrink-0">
          <img
            src={vehicle.images?.[0] ? getStorageUrl(vehicle.images[0]) : getPlaceholderImage(300, 200, 'No Image')}
            alt={vehicle.name}
            className="w-full h-full object-cover rounded-md"
          />
        </div>

        {/* Vehicle Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{vehicle.name}</h3>
              <p className="text-gray-600">{vehicle.full_name}</p>
              <p className="text-sm text-gray-500">{vehicle.license_plate || 'No license plate'}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                {getStatusIcon(vehicle.status)}
                <span className="ml-1 capitalize">{vehicle.status.replace('_', ' ')}</span>
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {vehicle.year}
              </span>
              <span className="flex items-center">
                <Wrench className="h-4 w-4 mr-1" />
                {vehicle.maintenance_logs_count || 0} logs
              </span>
              <span className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                Rs {vehicle.total_maintenance_cost?.toLocaleString() || 0}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to={`/dashboard/garage/${vehicle.id}`}
                className="text-teal-600 hover:text-teal-800 p-2 rounded-md hover:bg-teal-50"
              >
                <Eye className="h-4 w-4" />
              </Link>
              <Link
                to={`/dashboard/garage/${vehicle.id}/edit`}
                className="text-gray-600 hover:text-gray-800 p-2 rounded-md hover:bg-gray-50"
              >
                <Edit className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Vehicle Image */}
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        <img
          src={vehicle.images?.[0] ? getStorageUrl(vehicle.images[0]) : getPlaceholderImage(400, 300, 'No Image')}
          alt={vehicle.name}
          className="w-full h-48 object-cover"
        />
      </div>

      {/* Vehicle Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{vehicle.name}</h3>
            <p className="text-gray-600">{vehicle.full_name}</p>
            <p className="text-sm text-gray-500">{vehicle.license_plate || 'No license plate'}</p>
          </div>
          
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
            {getStatusIcon(vehicle.status)}
            <span className="ml-1 capitalize">{vehicle.status.replace('_', ' ')}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {vehicle.year}
          </span>
          <span className="flex items-center">
            <Wrench className="h-4 w-4 mr-1" />
            {vehicle.maintenance_logs_count || 0} logs
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-600">Maintenance Cost:</span>
            <span className="font-semibold text-gray-900 ml-1">
              Rs {vehicle.total_maintenance_cost?.toLocaleString() || 0}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to={`/dashboard/garage/${vehicle.id}`}
              className="text-teal-600 hover:text-teal-800 p-2 rounded-md hover:bg-teal-50"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <Link
              to={`/dashboard/garage/${vehicle.id}/edit`}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-md hover:bg-gray-50"
            >
              <Edit className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GaragePage;
