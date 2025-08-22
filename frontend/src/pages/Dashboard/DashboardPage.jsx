import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Car,
  Bike,
  Truck,
  Plus,
  Eye,
  Heart,
  List,
  User,
  TrendingUp,
  Calendar,
  MapPin,
  Search,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';

const DashboardPage = () => {
  const { user } = useAuth();

  // Fetch user's vehicle stats
  const { data: statsData } = useQuery({
    queryKey: ['my-vehicle-stats'],
    queryFn: async () => {
      const response = await api.get('/my-vehicle-stats');
      return response.data;
    },
  });

  // Fetch category counts
  const { data: categoryCountsData, isLoading: countsLoading } = useQuery({
    queryKey: ['category-counts'],
    queryFn: async () => {
      const response = await api.get('/category-counts');
      return response.data;
    },
  });

  const categoryCounts = categoryCountsData?.data;

  const categories = [
    {
      name: 'Cars',
      slug: 'cars',
      icon: Car,
      description: 'Sedans, SUVs, Hatchbacks & More',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      name: 'Bikes',
      slug: 'bikes',
      icon: Bike,
      description: 'Motorcycles, Scooters & Two-wheelers',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      name: 'Trucks',
      slug: 'trucks',
      icon: Truck,
      description: 'Commercial Vehicles & Heavy Duty',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  const quickActions = [
    {
      name: 'Create Listing',
      description: 'Sell your vehicle',
      icon: Plus,
      href: '/dashboard/create-listing',
      color: 'bg-blue-600 hover:bg-blue-700',
      iconColor: 'text-white',
    },
    {
      name: 'My Listings',
      description: 'Manage your ads',
      icon: List,
      href: '/dashboard/my-listings',
      color: 'bg-gray-600 hover:bg-gray-700',
      iconColor: 'text-white',
    },
    {
      name: 'Profile',
      description: 'Update your info',
      icon: User,
      href: '/dashboard/profile',
      color: 'bg-purple-600 hover:bg-purple-700',
      iconColor: 'text-white',
    },
    {
      name: 'Browse All',
      description: 'View all vehicles',
      icon: Search,
      href: '/vehicles',
      color: 'bg-indigo-600 hover:bg-indigo-700',
      iconColor: 'text-white',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your vehicle listings and explore the marketplace
          </p>
        </div>

        {/* Stats Cards */}
        {statsData?.data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <List className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Listings</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statsData.data.total_listings}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Listings</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statsData.data.active_listings}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Eye className="h-8 w-8 text-purple-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Views</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statsData.data.total_views || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Favorites</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statsData.data.total_favorites || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Browse by Category Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
            <Link
              to="/vehicles"
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.slug}
                  to={`/vehicles?type=${category.slug}`}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 hover:border-blue-300"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`flex-shrink-0 p-3 rounded-lg ${category.iconBg}`}>
                        <IconComponent className={`h-8 w-8 ${category.iconColor}`} />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">
                          Browse {category.name.toLowerCase()}
                        </span>
                        {countsLoading ? (
                          <span className="text-xs text-gray-400 mt-1">
                            Loading...
                          </span>
                        ) : categoryCounts && categoryCounts[category.slug] !== undefined ? (
                          <span className="text-xs text-gray-400 mt-1">
                            {categoryCounts[category.slug].toLocaleString()} vehicles available
                          </span>
                        ) : null}
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Link
                  key={action.name}
                  to={action.href}
                  className={`${action.color} text-white rounded-lg p-6 transition-colors group`}
                >
                  <div className="flex items-center">
                    <IconComponent className="h-8 w-8 mr-4" />
                    <div>
                      <h3 className="font-semibold">{action.name}</h3>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity or Tips Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                  <span className="text-sm font-medium text-blue-600">1</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Create Your First Listing</h3>
                <p className="text-sm text-gray-500">
                  Add photos, details, and pricing to attract potential buyers.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                  <span className="text-sm font-medium text-green-600">2</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Browse the Marketplace</h3>
                <p className="text-sm text-gray-500">
                  Explore vehicles by category to see what's available.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100">
                  <span className="text-sm font-medium text-purple-600">3</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Manage Your Listings</h3>
                <p className="text-sm text-gray-500">
                  Keep your listings updated and respond to interested buyers.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-100">
                  <span className="text-sm font-medium text-orange-600">4</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Complete Your Profile</h3>
                <p className="text-sm text-gray-500">
                  Add contact information to help buyers reach you easily.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
