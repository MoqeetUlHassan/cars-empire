import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Car, Truck, Bike, Star, Users, Shield, Clock, ArrowRight, Calendar, MapPin, Eye, Heart, Play } from 'lucide-react';
import api, { getStorageUrl, getPlaceholderImage } from '../lib/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');

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
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      hoverColor: 'group-hover:bg-teal-100',
      customColor: '#008080',
      customBg: '#f0fdfa',
      customHover: '#ccfbf1',
    },
    {
      name: 'Bikes',
      slug: 'bikes',
      icon: Bike,
      description: 'Motorcycles, Scooters & Two-wheelers',
      color: 'text-teal-700',
      bgColor: 'bg-teal-100',
      hoverColor: 'group-hover:bg-teal-200',
      customColor: '#0f766e',
      customBg: '#ccfbf1',
      customHover: '#99f6e4',
    },
    {
      name: 'Trucks',
      slug: 'trucks',
      icon: Truck,
      description: 'Commercial Vehicles & Heavy Duty',
      color: 'text-teal-800',
      bgColor: 'bg-teal-200',
      hoverColor: 'group-hover:bg-teal-300',
      customColor: '#115e59',
      customBg: '#99f6e4',
      customHover: '#5eead4',
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Build search parameters
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.append('query', searchQuery.trim());
    }
    if (selectedType) {
      params.append('type', selectedType);
    }
    
    // Navigate to vehicles page with search parameters
    navigate(`/vehicles?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-20" style={{background: 'linear-gradient(to right, #008080, #006666)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Vehicle
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-teal-100">
              Pakistan's most trusted vehicle marketplace
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by make, model, or keyword... (e.g., Toyota, Corolla, Honda)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-3 text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">All Types</option>
                    <option value="cars">Cars</option>
                    <option value="bikes">Bikes</option>
                    <option value="trucks">Trucks</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-teal-600 text-white px-8 py-3 rounded-md hover:bg-teal-700 transition-colors flex items-center space-x-2"
                    style={{backgroundColor: '#008080'}}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#006666'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#008080'}
                  >
                    <Search className="h-5 w-5" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Popular Searches */}
            <div className="max-w-4xl mx-auto mt-6">
              <p className="text-teal-100 text-sm mb-3">Popular searches:</p>
              <div className="flex flex-wrap gap-2">
                {['Toyota Corolla', 'Honda Civic', 'Suzuki Alto', 'Honda CD 70', 'Yamaha YBR', 'Hilux', 'Land Cruiser'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      const params = new URLSearchParams();
                      params.append('query', term);
                      navigate(`/vehicles?${params.toString()}`);
                    }}
                    className="px-3 py-1 bg-teal-500 bg-opacity-20 text-teal-100 rounded-full text-sm hover:bg-opacity-30 transition-colors"
                    style={{backgroundColor: 'rgba(0, 128, 128, 0.2)'}}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 128, 128, 0.3)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0, 128, 128, 0.2)'}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
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
              className="text-teal-600 hover:text-teal-800 font-medium flex items-center"
              style={{color: '#008080'}}
              onMouseEnter={(e) => e.target.style.color = '#006666'}
              onMouseLeave={(e) => e.target.style.color = '#008080'}
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

      {/* Google Ads Section */}
      <section className="py-8 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Advertisement</span>
          </div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="max-w-6xl mx-auto">
              <div 
                className="bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-300"
                style={{ width: '728px', height: '90px', margin: '0 auto' }}
              >
                <div className="text-center p-4">
                  <div className="text-xs text-gray-600 font-medium">Google AdSense</div>
                  <div className="text-xs text-gray-500">728x90 Leaderboard</div>
                  <div className="text-xs text-gray-400 mt-1">Replace with actual ad code</div>
                </div>
              </div>
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
                  <div
                    className={`${category.bgColor} ${category.hoverColor} rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300`}
                    style={{backgroundColor: category.customBg}}
                    onMouseEnter={(e) => e.target.style.backgroundColor = category.customHover}
                    onMouseLeave={(e) => e.target.style.backgroundColor = category.customBg}
                  >
                    <IconComponent
                      className={`h-16 w-16 ${category.color} mx-auto mb-4 group-hover:scale-110 transition-transform`}
                      style={{color: category.customColor}}
                    />
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
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${category.color} bg-white border border-current group-hover:bg-gray-50 transition-colors`}
                        style={{color: category.customColor, borderColor: category.customColor}}
                      >
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

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Cars Empire?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-teal-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: '#ccfbf1'}}>
                <Users className="h-8 w-8 text-teal-600" style={{color: '#008080'}} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Trusted Community</h3>
              <p className="text-gray-600">Join thousands of verified buyers and sellers</p>
            </div>

            <div className="text-center">
              <div className="bg-teal-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: '#ccfbf1'}}>
                <Shield className="h-8 w-8 text-teal-600" style={{color: '#008080'}} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Transactions</h3>
              <p className="text-gray-600">Safe and secure payment processing</p>
            </div>

            <div className="text-center">
              <div className="bg-teal-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: '#ccfbf1'}}>
                <Star className="h-8 w-8 text-teal-600" style={{color: '#008080'}} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quality Listings</h3>
              <p className="text-gray-600">Verified and detailed vehicle information</p>
            </div>

            <div className="text-center">
              <div className="bg-teal-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: '#ccfbf1'}}>
                <Clock className="h-8 w-8 text-teal-600" style={{color: '#008080'}} />
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-teal-600 text-white py-16" style={{backgroundColor: '#008080'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Sell Your Vehicle?</h2>
          <p className="text-xl mb-8 text-teal-100">
            List your vehicle for free and reach thousands of potential buyers
          </p>
          <Link
            to="/dashboard/create-listing"
            className="bg-white text-teal-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors inline-block"
            style={{color: '#008080'}}
          >
            Start Selling Now
          </Link>
        </div>
      </section>
    </div>
  );
};

// Featured Vehicle Card Component with Video Hover
const FeaturedVehicleCard = ({ vehicle }) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price).replace('PKR', 'Rs');
  };

  return (
    <Link to={`/vehicles/${vehicle.id}`} className="group">
      <div
        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Media Section with Video Hover */}
        <div className="relative">
          {isHovered && vehicle.video_path ? (
            <video
              src={getStorageUrl(vehicle.video_path)}
              autoPlay
              muted
              loop
              className="w-full h-48 object-cover"
            />
          ) : (
            <img
              src={
                vehicle.primary_image?.path
                  ? getStorageUrl(vehicle.primary_image.path)
                  : getPlaceholderImage(400, 300, 'No Image')
              }
              alt={vehicle.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                e.target.src = getPlaceholderImage(400, 300, 'No Image');
              }}
            />
          )}

          {/* Featured Badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </span>
          </div>

          {/* Video Indicator */}
          {vehicle.video_path && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800" style={{backgroundColor: '#ccfbf1', color: '#008080'}}>
                <Play className="h-3 w-3 mr-1" />
                Video
              </span>
            </div>
          )}

          {/* Hover Instruction */}
          {vehicle.video_path && !isHovered && (
            <div className="absolute bottom-3 right-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black bg-opacity-50 text-white">
                Hover to play
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors" style={{color: isHovered ? '#008080' : ''}}>
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

export default HomePage;
