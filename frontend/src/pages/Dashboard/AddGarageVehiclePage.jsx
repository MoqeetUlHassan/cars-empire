import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  Upload, 
  X, 
  Save, 
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  Shield,
  Image as ImageIcon
} from 'lucide-react';
import api, { getStorageUrl } from '../../lib/api';

const AddGarageVehiclePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    category_id: '',
    make_id: '',
    model_id: '',
    name: '',
    license_plate: '',
    year: new Date().getFullYear(),
    color: '',
    vin: '',
    purchase_price: '',
    purchase_date: '',
    current_mileage: '',
    condition: 'good',
    transmission: 'manual',
    fuel_type: 'petrol',
    engine_capacity: '',
    engine_power: '',
    insurance_company: '',
    insurance_policy_number: '',
    insurance_expiry: '',
    registration_expiry: '',
    notes: '',
    features: [],
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  // Fetch vehicle data for dropdowns
  const { data: categoriesData } = useQuery({
    queryKey: ['vehicle-categories'],
    queryFn: async () => {
      const response = await api.get('/vehicle-data/categories');
      return response.data.data;
    },
  });

  const { data: makesData } = useQuery({
    queryKey: ['vehicle-makes'],
    queryFn: async () => {
      const response = await api.get('/vehicle-data/makes');
      return response.data.data;
    },
  });

  const { data: modelsData } = useQuery({
    queryKey: ['vehicle-models', formData.make_id],
    queryFn: async () => {
      if (!formData.make_id) return [];
      const response = await api.get(`/vehicle-data/models?make_id=${formData.make_id}`);
      return response.data.data;
    },
    enabled: !!formData.make_id,
  });

  // Create vehicle mutation
  const createVehicleMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      
      // Append form fields
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          if (key === 'features') {
            data[key].forEach((feature, index) => {
              formDataToSend.append(`features[${index}]`, feature);
            });
          } else {
            formDataToSend.append(key, data[key]);
          }
        }
      });

      // Append images
      images.forEach((image, index) => {
        formDataToSend.append(`images[${index}]`, image);
      });

      const response = await api.post('/garage', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['garage']);
      navigate('/dashboard/garage');
    },
    onError: (error) => {
      setErrors(error.response?.data?.errors || {});
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

    // Reset model when make changes
    if (field === 'make_id') {
      setFormData(prev => ({
        ...prev,
        model_id: ''
      }));
    }
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    setImages(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createVehicleMutation.mutate(formData);
  };

  const steps = [
    { id: 1, title: 'Basic Information', icon: Car },
    { id: 2, title: 'Specifications', icon: Settings },
    { id: 3, title: 'Documentation', icon: FileText },
    { id: 4, title: 'Images & Features', icon: ImageIcon },
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <h1 className="text-3xl font-bold text-gray-900">Add Vehicle to Garage</h1>
            <p className="text-gray-600 mt-1">Add your personal vehicle to track maintenance and history</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActive 
                    ? 'border-teal-600 bg-teal-600 text-white' 
                    : isCompleted 
                      ? 'border-teal-600 bg-teal-600 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-teal-600' : isCompleted ? 'text-teal-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    isCompleted ? 'bg-teal-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., My Honda Civic"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
              </div>

              {/* License Plate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Plate
                </label>
                <input
                  type="text"
                  value={formData.license_plate}
                  onChange={(e) => handleInputChange('license_plate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., ABC-123"
                />
                {errors.license_plate && <p className="text-red-500 text-sm mt-1">{errors.license_plate[0]}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select Category</option>
                  {categoriesData?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id[0]}</p>}
              </div>

              {/* Make */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Make *
                </label>
                <select
                  value={formData.make_id}
                  onChange={(e) => handleInputChange('make_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select Make</option>
                  {makesData?.map((make) => (
                    <option key={make.id} value={make.id}>
                      {make.name}
                    </option>
                  ))}
                </select>
                {errors.make_id && <p className="text-red-500 text-sm mt-1">{errors.make_id[0]}</p>}
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model *
                </label>
                <select
                  value={formData.model_id}
                  onChange={(e) => handleInputChange('model_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={!formData.make_id}
                >
                  <option value="">Select Model</option>
                  {modelsData?.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
                {errors.model_id && <p className="text-red-500 text-sm mt-1">{errors.model_id[0]}</p>}
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year[0]}</p>}
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color *
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., White, Black, Silver"
                />
                {errors.color && <p className="text-red-500 text-sm mt-1">{errors.color[0]}</p>}
              </div>

              {/* Current Mileage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Mileage (km) *
                </label>
                <input
                  type="number"
                  value={formData.current_mileage}
                  onChange={(e) => handleInputChange('current_mileage', parseInt(e.target.value))}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 50000"
                />
                {errors.current_mileage && <p className="text-red-500 text-sm mt-1">{errors.current_mileage[0]}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Specifications */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Vehicle Specifications</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition *
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
                {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition[0]}</p>}
              </div>

              {/* Transmission */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transmission *
                </label>
                <select
                  value={formData.transmission}
                  onChange={(e) => handleInputChange('transmission', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                  <option value="cvt">CVT</option>
                  <option value="semi_automatic">Semi Automatic</option>
                </select>
                {errors.transmission && <p className="text-red-500 text-sm mt-1">{errors.transmission[0]}</p>}
              </div>

              {/* Fuel Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuel Type *
                </label>
                <select
                  value={formData.fuel_type}
                  onChange={(e) => handleInputChange('fuel_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                  <option value="cng">CNG</option>
                  <option value="lpg">LPG</option>
                </select>
                {errors.fuel_type && <p className="text-red-500 text-sm mt-1">{errors.fuel_type[0]}</p>}
              </div>

              {/* Engine Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engine Capacity
                </label>
                <input
                  type="text"
                  value={formData.engine_capacity}
                  onChange={(e) => handleInputChange('engine_capacity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 1500cc"
                />
                {errors.engine_capacity && <p className="text-red-500 text-sm mt-1">{errors.engine_capacity[0]}</p>}
              </div>

              {/* Engine Power */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engine Power (HP)
                </label>
                <input
                  type="number"
                  value={formData.engine_power}
                  onChange={(e) => handleInputChange('engine_power', parseInt(e.target.value))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 150"
                />
                {errors.engine_power && <p className="text-red-500 text-sm mt-1">{errors.engine_power[0]}</p>}
              </div>

              {/* VIN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VIN (Vehicle Identification Number)
                </label>
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) => handleInputChange('vin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="17-character VIN"
                  maxLength="17"
                />
                {errors.vin && <p className="text-red-500 text-sm mt-1">{errors.vin[0]}</p>}
              </div>
            </div>

            {/* Purchase Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Purchase Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Purchase Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Price (Rs)
                  </label>
                  <input
                    type="number"
                    value={formData.purchase_price}
                    onChange={(e) => handleInputChange('purchase_price', parseFloat(e.target.value))}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., 1500000"
                  />
                  {errors.purchase_price && <p className="text-red-500 text-sm mt-1">{errors.purchase_price[0]}</p>}
                </div>

                {/* Purchase Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {errors.purchase_date && <p className="text-red-500 text-sm mt-1">{errors.purchase_date[0]}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Documentation */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Documentation & Insurance</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Insurance Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Company
                </label>
                <input
                  type="text"
                  value={formData.insurance_company}
                  onChange={(e) => handleInputChange('insurance_company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., State Life Insurance"
                />
                {errors.insurance_company && <p className="text-red-500 text-sm mt-1">{errors.insurance_company[0]}</p>}
              </div>

              {/* Insurance Policy Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Policy Number
                </label>
                <input
                  type="text"
                  value={formData.insurance_policy_number}
                  onChange={(e) => handleInputChange('insurance_policy_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Policy number"
                />
                {errors.insurance_policy_number && <p className="text-red-500 text-sm mt-1">{errors.insurance_policy_number[0]}</p>}
              </div>

              {/* Insurance Expiry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.insurance_expiry}
                  onChange={(e) => handleInputChange('insurance_expiry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {errors.insurance_expiry && <p className="text-red-500 text-sm mt-1">{errors.insurance_expiry[0]}</p>}
              </div>

              {/* Registration Expiry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.registration_expiry}
                  onChange={(e) => handleInputChange('registration_expiry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {errors.registration_expiry && <p className="text-red-500 text-sm mt-1">{errors.registration_expiry[0]}</p>}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Any additional notes about your vehicle..."
              />
              {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes[0]}</p>}
            </div>
          </div>
        )}

        {/* Step 4: Images & Features */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Images & Features</h2>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Images (Max 10)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-sm text-gray-600 mb-4">
                  <label className="cursor-pointer text-teal-600 hover:text-teal-700">
                    Click to upload images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <span> or drag and drop</span>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Features
              </label>
              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., Air Conditioning, Power Steering"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                >
                  + Add Feature
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
              className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors"
              style={{backgroundColor: '#008080'}}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#006666'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#008080'}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={createVehicleMutation.isLoading}
              className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              style={{backgroundColor: '#008080'}}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#006666'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#008080'}
            >
              <Save className="h-4 w-4" />
              <span>{createVehicleMutation.isLoading ? 'Adding...' : 'Add Vehicle'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddGarageVehiclePage;
