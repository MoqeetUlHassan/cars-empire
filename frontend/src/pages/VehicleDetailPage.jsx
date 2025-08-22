import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Heart,
  Share2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Settings,
  Fuel,
  Gauge,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MessageCircle,
  Play,
  Eye,
  Car
} from 'lucide-react';
import api from '../lib/api';

const VehicleDetailPage = () => {
  const { id } = useParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  // Fetch vehicle details
  const { data: vehicleData, isLoading, error } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const response = await api.get(`/vehicles/${id}`);
      return response.data;
    },
  });

  const vehicle = vehicleData?.data;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price).replace('PKR', 'Rs');
  };

  const getSocialMediaIcon = (platform) => {
    switch (platform) {
      case 'facebook': return <Facebook className="h-5 w-5" />;
      case 'instagram': return <Instagram className="h-5 w-5" />;
      case 'twitter': return <Twitter className="h-5 w-5" />;
      case 'youtube': return <Youtube className="h-5 w-5" />;
      case 'whatsapp': return <MessageCircle className="h-5 w-5" />;
      default: return null;
    }
  };

  const getSocialMediaColor = (platform) => {
    switch (platform) {
      case 'facebook': return 'text-blue-600 hover:text-blue-700';
      case 'instagram': return 'text-pink-600 hover:text-pink-700';
      case 'twitter': return 'text-blue-400 hover:text-blue-500';
      case 'youtube': return 'text-red-600 hover:text-red-700';
      case 'whatsapp': return 'text-green-600 hover:text-green-700';
      default: return 'text-gray-600 hover:text-gray-700';
    }
  };

  const getSocialMediaUrl = (platform, value) => {
    if (platform === 'whatsapp') {
      return `https://wa.me/${value.replace(/[^\d]/g, '')}`;
    }
    return value;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-4">The vehicle you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/vehicles"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Browse Vehicles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/vehicles"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Vehicles
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Video */}
          <div className="lg:col-span-2">
            {/* Main Image/Video Display */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
              {showVideo && vehicle.video_path ? (
                <div className="relative">
                  <video
                    src={`http://127.0.0.1:8000/storage/${vehicle.video_path}`}
                    controls
                    className="w-full h-96 object-cover"
                    autoPlay
                  />
                  <button
                    onClick={() => setShowVideo(false)}
                    className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md text-sm hover:bg-opacity-70"
                  >
                    Show Images
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={
                      vehicle.images?.[selectedImageIndex]?.path
                        ? `http://127.0.0.1:8000/storage/${vehicle.images[selectedImageIndex].path}`
                        : 'https://via.placeholder.com/800x600/e5e7eb/6b7280?text=No+Image'
                    }
                    alt={vehicle.title}
                    className="w-full h-96 object-cover"
                  />
                  {vehicle.video_path && (
                    <button
                      onClick={() => setShowVideo(true)}
                      className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 flex items-center space-x-1"
                    >
                      <Play className="h-4 w-4" />
                      <span>Play Video</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {vehicle.images && vehicle.images.length > 0 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {vehicle.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setShowVideo(false);
                    }}
                    className={`relative rounded-lg overflow-hidden ${
                      selectedImageIndex === index && !showVideo
                        ? 'ring-2 ring-blue-500'
                        : ''
                    }`}
                  >
                    <img
                      src={`http://127.0.0.1:8000/storage/${image.path}`}
                      alt={`${vehicle.title} ${index + 1}`}
                      className="w-full h-16 object-cover"
                    />
                  </button>
                ))}
                {vehicle.video_path && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className={`relative rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center ${
                      showVideo ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <Play className="h-6 w-6 text-white" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Vehicle Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{vehicle.title}</h1>
              <p className="text-3xl font-bold text-green-600 mb-4">
                {formatPrice(vehicle.price)}
                {vehicle.is_negotiable && (
                  <span className="text-sm font-normal text-gray-500 ml-2">Negotiable</span>
                )}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{vehicle.year}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{vehicle.city}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Settings className="h-4 w-4 mr-2" />
                  <span>{vehicle.transmission}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Fuel className="h-4 w-4 mr-2" />
                  <span>{vehicle.fuel_type}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Gauge className="h-4 w-4 mr-2" />
                  <span>{vehicle.mileage?.toLocaleString()} km</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Eye className="h-4 w-4 mr-2" />
                  <span>{vehicle.views_count || 0} views</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Seller</h3>

              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-medium text-gray-700">{vehicle.contact_name}</span>
                </div>

                {vehicle.show_phone && vehicle.contact_phone && (
                  <a
                    href={`tel:${vehicle.contact_phone}`}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{vehicle.contact_phone}</span>
                  </a>
                )}

                {vehicle.show_email && vehicle.contact_email && (
                  <a
                    href={`mailto:${vehicle.contact_email}`}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{vehicle.contact_email}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Social Media Links */}
            {vehicle.social_media_links && Object.values(vehicle.social_media_links).some(link => link) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Connect with Seller</h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(vehicle.social_media_links).map(([platform, value]) => {
                    if (!value) return null;

                    return (
                      <a
                        key={platform}
                        href={getSocialMediaUrl(platform, value)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md border ${getSocialMediaColor(platform)} hover:bg-gray-50 transition-colors`}
                      >
                        {getSocialMediaIcon(platform)}
                        <span className="capitalize text-sm">{platform}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </button>
                <button className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{vehicle.description}</p>
        </div>

        {/* Vehicle Specifications */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <span className="font-medium text-gray-700">Make:</span>
              <span className="ml-2 text-gray-600">{vehicle.make?.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Model:</span>
              <span className="ml-2 text-gray-600">{vehicle.model?.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Year:</span>
              <span className="ml-2 text-gray-600">{vehicle.year}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Color:</span>
              <span className="ml-2 text-gray-600">{vehicle.color}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Condition:</span>
              <span className="ml-2 text-gray-600 capitalize">{vehicle.condition?.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Engine:</span>
              <span className="ml-2 text-gray-600">{vehicle.engine_capacity}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailPage;
