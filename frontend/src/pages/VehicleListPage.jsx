import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Grid, List, MapPin, Calendar, Fuel, Settings, Play } from 'lucide-react';
import api, { getStorageUrl, getPlaceholderImage } from '../lib/api';

const VehicleListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('list');
  const [filters, setFilters] = useState({
    query: searchParams.get('query') || '',
    type: searchParams.get('type') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    year: searchParams.get('year') || '',
    city: searchParams.get('city') || '',
    condition: searchParams.get('condition') || '',
    transmission: searchParams.get('transmission') || '',
    fuel_type: searchParams.get('fuel_type') || '',
    featured: searchParams.get('featured') || '',
    sort_by: searchParams.get('sort_by') || 'created_at',
    sort_order: searchParams.get('sort_order') || 'desc',
    page: parseInt(searchParams.get('page')) || 1,
    per_page: 12,
  });

  // Fetch vehicles using React Query
  const { data: vehiclesData, isLoading, error, refetch } = useQuery({
    queryKey: ['vehicles', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/vehicles?${params.toString()}`);
      return response.data;
    },
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);

    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== '' && k !== 'per_page') {
        newSearchParams.set(k, v.toString());
      }
    });
    setSearchParams(newSearchParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price).replace('PKR', 'Rs');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Browse Vehicles</h1>
              <p className="mt-2 text-gray-600">
                {vehiclesData?.pagination?.total || 0} vehicles available
              </p>
            </div>

            {/* View Toggle */}
            <div className="mt-4 lg:mt-0 flex items-center space-x-2">
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h3>

              {/* Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Vehicles
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by make, model, or keyword... (e.g., Toyota, Corolla, Honda)"
                    value={filters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                    className="w-full px-3 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Search works across vehicle titles, descriptions, makes, and models
                </p>
              </div>

              {/* Vehicle Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Types</option>
                  <option value="cars">Cars</option>
                  <option value="bikes">Bikes</option>
                  <option value="trucks">Trucks</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.min_price}
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.max_price}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Year */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  placeholder="e.g. 2020"
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* City */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  placeholder="e.g. Lahore"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Condition */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <select
                  value={filters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Conditions</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="certified_pre_owned">Certified Pre-owned</option>
                </select>
              </div>

              {/* Sort */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={`${filters.sort_by}-${filters.sort_order}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFilterChange('sort_by', sortBy);
                    handleFilterChange('sort_order', sortOrder);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="year-desc">Year: Newest</option>
                  <option value="year-asc">Year: Oldest</option>
                  <option value="views_count-desc">Most Popular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 mt-8 lg:mt-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Error loading vehicles. Please try again.</p>
                <button
                  onClick={() => refetch()}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : vehiclesData?.data?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No vehicles found matching your criteria.</p>
              </div>
            ) : (
              <>
                {/* Vehicle Grid/List */}
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-6'
                }>
                  {vehiclesData?.data?.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      viewMode={viewMode}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {vehiclesData?.pagination && (
                  <Pagination
                    pagination={vehiclesData.pagination}
                    onPageChange={(page) => handleFilterChange('page', page)}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Vehicle Card Component with Video Hover
const VehicleCard = ({ vehicle, viewMode, formatPrice }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardClass = viewMode === 'grid'
    ? 'bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden'
    : 'bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex';

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className={cardClass}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Media Section with Video Hover */}
      <div className={viewMode === 'grid' ? 'aspect-w-16 aspect-h-9 relative' : 'w-48 h-32 flex-shrink-0 relative'}>
        {isHovered && vehicle.video_path ? (
          <video
            src={getStorageUrl(vehicle.video_path)}
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={
              vehicle.primary_image?.path
                ? getStorageUrl(vehicle.primary_image.path)
                : getPlaceholderImage(400, 300, 'No Image')
            }
            alt={vehicle.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = getPlaceholderImage(400, 300, 'No Image');
            }}
          />
        )}

        {/* Video Indicator */}
        {vehicle.video_path && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800" style={{backgroundColor: '#ccfbf1', color: '#008080'}}>
              <Play className="h-3 w-3 mr-1" />
              Video
            </span>
          </div>
        )}

        {/* Hover Instruction */}
        {vehicle.video_path && !isHovered && (
          <div className="absolute bottom-2 right-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black bg-opacity-50 text-white">
              Hover to play
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {vehicle.title}
          </h3>
          {vehicle.is_featured && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>

        <p className="text-2xl font-bold text-green-600 mb-2">
          {formatPrice(vehicle.price)}
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
          <Fuel className="h-4 w-4 mr-1" />
          <span>{vehicle.fuel_type}</span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">
          {vehicle.description}
        </p>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>{vehicle.make?.name} {vehicle.model?.name}</span>
          <span>{vehicle.views_count} views</span>
        </div>
      </div>
    </Link>
  );
};

// Pagination Component
const Pagination = ({ pagination, onPageChange }) => {
  const { current_page, last_page, from, to, total } = pagination;

  return (
    <div className="mt-8 flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Showing {from} to {to} of {total} results
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>

        {Array.from({ length: Math.min(5, last_page) }, (_, i) => {
          const page = i + 1;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 text-sm border rounded-md ${
                current_page === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default VehicleListPage;
