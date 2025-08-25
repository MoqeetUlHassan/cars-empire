import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Car, 
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  Shield,
  Edit,
  Trash2,
  Plus,
  Wrench,
  MapPin,
  Phone,
  Mail,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Play
} from 'lucide-react';
import api, { getStorageUrl, getPlaceholderImage } from '../../lib/api';

const ViewGarageVehiclePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch vehicle data
  const { data: vehicleData, isLoading } = useQuery({
    queryKey: ['garage-vehicle', id],
    queryFn: async () => {
      const response = await api.get(`/garage/${id}`);
      return response.data.data;
    },
  });

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

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
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

  if (!vehicleData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Vehicle not found</h3>
          <p className="text-gray-600 mb-6">The vehicle you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/dashboard/garage"
            className="bg-teal-600 text-white px-6 py-3 rounded-md hover:bg-teal-700 transition-colors"
          >
            Back to Garage
          </Link>
        </div>
      </div>
    );
  }

  const images = vehicleData.images || [];
  const hasImages = images.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard/garage')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{vehicleData.name}</h1>
            <p className="text-gray-600 mt-1">{vehicleData.full_name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicleData.status)}`}>
            {getStatusIcon(vehicleData.status)}
            <span className="ml-1 capitalize">{vehicleData.status.replace('_', ' ')}</span>
          </span>
          
          <Link
            to={`/dashboard/garage/${id}/edit`}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images and Video Section */}
        <div className="space-y-6">
          {/* Main Image/Video Display */}
          <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
            {hasImages ? (
              <img
                src={getStorageUrl(images[selectedImageIndex])}
                alt={vehicleData.name}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No images available</p>
                </div>
              </div>
            )}
          </div>

          {/* Video Section */}
          {vehicleData.video && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Play className="h-5 w-5 mr-2" />
                Vehicle Video
              </h3>
              <video
                src={getStorageUrl(vehicleData.video)}
                controls
                className="w-full h-64 object-cover rounded-md"
              />
            </div>
          )}

          {/* Image Thumbnails */}
          {hasImages && images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-w-1 aspect-h-1 rounded-md overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index ? 'border-teal-600' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={getStorageUrl(image)}
                    alt={`${vehicleData.name} ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vehicle Information */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Car className="h-5 w-5 mr-2" />
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="font-medium text-gray-900 ml-2">{vehicleData.category?.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Make:</span>
                <span className="font-medium text-gray-900 ml-2">{vehicleData.make?.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Model:</span>
                <span className="font-medium text-gray-900 ml-2">{vehicleData.model?.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Year:</span>
                <span className="font-medium text-gray-900 ml-2">{vehicleData.year}</span>
              </div>
              <div>
                <span className="text-gray-600">Color:</span>
                <span className="font-medium text-gray-900 ml-2">{vehicleData.color}</span>
              </div>
              <div>
                <span className="text-gray-600">Condition:</span>
                <span className={`font-medium ml-2 capitalize ${getConditionColor(vehicleData.condition)}`}>
                  {vehicleData.condition}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Mileage:</span>
                <span className="font-medium text-gray-900 ml-2">{vehicleData.current_mileage?.toLocaleString()} km</span>
              </div>
              {vehicleData.license_plate && (
                <div>
                  <span className="text-gray-600">License Plate:</span>
                  <span className="font-medium text-gray-900 ml-2">{vehicleData.license_plate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Specifications
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Transmission:</span>
                <span className="font-medium text-gray-900 ml-2 capitalize">{vehicleData.transmission?.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-gray-600">Fuel Type:</span>
                <span className="font-medium text-gray-900 ml-2 capitalize">{vehicleData.fuel_type}</span>
              </div>
              {vehicleData.engine_capacity && (
                <div>
                  <span className="text-gray-600">Engine:</span>
                  <span className="font-medium text-gray-900 ml-2">{vehicleData.engine_capacity}</span>
                </div>
              )}
              {vehicleData.engine_power && (
                <div>
                  <span className="text-gray-600">Power:</span>
                  <span className="font-medium text-gray-900 ml-2">{vehicleData.engine_power} HP</span>
                </div>
              )}
              {vehicleData.vin && (
                <div className="col-span-2">
                  <span className="text-gray-600">VIN:</span>
                  <span className="font-medium text-gray-900 ml-2 font-mono">{vehicleData.vin}</span>
                </div>
              )}
            </div>
          </div>

          {/* Purchase Information */}
          {(vehicleData.purchase_price || vehicleData.purchase_date) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Purchase Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {vehicleData.purchase_price && (
                  <div>
                    <span className="text-gray-600">Purchase Price:</span>
                    <span className="font-medium text-gray-900 ml-2">Rs {vehicleData.purchase_price?.toLocaleString()}</span>
                  </div>
                )}
                {vehicleData.purchase_date && (
                  <div>
                    <span className="text-gray-600">Purchase Date:</span>
                    <span className="font-medium text-gray-900 ml-2">{new Date(vehicleData.purchase_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Insurance & Registration */}
          {(vehicleData.insurance_company || vehicleData.registration_expiry) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Insurance & Registration
              </h3>
              <div className="space-y-3 text-sm">
                {vehicleData.insurance_company && (
                  <div>
                    <span className="text-gray-600">Insurance Company:</span>
                    <span className="font-medium text-gray-900 ml-2">{vehicleData.insurance_company}</span>
                  </div>
                )}
                {vehicleData.insurance_policy_number && (
                  <div>
                    <span className="text-gray-600">Policy Number:</span>
                    <span className="font-medium text-gray-900 ml-2">{vehicleData.insurance_policy_number}</span>
                  </div>
                )}
                {vehicleData.insurance_expiry && (
                  <div className="flex items-center">
                    <span className="text-gray-600">Insurance Expiry:</span>
                    <span className="font-medium text-gray-900 ml-2">{new Date(vehicleData.insurance_expiry).toLocaleDateString()}</span>
                    {vehicleData.insurance_expiring_soon && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500 ml-2" title="Expiring soon" />
                    )}
                  </div>
                )}
                {vehicleData.registration_expiry && (
                  <div className="flex items-center">
                    <span className="text-gray-600">Registration Expiry:</span>
                    <span className="font-medium text-gray-900 ml-2">{new Date(vehicleData.registration_expiry).toLocaleDateString()}</span>
                    {vehicleData.registration_expiring_soon && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500 ml-2" title="Expiring soon" />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Features */}
          {vehicleData.features && vehicleData.features.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
              <div className="flex flex-wrap gap-2">
                {vehicleData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {vehicleData.notes && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Notes
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">{vehicleData.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Maintenance Section */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Wrench className="h-5 w-5 mr-2" />
              Maintenance History
            </h3>
            <Link
              to={`/dashboard/garage/${id}/maintenance/add`}
              className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Maintenance</span>
            </Link>
          </div>

          {vehicleData.maintenance_logs && vehicleData.maintenance_logs.length > 0 ? (
            <div className="space-y-4">
              {vehicleData.maintenance_logs.slice(0, 3).map((log) => (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{log.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(log.service_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {log.mileage_at_service?.toLocaleString()} km
                        </span>
                        {log.cost && (
                          <span className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Rs {log.cost?.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      log.maintenance_type === 'routine' ? 'bg-blue-100 text-blue-800' :
                      log.maintenance_type === 'repair' ? 'bg-red-100 text-red-800' :
                      log.maintenance_type === 'upgrade' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.maintenance_type}
                    </span>
                  </div>
                </div>
              ))}
              
              {vehicleData.maintenance_logs.length > 3 && (
                <div className="text-center">
                  <Link
                    to={`/dashboard/garage/${id}/maintenance`}
                    className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                  >
                    View all {vehicleData.maintenance_logs.length} maintenance records
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No maintenance records</h4>
              <p className="text-gray-600 mb-4">Start tracking your vehicle's maintenance history.</p>
              <Link
                to={`/dashboard/garage/${id}/maintenance/add`}
                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add First Maintenance Record</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewGarageVehiclePage;
