import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Car, Truck, Bike, Star, Users, Shield, Clock } from 'lucide-react';
import api from '../lib/api';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [apiTest, setApiTest] = useState(null);

  useEffect(() => {
    // Test API connection
    const testAPI = async () => {
      try {
        const response = await api.get('/test');
        setApiTest(response.data);
      } catch (error) {
        setApiTest({ error: 'API connection failed' });
      }
    };

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    testAPI();
    fetchCategories();
  }, []);
  return (
    <div>
      {/* API Test Results */}
      <div className="bg-green-500 text-white p-4 m-4" style={{backgroundColor: 'green', color: 'white', padding: '16px', margin: '16px'}}>
        <h3>🔌 API Connection Test:</h3>
        {apiTest ? (
          <pre>{JSON.stringify(apiTest, null, 2)}</pre>
        ) : (
          <p>Testing API connection...</p>
        )}
      </div>

      {/* Categories Test */}
      <div className="bg-purple-500 text-white p-4 m-4" style={{backgroundColor: 'purple', color: 'white', padding: '16px', margin: '16px'}}>
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
      </div>

      {/* Tailwind Test */}
      <div className="bg-red-500 text-white p-4 m-4" style={{backgroundColor: 'red', color: 'white', padding: '16px', margin: '16px'}}>
        <p>🧪 Tailwind Test: If you see red background, Tailwind is working!</p>
      </div>
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
            <div className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by make, model, or keyword..."
                    className="w-full px-4 py-3 text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <select className="px-4 py-3 text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Types</option>
                    <option value="car">Cars</option>
                    <option value="bike">Bikes</option>
                    <option value="truck">Trucks</option>
                  </select>
                  <button className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <Search className="h-5 w-5" />
                    <span>Search</span>
                  </button>
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
            <Link to="/vehicles?type=car" className="group">
              <div className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow">
                <Car className="h-16 w-16 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2">Cars</h3>
                <p className="text-gray-600">Find your dream car from thousands of listings</p>
              </div>
            </Link>
            
            <Link to="/vehicles?type=bike" className="group">
              <div className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow">
                <Bike className="h-16 w-16 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2">Bikes</h3>
                <p className="text-gray-600">Explore motorcycles and scooters</p>
              </div>
            </Link>
            
            <Link to="/vehicles?type=truck" className="group">
              <div className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow">
                <Truck className="h-16 w-16 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2">Commercial</h3>
                <p className="text-gray-600">Trucks, vans, and commercial vehicles</p>
              </div>
            </Link>
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

export default HomePage;
