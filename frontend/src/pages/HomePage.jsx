import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Car, Truck, Bike, Star, Users, Shield, Clock, ArrowRight, Calendar, MapPin, Eye, Heart, Play } from 'lucide-react';
import api from '../lib/api';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch category counts
  const { data: categoryCountsData, isLoading: countsLoading } = useQuery({
    queryKey: ['category-counts'],
    queryFn: async () => {
      const response = await api.get('/category-counts');
      return response.data;
    },
  });

  // Fetch featured vehicles
  const { data: featuredVehiclesData, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured-vehicles'],
    queryFn: async () => {
      const response = await api.get('/featured-vehicles');
      return response.data;
    },
  });

  const categoryCounts = categoryCountsData?.data;
  const featuredVehicles = featuredVehiclesData?.data || [];

  const categories = [
    {
      name: 'Cars',
      slug: 'cars',
      icon: Car,
      description: 'Sedans, SUVs, Hatchbacks & More',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'group-hover:bg-blue-100',
    },
    {
      name: 'Bikes',
      slug: 'bikes',
      icon: Bike,
      description: 'Motorcycles, Scooters & Two-wheelers',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'group-hover:bg-green-100',
    },
    {
      name: 'Trucks',
      slug: 'trucks',
      icon: Truck,
      description: 'Commercial Vehicles & Heavy Duty',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'group-hover:bg-orange-100',
    },
  ];



  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append('query', searchQuery.trim());
      }
      if (selectedType) {
        params.append('type', selectedType);
      }
      params.append('per_page', '6'); // Limit results for demo

      const response = await api.get(`/vehicles/search?${params.toString()}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({ error: 'Search failed. Please try again.' });
    } finally {
      setIsSearching(false);
    }
  };
  return (
    <div>
      {/* API Test Results */}
      {/* <div className="bg-green-500 text-white p-4 m-4" style={{backgroundColor: 'green', color: 'white', padding: '16px', margin: '16px'}}>
        <h3>🔌 API Connection Test:</h3>
        {apiTest ? (
          <pre>{JSON.stringify(apiTest, null, 2)}</pre>
        ) : (
          <p>Testing API connection...</p>
        )}
      </div> */}

      {/* Categories Test */}
      {/* <div className="bg-purple-500 text-white p-4 m-4" style={{backgroundColor: 'purple', color: 'white', padding: '16px', margin: '16px'}}>
        <h3>📂 Categories from Database:</h3>
        {categories.length > 0 ? (
          <ul>
            {categories.map(category => (
              <li key={category.id}>
                {category.name} - {category.description}
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading categories...</p>
        )}
      </div> */}

      {/* Search Results */}
      {/* {searchResults && (
        <div className="bg-yellow-500 text-black p-4 m-4" style={{backgroundColor: 'yellow', color: 'black', padding: '16px', margin: '16px'}}>
          <h3>🔍 Search Results:</h3>
          {searchResults.error ? (
            <p className="text-red-600">{searchResults.error}</p>
          ) : (
            <div>
              <p><strong>Found:</strong> {searchResults.pagination?.total || 0} vehicles</p>
              {searchResults.data && searchResults.data.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.data.map(vehicle => (
                    <div key={vehicle.id} className="bg-white p-4 rounded-lg shadow">
                      <h4 className="font-bold text-lg">{vehicle.title}</h4>
                      <p className="text-green-600 font-semibold">Rs {vehicle.price?.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{vehicle.year} • {vehicle.city}</p>
                      <p className="text-sm">{vehicle.make?.name} {vehicle.model?.name}</p>
                      <p className="text-xs text-gray-500 mt-2">{vehicle.description?.substring(0, 100)}...</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No vehicles found matching your search criteria.</p>
              )}
              {searchResults.filters_applied && (
                <div className="mt-2 text-sm">
                  <strong>Filters applied:</strong> {JSON.stringify(searchResults.filters_applied)}
                </div>
              )}
            </div>
          )}
        </div>
      )} */}

      {/* Tailwind Test */}
      {/* <div className="bg-red-500 text-white p-4 m-4" style={{backgroundColor: 'red', color: 'white', padding: '16px', margin: '16px'}}>
        <p>🧪 Tailwind Test: If you see red background, Tailwind is working!</p>
      </div> */}
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Vehicle
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Pakistan's most trusted vehicle marketplace
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by make, model, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-3 text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="cars">Cars</option>
                    <option value="bikes">Bikes</option>
                    <option value="trucks">Trucks</option>
                  </select>
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Search className="h-5 w-5" />
                    <span>{isSearching ? 'Searching...' : 'Search'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Vehicles</h2>
            <Link
              to="/vehicles?featured=true"
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              View All Featured
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
              ))}
            </div>
          ) : featuredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((vehicle) => (
                <FeaturedVehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Featured Vehicles</h3>
              <p className="text-gray-600">Check back later for featured listings</p>
            </div>
          )}
        </div>
      </section>

      {/* Google Ads Section 1 - Leaderboard */}
      <section className="py-8 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Advertisement</span>
          </div>

          {/* Google AdSense Leaderboard */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="max-w-6xl mx-auto">
              {/* Replace this div with actual Google AdSense code */}
              <GoogleAdPlaceholder
                size="728x90"
                type="Leaderboard"
                description="Perfect for header/footer placement"
              />

              {/*
              Example Google AdSense code to replace the placeholder:

              <ins className="adsbygoogle"
                   style={{display: 'block'}}
                   data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                   data-ad-slot="XXXXXXXXXX"
                   data-ad-format="auto"
                   data-full-width-responsive="true"></ins>
              */}
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.slug}
                  to={`/vehicles?type=${category.slug}`}
                  className="group"
                >
                  <div className={`${category.bgColor} ${category.hoverColor} rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300`}>
                    <IconComponent className={`h-16 w-16 ${category.color} mx-auto mb-4 group-hover:scale-110 transition-transform`} />
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{category.name}</h3>
                    <p className="text-gray-600 mb-3">{category.description}</p>

                    {/* Vehicle Count */}
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      {countsLoading ? (
                        <span className="text-sm text-gray-500">Loading...</span>
                      ) : categoryCounts && categoryCounts[category.slug] !== undefined ? (
                        <>
                          <span className="text-sm font-medium text-gray-700">
                            {categoryCounts[category.slug].toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500">vehicles available</span>
                        </>
                      ) : null}
                    </div>

                    {/* Browse Button */}
                    <div className="mt-4">
                      <span className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${category.color} bg-white border border-current group-hover:bg-gray-50 transition-colors`}>
                        Browse {category.name}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Google Ads Section 2 - Large Rectangle */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Advertisement</span>
          </div>

          <div className="flex justify-center">
            <div className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
              {/* Google AdSense Large Rectangle */}
              <GoogleAdPlaceholder
                size="336x280"
                type="Large Rectangle"
                description="High-performing ad format"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Cars Empire?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Trusted Community</h3>
              <p className="text-gray-600">Join thousands of verified buyers and sellers</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Transactions</h3>
              <p className="text-gray-600">Safe and secure payment processing</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quality Listings</h3>
              <p className="text-gray-600">Verified and detailed vehicle information</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Sell Your Vehicle?</h2>
          <p className="text-xl mb-8 text-blue-100">
            List your vehicle for free and reach thousands of potential buyers
          </p>
          <Link 
            to="/dashboard/create-listing" 
            className="bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Start Selling Now
          </Link>
        </div>
      </section>
    </div>
  );
};

