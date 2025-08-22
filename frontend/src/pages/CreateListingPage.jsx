import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Car,
  Upload,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  Settings,
  Fuel,
  Palette,
  FileText,
  User,
  Save,
  Eye,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MessageCircle,
  Video,
  Play,
  X
} from 'lucide-react';
import api from '../lib/api';

const CreateListingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    description: '',
    category_id: '',
    make_id: '',
    model_id: '',
    
    // Price
    price: '',
    is_negotiable: true,
    
    // Vehicle Details
    year: '',
    color: '',
    condition: 'used',
    transmission: 'manual',
    fuel_type: 'petrol',
    engine_capacity: '',
    engine_power: '',
    mileage: '',
    
    // Location
    city: '',
    state: '',
    address: '',
    
    // Contact
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    show_phone: true,
    show_email: false,
    
    // Features
    features: [],
    safety_features: [],
    exterior_features: [],
    interior_features: [],
    
    // Images and Video
    images: [],
    video: null,

    // Social Media Links
    social_media_links: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      tiktok: '',
      whatsapp: '',
    },
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState([]);
  const [videoPreview, setVideoPreview] = useState(null);
  const [showCustomMakeForm, setShowCustomMakeForm] = useState(false);
  const [showCustomModelForm, setShowCustomModelForm] = useState(false);
  const [customMakeName, setCustomMakeName] = useState('');
  const [customModelName, setCustomModelName] = useState('');

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    },
  });

  // Fetch makes based on selected category (user's makes + global makes)
  const { data: makesData, refetch: refetchMakes } = useQuery({
    queryKey: ['user-makes', formData.category_id],
    queryFn: async () => {
      if (!formData.category_id) return { data: [] };
      const response = await api.get(`/user-makes?category_id=${formData.category_id}`);
      return response.data;
    },
    enabled: !!formData.category_id,
  });

  // Fetch models based on selected make (user's models + global models)
  const { data: modelsData, refetch: refetchModels } = useQuery({
    queryKey: ['user-models', formData.make_id],
    queryFn: async () => {
      if (!formData.make_id) return { data: [] };
      const response = await api.get(`/user-models?make_id=${formData.make_id}`);
      return response.data;
    },
    enabled: !!formData.make_id,
  });

  // Create custom make mutation
  const createMakeMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/custom-makes', data);
      return response.data;
    },
    onSuccess: (data) => {
      setFormData(prev => ({ ...prev, make_id: data.data.id }));
      refetchMakes();
    },
    onError: (error) => {
      if (error.response?.status === 409) {
        // Make already exists, find it and select it
        const existingMake = error.response.data.data;
        setFormData(prev => ({ ...prev, make_id: existingMake.id }));
      }
    },
  });

  // Create custom model mutation
  const createModelMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/custom-models', data);
      return response.data;
    },
    onSuccess: (data) => {
      setFormData(prev => ({ ...prev, model_id: data.data.id }));
      refetchModels();
    },
    onError: (error) => {
      if (error.response?.status === 409) {
        // Model already exists, find it and select it
        const existingModel = error.response.data.data;
        setFormData(prev => ({ ...prev, model_id: existingModel.id }));
      }
    },
  });

  // Create vehicle mutation
  const createVehicleMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(data).forEach(key => {
        if (key === 'images') {
          data.images.forEach((image, index) => {
            formDataToSend.append(`images[${index}]`, image);
          });
        } else if (Array.isArray(data[key])) {
          data[key].forEach((item, index) => {
            formDataToSend.append(`${key}[${index}]`, item);
          });
        } else {
          formDataToSend.append(key, data[key]);
        }
      });

      const response = await api.post('/vehicles', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      navigate(`/vehicles/${data.data.id}`, {
        state: { message: 'Vehicle listing created successfully!' }
      });
    },
    onError: (error) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
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
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 10) {
      alert('You can upload maximum 10 images');
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));

    URL.revokeObjectURL(imagePreview[index]);
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (100MB = 104857600 bytes)
    if (file.size > 104857600) {
      alert('Video file must be less than 100MB');
      return;
    }

    // Check duration (will be validated on backend)
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      if (video.duration > 10) {
        alert('Video duration must be 10 seconds or less');
        return;
      }

      setFormData(prev => ({ ...prev, video: file }));
      setVideoPreview(URL.createObjectURL(file));
    };
    video.src = URL.createObjectURL(file);
  };

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setFormData(prev => ({ ...prev, video: null }));
    setVideoPreview(null);
  };

  const handleSocialMediaChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      social_media_links: {
        ...prev.social_media_links,
        [platform]: value
      }
    }));
  };

  const handleFeatureAdd = (featureType, value) => {
    if (value.trim() && !formData[featureType].includes(value.trim())) {
      handleInputChange(featureType, [...formData[featureType], value.trim()]);
    }
  };

  const handleFeatureRemove = (featureType, index) => {
    handleInputChange(featureType, formData[featureType].filter((_, i) => i !== index));
  };

  const handleCreateCustomMake = () => {
    if (!customMakeName.trim() || !formData.category_id) return;

    createMakeMutation.mutate({
      category_id: formData.category_id,
      name: customMakeName.trim(),
    });

    setCustomMakeName('');
    setShowCustomMakeForm(false);
  };

  const handleCreateCustomModel = () => {
    if (!customModelName.trim() || !formData.make_id) return;

    createModelMutation.mutate({
      make_id: formData.make_id,
      name: customModelName.trim(),
    });

    setCustomModelName('');
    setShowCustomModelForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createVehicleMutation.mutate(formData);
  };

  const nextStep = () => {
    if (currentStep < 7) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: Car },
    { number: 2, title: 'Details', icon: Settings },
    { number: 3, title: 'Location', icon: MapPin },
    { number: 4, title: 'Contact', icon: User },
    { number: 5, title: 'Social Media', icon: MessageCircle },
    { number: 6, title: 'Video', icon: Video },
    { number: 7, title: 'Images', icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Vehicle Listing</h1>
          <p className="mt-2 text-gray-600">Sell your vehicle by creating a detailed listing</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive 
                      ? 'border-blue-600 bg-blue-600 text-white' 
                      : isCompleted 
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="ml-2">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
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
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., 2020 Toyota Corolla GLi Manual"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title[0]}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your vehicle's condition, features, and any other relevant details..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description[0]}</p>}
              </div>

              {/* Category, Make, Model */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => {
                      handleInputChange('category_id', e.target.value);
                      handleInputChange('make_id', '');
                      handleInputChange('model_id', '');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categoriesData?.data?.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id[0]}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Make *
                  </label>
                  <div className="space-y-2">
                    <select
                      value={formData.make_id}
                      onChange={(e) => {
                        handleInputChange('make_id', e.target.value);
                        handleInputChange('model_id', '');
                      }}
                      disabled={!formData.category_id}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Select Make</option>
                      {makesData?.data?.map(make => (
                        <option key={make.id} value={make.id}>
                          {make.name} {make.is_custom ? '(Custom)' : ''}
                        </option>
                      ))}
                    </select>

                    {!showCustomMakeForm ? (
                      <button
                        type="button"
                        onClick={() => setShowCustomMakeForm(true)}
                        disabled={!formData.category_id}
                        className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                      >
                        + Add Custom Make
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customMakeName}
                          onChange={(e) => setCustomMakeName(e.target.value)}
                          placeholder="Enter make name"
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleCreateCustomMake}
                          disabled={!customMakeName.trim() || createMakeMutation.isPending}
                          className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {createMakeMutation.isPending ? 'Adding...' : 'Add'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomMakeForm(false);
                            setCustomMakeName('');
                          }}
                          className="px-3 py-2 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  {errors.make_id && <p className="text-red-500 text-sm mt-1">{errors.make_id[0]}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model *
                  </label>
                  <div className="space-y-2">
                    <select
                      value={formData.model_id}
                      onChange={(e) => handleInputChange('model_id', e.target.value)}
                      disabled={!formData.make_id}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Select Model</option>
                      {modelsData?.data?.map(model => (
                        <option key={model.id} value={model.id}>
                          {model.name} {model.is_custom ? '(Custom)' : ''}
                        </option>
                      ))}
                    </select>

                    {!showCustomModelForm ? (
                      <button
                        type="button"
                        onClick={() => setShowCustomModelForm(true)}
                        disabled={!formData.make_id}
                        className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                      >
                        + Add Custom Model
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customModelName}
                          onChange={(e) => setCustomModelName(e.target.value)}
                          placeholder="Enter model name"
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleCreateCustomModel}
                          disabled={!customModelName.trim() || createModelMutation.isPending}
                          className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {createModelMutation.isPending ? 'Adding...' : 'Add'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomModelForm(false);
                            setCustomModelName('');
                          }}
                          className="px-3 py-2 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  {errors.model_id && <p className="text-red-500 text-sm mt-1">{errors.model_id[0]}</p>}
                </div>
              </div>

              {/* Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (PKR) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="1500000"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price[0]}</p>}
                </div>

                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    id="is_negotiable"
                    checked={formData.is_negotiable}
                    onChange={(e) => handleInputChange('is_negotiable', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_negotiable" className="ml-2 text-sm text-gray-700">
                    Price is negotiable
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Vehicle Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Vehicle Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                      placeholder="2020"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year[0]}</p>}
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color *
                  </label>
                  <div className="relative">
                    <Palette className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      placeholder="White"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {errors.color && <p className="text-red-500 text-sm mt-1">{errors.color[0]}</p>}
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition *
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="certified_pre_owned">Certified Pre-owned</option>
                  </select>
                  {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition[0]}</p>}
                </div>

                {/* Transmission */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transmission *
                  </label>
                  <div className="relative">
                    <Settings className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <select
                      value={formData.transmission}
                      onChange={(e) => handleInputChange('transmission', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="manual">Manual</option>
                      <option value="automatic">Automatic</option>
                      <option value="cvt">CVT</option>
                      <option value="semi_automatic">Semi-Automatic</option>
                    </select>
                  </div>
                  {errors.transmission && <p className="text-red-500 text-sm mt-1">{errors.transmission[0]}</p>}
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Type *
                  </label>
                  <div className="relative">
                    <Fuel className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <select
                      value={formData.fuel_type}
                      onChange={(e) => handleInputChange('fuel_type', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="electric">Electric</option>
                      <option value="cng">CNG</option>
                      <option value="lpg">LPG</option>
                    </select>
                  </div>
                  {errors.fuel_type && <p className="text-red-500 text-sm mt-1">{errors.fuel_type[0]}</p>}
                </div>

                {/* Engine Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Engine Capacity *
                  </label>
                  <input
                    type="text"
                    value={formData.engine_capacity}
                    onChange={(e) => handleInputChange('engine_capacity', e.target.value)}
                    placeholder="1300cc"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.engine_capacity && <p className="text-red-500 text-sm mt-1">{errors.engine_capacity[0]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Engine Power */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Engine Power (HP)
                  </label>
                  <input
                    type="number"
                    value={formData.engine_power}
                    onChange={(e) => handleInputChange('engine_power', e.target.value)}
                    placeholder="120"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.engine_power && <p className="text-red-500 text-sm mt-1">{errors.engine_power[0]}</p>}
                </div>

                {/* Mileage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mileage (KM) *
                  </label>
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange('mileage', e.target.value)}
                    placeholder="45000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.mileage && <p className="text-red-500 text-sm mt-1">{errors.mileage[0]}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Location Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Lahore"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city[0]}</p>}
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="Punjab"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state[0]}</p>}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address (Optional)
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Complete address for potential buyers to visit..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address[0]}</p>}
              </div>
            </div>
          )}

          {/* Step 4: Contact Information */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.contact_name}
                      onChange={(e) => handleInputChange('contact_name', e.target.value)}
                      placeholder="Your name"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {errors.contact_name && <p className="text-red-500 text-sm mt-1">{errors.contact_name[0]}</p>}
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {errors.contact_phone && <p className="text-red-500 text-sm mt-1">{errors.contact_phone[0]}</p>}
                </div>
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {errors.contact_email && <p className="text-red-500 text-sm mt-1">{errors.contact_email[0]}</p>}
              </div>

              {/* Privacy Options */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">Privacy Settings</h3>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="show_phone"
                    checked={formData.show_phone}
                    onChange={(e) => handleInputChange('show_phone', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="show_phone" className="ml-2 text-sm text-gray-700">
                    Show phone number publicly
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="show_email"
                    checked={formData.show_email}
                    onChange={(e) => handleInputChange('show_email', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="show_email" className="ml-2 text-sm text-gray-700">
                    Show email address publicly
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Social Media Links */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Social Media Links (Optional)</h2>
              <p className="text-gray-600 mb-6">Add your social media links to help buyers connect with you</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Facebook */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Facebook className="inline h-4 w-4 mr-2 text-blue-600" />
                    Facebook Profile/Page
                  </label>
                  <input
                    type="url"
                    value={formData.social_media_links.facebook}
                    onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                    placeholder="https://facebook.com/yourprofile"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Instagram */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Instagram className="inline h-4 w-4 mr-2 text-pink-600" />
                    Instagram Profile
                  </label>
                  <input
                    type="url"
                    value={formData.social_media_links.instagram}
                    onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                    placeholder="https://instagram.com/yourprofile"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Twitter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Twitter className="inline h-4 w-4 mr-2 text-blue-400" />
                    Twitter Profile
                  </label>
                  <input
                    type="url"
                    value={formData.social_media_links.twitter}
                    onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                    placeholder="https://twitter.com/yourprofile"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* YouTube */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Youtube className="inline h-4 w-4 mr-2 text-red-600" />
                    YouTube Channel
                  </label>
                  <input
                    type="url"
                    value={formData.social_media_links.youtube}
                    onChange={(e) => handleSocialMediaChange('youtube', e.target.value)}
                    placeholder="https://youtube.com/yourchannel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* TikTok */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Video className="inline h-4 w-4 mr-2 text-black" />
                    TikTok Profile
                  </label>
                  <input
                    type="url"
                    value={formData.social_media_links.tiktok}
                    onChange={(e) => handleSocialMediaChange('tiktok', e.target.value)}
                    placeholder="https://tiktok.com/@yourprofile"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageCircle className="inline h-4 w-4 mr-2 text-green-600" />
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={formData.social_media_links.whatsapp}
                    onChange={(e) => handleSocialMediaChange('whatsapp', e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Video Upload */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Video Advertisement (Optional)</h2>
              <p className="text-gray-600 mb-6">Upload a short video (max 10 seconds, 100MB) to showcase your vehicle</p>

              {!videoPreview ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Video
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Video className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="video" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Click to upload video
                        </span>
                        <span className="mt-1 block text-sm text-gray-500">
                          MP4, MOV, AVI up to 100MB (max 10 seconds)
                        </span>
                      </label>
                      <input
                        id="video"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Video Preview</h3>
                  <div className="relative">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full max-w-md h-64 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 7: Images */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Upload Images</h2>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Images (Max 10 images)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="images" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Click to upload images
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        PNG, JPG, GIF up to 5MB each
                      </span>
                    </label>
                    <input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>
                {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images[0]}</p>}
              </div>

              {/* Image Preview */}
              {imagePreview.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Uploaded Images ({imagePreview.length}/10)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                        >
                          ×
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Vehicle Features (Optional)</h3>

                {/* General Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    General Features
                  </label>
                  <FeatureInput
                    features={formData.features}
                    onAdd={(value) => handleFeatureAdd('features', value)}
                    onRemove={(index) => handleFeatureRemove('features', index)}
                    placeholder="e.g., Air Conditioning, Power Steering"
                  />
                </div>

                {/* Safety Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Safety Features
                  </label>
                  <FeatureInput
                    features={formData.safety_features}
                    onAdd={(value) => handleFeatureAdd('safety_features', value)}
                    onRemove={(index) => handleFeatureRemove('safety_features', index)}
                    placeholder="e.g., ABS, Airbags, Immobilizer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < 7 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={createVehicleMutation.isPending}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{createVehicleMutation.isPending ? 'Creating...' : 'Create Listing'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// Feature Input Component
const FeatureInput = ({ features, onAdd, onRemove, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {features.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {features.map((feature, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {feature}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreateListingPage;
