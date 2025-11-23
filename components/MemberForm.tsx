
import React, { useState, useEffect, useRef } from 'react';
import { Member, MembershipType, PlanCategory } from '../types';
import { X, Save, AlertCircle, Upload, Image as ImageIcon, Trash2, Info } from 'lucide-react';

interface MemberFormData {
  name: string;
  email: string;
  mobileNumber: string;
  membershipType: MembershipType;
  planCategory: PlanCategory;
  joinDate: string;
  nextDueDate: string;
  weight?: number;
  height?: number;
  age?: number;
  photoUrl?: string;
  notes?: string;
}

interface MemberFormProps {
  initialData?: Member | null;
  onSubmit: (data: MemberFormData) => void;
  onCancel: () => void;
  title?: string;
}

const MemberForm: React.FC<MemberFormProps> = ({ initialData, onSubmit, onCancel, title }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Helper to calculate due date
  const calculateDueDate = (startDate: string, type: MembershipType): string => {
    if (!startDate) return '';
    const date = new Date(startDate);
    if (isNaN(date.getTime())) return '';

    switch (type) {
      case MembershipType.MONTHLY:
        date.setMonth(date.getMonth() + 1);
        break;
      case MembershipType.QUARTERLY:
        date.setMonth(date.getMonth() + 3);
        break;
      case MembershipType.ANNUAL:
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    email: '',
    mobileNumber: '',
    membershipType: MembershipType.MONTHLY,
    planCategory: PlanCategory.FULL_ACCESS,
    joinDate: new Date().toISOString().split('T')[0],
    nextDueDate: '',
    weight: undefined,
    height: undefined,
    age: undefined,
    photoUrl: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof MemberFormData, string>>>({});
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('upload');

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        mobileNumber: initialData.mobileNumber,
        membershipType: initialData.membershipType,
        planCategory: initialData.planCategory,
        joinDate: initialData.joinDate ? new Date(initialData.joinDate).toISOString().split('T')[0] : '',
        nextDueDate: initialData.nextDueDate ? new Date(initialData.nextDueDate).toISOString().split('T')[0] : '',
        weight: initialData.weight,
        height: initialData.height,
        age: initialData.age,
        photoUrl: initialData.photoUrl || '',
        notes: initialData.notes || ''
      });
    } else {
      // For new members, auto-calculate the initial next due date based on default values
      const defaultJoinDate = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        joinDate: defaultJoinDate,
        nextDueDate: calculateDueDate(defaultJoinDate, MembershipType.MONTHLY)
      }));
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Partial<Record<keyof MemberFormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
    }
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    if (!formData.joinDate) newErrors.joinDate = 'Join date is required';
    if (!formData.nextDueDate) newErrors.nextDueDate = 'Next due date is required';
    if (formData.age !== undefined && formData.age < 0) newErrors.age = 'Age must be positive';
    if (formData.weight !== undefined && formData.weight < 0) newErrors.weight = 'Weight must be positive';
    if (formData.height !== undefined && formData.height < 0) newErrors.height = 'Height must be positive';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof MemberFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate Next Due Date when Join Date or Membership Type changes
      if (field === 'joinDate' || field === 'membershipType') {
        updated.nextDueDate = calculateDueDate(updated.joinDate, updated.membershipType);
      }
      
      return updated;
    });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File is too large. Max 5MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('photoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPhoto = () => {
    handleChange('photoUrl', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Health Calculation Logic
  const getHealthAnalysis = () => {
    if (!formData.weight || !formData.height || formData.height <= 0 || formData.weight <= 0) return null;

    // BMI Calculation
    const heightInMeters = formData.height / 100;
    const bmi = formData.weight / (heightInMeters * heightInMeters);
    
    // Ideal weight range (BMI 18.5 - 24.9)
    const minIdealWeight = 18.5 * (heightInMeters * heightInMeters);
    const maxIdealWeight = 24.9 * (heightInMeters * heightInMeters);

    let status = '';
    let colorClass = '';
    let tip = '';
    let difference = 0;

    if (bmi < 18.5) {
      status = 'Underweight';
      colorClass = 'bg-amber-50 text-amber-800 border-amber-200';
      difference = minIdealWeight - formData.weight;
      tip = `Health Tip: To reach a healthy weight, aim to gain approximately ${difference.toFixed(1)} kg through a balanced, calorie-surplus diet.`;
    } else if (bmi >= 18.5 && bmi <= 24.9) {
      status = 'Healthy Weight';
      colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      tip = 'Health Tip: Excellent! You are within the ideal weight range. Maintain your current fitness routine.';
    } else if (bmi >= 25 && bmi <= 29.9) {
      status = 'Overweight';
      colorClass = 'bg-orange-50 text-orange-800 border-orange-200';
      difference = formData.weight - maxIdealWeight;
      tip = `Health Tip: To reach a healthy weight, aim to lose approximately ${difference.toFixed(1)} kg through cardio and a balanced diet.`;
    } else {
      status = 'Obese';
      colorClass = 'bg-red-50 text-red-800 border-red-200';
      difference = formData.weight - maxIdealWeight;
      tip = `Health Tip: For better health, aim to lose approximately ${difference.toFixed(1)} kg. Consulting a nutritionist is recommended.`;
    }

    return {
      bmi: bmi.toFixed(1),
      status,
      colorClass,
      tip,
      idealRange: `${minIdealWeight.toFixed(1)} - ${maxIdealWeight.toFixed(1)} kg`
    };
  };

  const analysis = getHealthAnalysis();

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-2xl flex flex-col max-h-[90vh]">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-lg font-bold text-slate-800">{title || (initialData ? 'Edit Member' : 'Add New Member')}</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="overflow-y-auto p-6">
        <form id="member-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload Section */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-slate-700 mb-2">Member Photo</label>
              <div className="relative group w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                {formData.photoUrl ? (
                  <>
                    <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={clearPhoto}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-6 h-6 text-white" />
                    </button>
                  </>
                ) : (
                  <ImageIcon className="w-10 h-10 text-slate-400" />
                )}
              </div>
            </div>

            <div className="flex-grow space-y-3 w-full">
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  className={`pb-2 px-4 text-sm font-medium transition-colors relative ${activeTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setActiveTab('upload')}
                >
                  Upload Image
                </button>
                <button
                  type="button"
                  className={`pb-2 px-4 text-sm font-medium transition-colors relative ${activeTab === 'url' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setActiveTab('url')}
                >
                  Image URL
                </button>
              </div>

              {activeTab === 'upload' ? (
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 text-center hover:bg-slate-100 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    id="photo-upload" 
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center justify-center">
                    <Upload className="w-6 h-6 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600">Click to upload photo</span>
                    <span className="text-xs text-slate-400 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</span>
                  </label>
                </div>
              ) : (
                <div>
                   <input
                    type="text"
                    value={formData.photoUrl}
                    onChange={(e) => handleChange('photoUrl', e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="https://example.com/photo.jpg"
                  />
                  <p className="text-xs text-slate-500 mt-1">Enter a direct link to an image.</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6"></div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-300' : 'border-slate-300'}`}
              placeholder="John Doe"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-300' : 'border-slate-300'}`}
                placeholder="john@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.email}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => handleChange('mobileNumber', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.mobileNumber ? 'border-red-300' : 'border-slate-300'}`}
                placeholder="+1 555 000 0000"
              />
              {errors.mobileNumber && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.mobileNumber}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Membership Type */}
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Membership Type</label>
              <select
                value={formData.membershipType}
                onChange={(e) => handleChange('membershipType', e.target.value as MembershipType)}
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {Object.values(MembershipType).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Plan Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Plan Category</label>
              <select
                value={formData.planCategory}
                onChange={(e) => handleChange('planCategory', e.target.value as PlanCategory)}
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {Object.values(PlanCategory).map((plan) => (
                  <option key={plan} value={plan}>{plan.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Join Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Join Date</label>
              <input
                type="date"
                value={formData.joinDate}
                onChange={(e) => handleChange('joinDate', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.joinDate ? 'border-red-300' : 'border-slate-300'}`}
              />
              {errors.joinDate && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.joinDate}</p>}
            </div>

            {/* Next Due Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Next Due Date</label>
              <input
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => handleChange('nextDueDate', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.nextDueDate ? 'border-red-300' : 'border-slate-300'}`}
              />
              <p className="mt-1 text-xs text-slate-500">Auto-calculated based on plan, but you can edit it.</p>
              {errors.nextDueDate && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.nextDueDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
              <input
                type="number"
                min="0"
                max="120"
                value={formData.age === undefined ? '' : formData.age}
                onChange={(e) => handleChange('age', e.target.value === '' ? undefined : parseInt(e.target.value))}
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.age ? 'border-red-300' : 'border-slate-300'}`}
                placeholder="e.g. 25"
              />
              {errors.age && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.age}</p>}
            </div>

            {/* Height */}
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Height (cm)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.height === undefined ? '' : formData.height}
                onChange={(e) => handleChange('height', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.height ? 'border-red-300' : 'border-slate-300'}`}
                placeholder="e.g. 175"
              />
              {errors.height && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.height}</p>}
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.weight === undefined ? '' : formData.weight}
                onChange={(e) => handleChange('weight', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.weight ? 'border-red-300' : 'border-slate-300'}`}
                placeholder="e.g. 75.5"
              />
              {errors.weight && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.weight}</p>}
            </div>
          </div>

          {/* Health Analysis Panel - Only in Add Member Mode */}
          {!initialData && analysis && (
            <div className={`p-4 rounded-lg border ${analysis.colorClass} animate-in fade-in slide-in-from-top-2 duration-300`}>
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-bold text-base mb-1">
                    Health Category: {analysis.status}
                  </p>
                  <div className="space-y-1 opacity-90">
                    <p>BMI: <strong>{analysis.bmi}</strong> | Ideal Range: <strong>{analysis.idealRange}</strong></p>
                    <p className="italic font-medium mt-2">{analysis.tip}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

           {/* Notes */}
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special requirements or medical conditions..."
              />
            </div>
        </form>
      </div>

      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 z-10">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="member-form"
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          {initialData ? 'Update Member' : 'Save Member'}
        </button>
      </div>
    </div>
  );
};

export default MemberForm;