// Featured Vehicle Card Component
const FeaturedVehicleCard = ({ vehicle }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price).replace('PKR', 'Rs');
  };

  return (
    <Link to={`/vehicles/${vehicle.id}`} className="group">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
        {/* Featured Badge */}
        <div className="relative">
          <img
            src={
              vehicle.primary_image?.path
                ? `http://127.0.0.1:8000/storage/${vehicle.primary_image.path}`
                : 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=No+Image'
            }
            alt={vehicle.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=No+Image';
            }}
          />
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </span>
          </div>
          {vehicle.video_path && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Play className="h-3 w-3 mr-1" />
                Video
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {vehicle.title}
          </h3>

          <p className="text-2xl font-bold text-green-600 mb-3">
            {formatPrice(vehicle.price)}
            {vehicle.is_negotiable && (
              <span className="text-sm font-normal text-gray-500 ml-2">Negotiable</span>
            )}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{vehicle.year}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{vehicle.city}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {vehicle.views_count || 0}
              </span>
              <span className="flex items-center">
                <Heart className="h-3 w-3 mr-1" />
                {vehicle.favorites_count || 0}
              </span>
            </div>
            <span>{vehicle.created_at_human}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Google Ad Placeholder Component
const GoogleAdPlaceholder = ({ size, type, description }) => {
  const [width, height] = size.split('x').map(Number);

  return (
    <div
      className="bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-300"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div className="text-center p-4">
        <div className="text-gray-400 mb-2">
          <div className="w-8 h-8 bg-gray-300 rounded mx-auto mb-2 flex items-center justify-center">
            <span className="text-sm">📢</span>
          </div>
        </div>
        <div className="text-xs text-gray-600 font-medium">{type}</div>
        <div className="text-xs text-gray-500">{size}</div>
        <div className="text-xs text-gray-400 mt-1">{description}</div>
        <div className="text-xs text-gray-400 mt-2 border-t pt-2">
          Replace with Google AdSense
        </div>
      </div>
    </div>
  );
};

export default HomePage;
