import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, User, Mail, Phone, Lock, Hash, MapPin, Map, Navigation,
  Clock, Calendar, AlertCircle, Truck, HeartPulse, FileText, Camera, CheckCircle2, ChevronRight, ChevronLeft
} from 'lucide-react';

const steps = [
  { id: 1, title: 'Basic Info' },
  { id: 2, title: 'Details' },
  { id: 3, title: 'Location' },
  { id: 4, title: 'Business' },
  { id: 5, title: 'Verification' }
];

export default function PharmacyRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch, trigger, setValue } = useForm({
    mode: 'onTouched',
    defaultValues: {
      businessHours: {
        holidays: []
      }
    }
  });

  const navigate = useNavigate();

  // Helper to convert file to base64
  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue(fieldName, reader.result, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate = [];
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['name', 'ownerName', 'email', 'phone', 'password', 'confirmPassword'];
        break;
      case 2:
        fieldsToValidate = ['drugLicense', 'registrationNumber', 'yearsOfOperation'];
        break;
      case 3:
        fieldsToValidate = ['addressDetails.street', 'addressDetails.city', 'addressDetails.state', 'addressDetails.pinCode'];
        break;
      case 4:
        fieldsToValidate = ['businessHours.openingTime', 'businessHours.closingTime', 'emergencyContact'];
        break;
      case 5:
        fieldsToValidate = ['documents.drugLicenseFile', 'documents.ownerIdFile', 'terms'];
        break;
      default:
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Auto-detect location mock (Bangalore roughly)
      const payload = {
        ...data,
        address: `${data.addressDetails.street}, ${data.addressDetails.city}, ${data.addressDetails.state} - ${data.addressDetails.pinCode}`,
        coordinates: [77.5946, 12.9716] // Mock Coordinates
      };

      const res = await fetch('http://localhost:5000/api/auth/register-pharmacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      
      if (result.success) {
        setIsSuccess(true);
      } else {
        alert(result.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (name, label, Icon, type = 'text', options = {}) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon size={18} className="text-slate-400" />
        </div>
        <input
          type={type}
          {...register(name, options)}
          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${errors[name] ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      </div>
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
    </div>
  );

  const renderFile = (name, label, Icon) => {
    const fileValue = watch(name);
    return (
      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
        <div className="flex items-center justify-center w-full">
          <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors ${errors[name] ? 'border-red-500' : 'border-slate-300'}`}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {fileValue ? (
                <div className="flex flex-col items-center text-success">
                  <CheckCircle2 size={32} className="mb-2" />
                  <p className="text-sm font-semibold">File Uploaded</p>
                </div>
              ) : (
                <>
                  <Icon size={32} className="text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                </>
              )}
            </div>
            <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, name)} />
          </label>
        </div>
        {/* Hidden input to register the field properly with RHF */}
        <input type="hidden" {...register(name, { required: `${label} is required` })} />
        {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
      </div>
    );
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-40 sm:pt-48 sm:pt-36 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center text-slate-800">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={40} />
          </motion.div>
          <h2 className="text-3xl font-extrabold mb-4 font-display">Registration Submitted Successfully</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Your pharmacy profile has been submitted for verification. Our team will review your documents and notify you once your pharmacy is approved.
          </p>
          <div className="space-y-3">
            <Link to="/" className="block w-full bg-slate-100 text-slate-800 font-semibold py-3 rounded-xl hover:bg-slate-200 transition-all">Go to Home</Link>
            <Link to="/login" className="block w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/25">Login as Pharmacy</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-40 sm:pt-48 sm:pt-40 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 font-display mb-2">Register Your Pharmacy</h1>
          <p className="text-slate-500">Join the MediPing AI network and serve patients instantly.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 relative">
          <div className="flex justify-between items-center mb-2">
            {steps.map(step => (
              <div key={step.id} className="flex flex-col items-center z-10 w-1/5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  currentStep === step.id ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/10' :
                  currentStep > step.id ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                  {currentStep > step.id ? <CheckCircle2 size={18} /> : step.id}
                </div>
                <span className={`text-xs font-semibold mt-2 hidden sm:block ${currentStep >= step.id ? 'text-slate-800' : 'text-slate-400'}`}>{step.title}</span>
              </div>
            ))}
          </div>
          {/* Connecting line */}
          <div className="absolute top-5 left-[10%] right-[10%] h-[2px] bg-slate-200 -z-0">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative min-h-[500px]">
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 pb-24">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <h3 className="text-xl font-bold mb-6 text-slate-800 border-b pb-4">Step 1: Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    {renderInput('name', 'Pharmacy Name', Building2, 'text', { required: 'Pharmacy name is required' })}
                    {renderInput('ownerName', 'Owner Name', User, 'text', { required: 'Owner name is required' })}
                    {renderInput('email', 'Email Address', Mail, 'email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                    {renderInput('phone', 'Phone Number', Phone, 'tel', { required: 'Phone is required' })}
                    {renderInput('password', 'Password', Lock, 'password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                    {renderInput('confirmPassword', 'Confirm Password', Lock, 'password', { 
                      required: 'Confirm Password is required',
                      validate: val => {
                        if (watch('password') !== val) {
                          return 'Passwords do not match';
                        }
                      }
                    })}
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="step2" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <h3 className="text-xl font-bold mb-6 text-slate-800 border-b pb-4">Step 2: Pharmacy Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    {renderInput('drugLicense', 'Drug License Number', FileText, 'text', { required: 'Drug license is required' })}
                    {renderInput('registrationNumber', 'Registration Number', Hash, 'text', { required: 'Registration number is required' })}
                    {renderInput('gstNumber', 'GST Number (Optional)', Hash, 'text')}
                    {renderInput('yearsOfOperation', 'Years of Operation', Calendar, 'number', { required: 'Years of operation is required' })}
                  </div>
                  <div className="mt-2">
                    {renderFile('logoUrl', 'Pharmacy Logo', Camera)}
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="step3" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <h3 className="text-xl font-bold mb-6 text-slate-800 border-b pb-4">Step 3: Address & Location</h3>
                  {renderInput('addressDetails.street', 'Complete Address', MapPin, 'text', { required: 'Address is required' })}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                    {renderInput('addressDetails.city', 'City', Map, 'text', { required: 'City is required' })}
                    {renderInput('addressDetails.state', 'State', Map, 'text', { required: 'State is required' })}
                    {renderInput('addressDetails.pinCode', 'PIN Code', Hash, 'text', { required: 'PIN is required' })}
                  </div>
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-start space-x-3 mt-2">
                    <Navigation className="text-primary mt-0.5" size={20} />
                    <div>
                      <h4 className="font-semibold text-primary text-sm">Location Auto-Detection</h4>
                      <p className="text-xs text-slate-500 mt-1">For this demo, latitude and longitude will be auto-detected upon submission.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div key="step4" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <h3 className="text-xl font-bold mb-6 text-slate-800 border-b pb-4">Step 4: Business Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    {renderInput('businessHours.openingTime', 'Opening Time', Clock, 'time', { required: 'Opening time is required' })}
                    {renderInput('businessHours.closingTime', 'Closing Time', Clock, 'time', { required: 'Closing time is required' })}
                    {renderInput('emergencyContact', 'Emergency Contact Number', AlertCircle, 'tel', { required: 'Emergency contact is required' })}
                  </div>
                  <div className="mt-4 space-y-4">
                    <label className="flex items-center p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                      <input type="checkbox" {...register('homeDelivery')} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                      <div className="ml-3 flex items-center space-x-2">
                        <Truck size={18} className="text-slate-500" />
                        <span className="font-semibold text-slate-700">Offers Home Delivery</span>
                      </div>
                    </label>
                    <label className="flex items-center p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                      <input type="checkbox" {...register('service24x7')} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                      <div className="ml-3 flex items-center space-x-2">
                        <HeartPulse size={18} className="text-slate-500" />
                        <span className="font-semibold text-slate-700">24×7 Service</span>
                      </div>
                    </label>
                  </div>
                </motion.div>
              )}

              {currentStep === 5 && (
                <motion.div key="step5" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <h3 className="text-xl font-bold mb-6 text-slate-800 border-b pb-4">Step 5: Verification Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderFile('documents.drugLicenseFile', 'Drug License Copy', FileText)}
                    {renderFile('documents.ownerIdFile', 'Owner Govt ID', User)}
                  </div>
                  
                  <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <label className="flex items-start cursor-pointer">
                      <input type="checkbox" {...register('terms', { required: 'You must accept the terms and conditions' })} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary mt-0.5" />
                      <div className="ml-3">
                        <span className="text-sm text-slate-700 font-semibold block mb-1">Accept Terms & Conditions</span>
                        <span className="text-xs text-slate-500 leading-relaxed block">I hereby declare that all the information provided above is true and correct to the best of my knowledge. I understand that my pharmacy listing will be activated only after manual verification by the admin team.</span>
                      </div>
                    </label>
                    {errors.terms && <p className="text-red-500 text-xs mt-2 ml-8">{errors.terms.message}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center rounded-b-3xl">
              {currentStep > 1 ? (
                <button type="button" onClick={prevStep} className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition-colors flex items-center space-x-1">
                  <ChevronLeft size={18} />
                  <span>Back</span>
                </button>
              ) : <div></div>}

              {currentStep < 5 ? (
                <button type="button" onClick={nextStep} className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow-md shadow-primary/20 flex items-center space-x-1">
                  <span>Next Step</span>
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="bg-success text-white px-8 py-2.5 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-md shadow-success/20 flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Submit Registration</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
