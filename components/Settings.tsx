import React, { useState, useEffect } from 'react';
import { Save, MapPin, Navigation, Loader2, CheckCircle2 } from 'lucide-react';
import { getGymCoordinates, saveGymCoordinates } from '../services/mockData';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [locating, setLocating] = useState(false);
  
  const [formData, setFormData] = useState({
    latitude: 0,
    longitude: 0,
    radiusMeters: 100
  });

  useEffect(() => {
    const coords = getGymCoordinates();
    setFormData(coords);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
    setSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      saveGymCoordinates(formData.latitude, formData.longitude, formData.radiusMeters);
      setLoading(false);
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    }, 600);
  };

  const handleGetCurrentLocation = () => {
    setLocating(true);
    setSuccess(false);
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve location. Please check browser permissions.");
        setLocating(false);
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Gym Settings</h1>
        <p className="text-slate-500">Configure your gym's profile and attendance rules.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden max-w-2xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                 <MapPin className="w-5 h-5" />
              </div>
              <div>
                  <h2 className="text-lg font-semibold text-slate-800">Location Configuration</h2>
                  <p className="text-sm text-slate-500">Set your gym's coordinates for Member Smart Check-in.</p>
              </div>
           </div>
        </div>
        
        <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                        <input 
                            type="number" 
                            step="any"
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="40.7128"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                        <input 
                            type="number" 
                            step="any"
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="-74.0060"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Check-in Radius (Meters)</label>
                    <div className="flex items-center gap-4">
                        <input 
                            type="number" 
                            step="1"
                            name="radiusMeters"
                            value={formData.radiusMeters}
                            onChange={handleChange}
                            className="block w-full max-w-[150px] px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="100"
                            required
                        />
                        <span className="text-sm text-slate-500">
                            Members must be within this distance to check in.
                        </span>
                    </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={handleGetCurrentLocation}
                        disabled={locating}
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        {locating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Navigation className="w-4 h-4 mr-2" />}
                        Set to My Current Location
                    </button>
                    
                    <div className="flex-grow"></div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Settings
                            </>
                        )}
                    </button>
                </div>

                {success && (
                    <div className="p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-medium">Settings saved successfully!</span>
                    </div>
                )}
            </form>
        </div>
        
        <div className="bg-slate-50 p-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 flex items-center gap-2">
                <span className="font-semibold">Note:</span> 
                Updating location will immediately affect all member check-ins.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
