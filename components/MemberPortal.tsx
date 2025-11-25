
import React, { useState, useEffect } from 'react';
import { Member, AttendanceLog } from '../types';
import { QrCode, Calendar, Clock, CreditCard, ChevronRight, MapPin, CheckCircle2, XCircle, Navigation, Loader2, BarChart2, Users, TrendingUp, LogOut, History } from 'lucide-react';
import { MOCK_MEMBERS, getGymCoordinates, updateGymLocation, getHourlyTraffic, HourlyTraffic, checkInMember, checkOutMember, getActiveCheckIn, getMemberHistory } from '../services/mockData';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface MemberPortalProps {
    member?: Member;
}

const MemberPortal: React.FC<MemberPortalProps> = ({ member }) => {
  // Use passed member prop or fallback to mock data for resilience
  const currentUser = member || MOCK_MEMBERS[0]; 
  
  // Geolocation State
  const [checkingIn, setCheckingIn] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [distanceInfo, setDistanceInfo] = useState<{distance: number, userLat: number, userLng: number} | null>(null);

  // Session State
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [currentAttendanceId, setCurrentAttendanceId] = useState<string | null>(null);
  
  // History State
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Traffic State
  const [trafficData, setTrafficData] = useState<HourlyTraffic[]>([]);
  const [currentCrowd, setCurrentCrowd] = useState<{level: string, color: string, percentage: number}>({ level: 'Moderate', color: 'text-yellow-600', percentage: 50 });
  const [peakHour, setPeakHour] = useState<string>('');

  useEffect(() => {
    // Load traffic data
    getHourlyTraffic().then(data => {
        setTrafficData(data);
        
        // Find Peak Hour
        if (data.length > 0) {
            const maxTraffic = Math.max(...data.map(d => d.count));
            const peak = data.find(d => d.count === maxTraffic);
            if (peak) setPeakHour(peak.hour);
        }
        
        // Determine current crowd based on current hour
        const currentHour = new Date().getHours();
        const currentData = data.find(d => d.hourInt === currentHour);
        
        if (currentData) {
            let level = 'Moderate';
            let color = 'text-yellow-600';
            
            if (currentData.count < 40) {
                level = 'Quiet';
                color = 'text-green-600';
            } else if (currentData.count > 75) {
                level = 'Busy';
                color = 'text-red-600';
            }
            
            setCurrentCrowd({ level, color, percentage: currentData.count });
        } else {
            // Gym is likely closed or no data for this hour
            setCurrentCrowd({ level: 'Closed / Quiet', color: 'text-slate-500', percentage: 0 });
        }
    });

    // Check for active session and load history from DB
    if (currentUser && currentUser.id) {
        checkActiveSession();
        loadHistory();
    }
  }, [currentUser]);

  const checkActiveSession = async () => {
      const active = await getActiveCheckIn(currentUser.id);
      if (active) {
          setIsCheckedIn(true);
          setCheckInTime(new Date(active.checkInTime));
          setCurrentAttendanceId(active.id);
          setLocationStatus('success');
      }
  };

  const loadHistory = async () => {
      setLoadingHistory(true);
      const history = await getMemberHistory(currentUser.id);
      setAttendanceHistory(history);
      setLoadingHistory(false);
  };

  // Haversine formula to calculate distance between two points in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const handleGeoCheckIn = () => {
    setCheckingIn(true);
    setLocationStatus('idle');
    setStatusMessage('Locating your position...');
    setDistanceInfo(null);

    const gymCoords = getGymCoordinates();

    if (!navigator.geolocation) {
      setCheckingIn(false);
      setLocationStatus('error');
      setStatusMessage('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        const distance = calculateDistance(
          userLat, 
          userLng, 
          gymCoords.latitude, 
          gymCoords.longitude
        );

        setDistanceInfo({ distance, userLat, userLng });

        // Check if user is within the allowed radius
        if (distance <= gymCoords.radiusMeters) {
          // Call Backend
          const result = await checkInMember(currentUser.id);
          
          if (result.success) {
              setLocationStatus('success');
              setStatusMessage(`Welcome, ${currentUser.name.split(' ')[0]}! You are checked in.`);
              setIsCheckedIn(true);
              setCheckInTime(new Date());
              if (result.id) setCurrentAttendanceId(result.id);
              loadHistory(); // Refresh list
          } else {
              setLocationStatus('error');
              setStatusMessage(`Database Error: ${result.error}`);
          }
        } else {
          setLocationStatus('error');
          setStatusMessage(`You are ${Math.round(distance)}m away from the gym. You must be within ${gymCoords.radiusMeters}m to check in.`);
        }
        setCheckingIn(false);
      },
      (error) => {
        console.error(error);
        setCheckingIn(false);
        setLocationStatus('error');
        setStatusMessage('Unable to retrieve your location. Please check your permissions.');
      }
    );
  };

  const handleCheckOut = async () => {
    // Note: We intentionally don't check location for checkout, assuming users might check out after leaving
    if (window.confirm("Are you sure you want to check out?")) {
        setIsCheckingOut(true);
        let result: { success: boolean; error?: string } = { success: true };

        if (currentAttendanceId) {
            result = await checkOutMember(currentAttendanceId);
        } else {
            console.warn("No attendance ID found, clearing local state only.");
        }
        
        setIsCheckingOut(false);

        if (result.success) {
            setIsCheckedIn(false);
            setCheckInTime(null);
            setCurrentAttendanceId(null);
            setLocationStatus('idle');
            setStatusMessage('');
            setDistanceInfo(null);
            loadHistory(); // Refresh list
        } else {
            const errorMsg = result.error || "Unknown error";
            alert(`Failed to check out: ${errorMsg}. \n\nEnsure your Database policies allow updates.`);
        }
    }
  };
  
  // Fallback function to clear local state if DB is stuck
  const forceLocalSignOut = () => {
     if(window.confirm("This will clear your 'Checked In' status locally but might not update the database if permissions are blocked. Continue?")) {
        setIsCheckedIn(false);
        setCheckInTime(null);
        setCurrentAttendanceId(null);
        setLocationStatus('idle');
        setStatusMessage('');
     }
  };

  const handleDemoSetLocation = () => {
    if (distanceInfo) {
      updateGymLocation(distanceInfo.userLat, distanceInfo.userLng);
      handleGeoCheckIn();
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Membership</h1>
        <p className="text-slate-500">Manage your profile and check-ins.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Check-in Card (Replaces generic Profile/QR card) */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="bg-blue-600 p-6 text-white text-center">
                <div className="w-24 h-24 mx-auto rounded-full border-4 border-white shadow-sm overflow-hidden mb-4 bg-slate-200">
                    <img src={currentUser.photoUrl || `https://ui-avatars.com/api/?name=${currentUser.name}&size=128`} alt={currentUser.name} />
                </div>
                <h2 className="text-xl font-bold">{currentUser.name}</h2>
                <div className={`mt-2 inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                    currentUser.status === 'ACTIVE' ? 'bg-green-400/20 text-green-50 border border-green-400/30' : 'bg-red-400/20 text-red-50 border border-red-400/30'
                }`}>
                    {currentUser.status}
                </div>
                {/* Physical Stats Mini-bar */}
                {(currentUser.weight || currentUser.height) && (
                   <div className="flex justify-center gap-4 mt-4 text-sm text-blue-100 border-t border-blue-500 pt-3">
                       {currentUser.weight && <div><span className="font-bold">{currentUser.weight}</span> kg</div>}
                       {currentUser.height && <div><span className="font-bold">{currentUser.height}</span> cm</div>}
                       {currentUser.age && <div><span className="font-bold">{currentUser.age}</span> yrs</div>}
                   </div>
                )}
            </div>
            
            <div className="p-6 flex flex-col items-center">
                <div className="w-full mb-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Smart Attendance
                  </h3>
                  
                  {/* Location Check-in Box */}
                  <div className={`rounded-xl border-2 p-4 text-center transition-all ${
                    isCheckedIn ? 'border-green-500 bg-green-50' : 
                    locationStatus === 'error' ? 'border-red-200 bg-red-50' : 
                    'border-slate-100 bg-slate-50'
                  }`}>
                    
                    {isCheckedIn ? (
                      <div className="py-2 animate-in zoom-in duration-300">
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2 border border-green-200">
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-green-800 font-bold text-lg">Checked In</p>
                        <p className="text-sm text-green-700 mt-1 mb-4 flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" />
                            {checkInTime?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        
                        <div className="space-y-2">
                            <button 
                                onClick={handleCheckOut}
                                disabled={isCheckingOut}
                                className="w-full py-2.5 bg-white border border-green-200 text-green-700 font-semibold rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isCheckingOut ? (
                                    <Loader2 className="w-4 h-4 animate-spin" /> 
                                ) : (
                                    <LogOut className="w-4 h-4" />
                                )}
                                {isCheckingOut ? 'Signing Out...' : 'Check Out'}
                            </button>

                            <button
                                onClick={forceLocalSignOut}
                                className="text-xs text-slate-400 hover:text-slate-600 underline"
                            >
                                Force Local Sign Out (If Stuck)
                            </button>
                        </div>
                      </div>
                    ) : (
                      <>
                         <button 
                            onClick={handleGeoCheckIn}
                            disabled={checkingIn}
                            className={`w-full py-3 rounded-lg font-semibold text-white shadow-sm flex items-center justify-center gap-2 transition-all ${
                              checkingIn ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5'
                            }`}
                          >
                            {checkingIn ? (
                              <><Loader2 className="w-5 h-5 animate-spin" /> Verifying Location...</>
                            ) : (
                              <><Navigation className="w-5 h-5" /> Check In Now</>
                            )}
                          </button>
                          
                          {locationStatus === 'error' && (
                            <div className="mt-3 text-sm text-red-600 animate-in fade-in slide-in-from-top-1">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <XCircle className="w-4 h-4" />
                                  <span className="font-semibold">Check-in Failed</span>
                                </div>
                                <p className="opacity-90">{statusMessage}</p>
                                
                                {/* Demo Button: Only shows if we have distance info (meaning geoloc worked but user is far) */}
                                {distanceInfo && (
                                  <button 
                                    onClick={handleDemoSetLocation}
                                    className="mt-3 text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded border border-red-200 transition-colors"
                                  >
                                    Demo: Move Gym to Me
                                  </button>
                                )}
                            </div>
                          )}
                          
                          {locationStatus === 'idle' && (
                            <p className="text-xs text-slate-400 mt-3">
                              You must be at the gym location to check in.
                            </p>
                          )}
                      </>
                    )}
                  </div>
                </div>

                {/* QR Code Backup */}
                <div className="w-full pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-700">
                      <QrCode className="w-5 h-5" />
                      <span className="text-sm font-medium">Show QR Code</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                  </div>
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
            {/* Membership Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Plan Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3 text-slate-600 mb-1">
                            <CreditCard className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Current Plan</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">{currentUser.membershipType} <span className="text-sm font-normal text-slate-500">({currentUser.planCategory})</span></p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3 text-slate-600 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Next Payment</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">{new Date(currentUser.nextDueDate).toLocaleDateString()}</p>
                    </div>
                </div>
                <button className="mt-4 w-full sm:w-auto px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                    View Payment History
                </button>
            </div>

            {/* Recent Activity (Real Data) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Attendance History</h3>
                    {loadingHistory && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                </div>
                
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {/* Active Session Indicator */}
                    {isCheckedIn && (
                       <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100 animate-in fade-in slide-in-from-left-2">
                          <div className="flex items-center gap-4">
                              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                  <MapPin className="w-5 h-5" />
                              </div>
                              <div>
                                  <p className="font-medium text-slate-900">Current Session</p>
                                  <p className="text-xs text-slate-500">Checked In • {checkInTime?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                              </div>
                          </div>
                          <span className="text-xs font-bold text-green-600 px-2 py-1 bg-green-100 rounded-full">LIVE</span>
                      </div>
                    )}

                    {/* Past History */}
                    {attendanceHistory.length > 0 ? (
                        attendanceHistory.map((log) => {
                            const isCurrent = log.id === currentAttendanceId;
                            if (isCurrent) return null; // Don't duplicate if shown above

                            const checkIn = new Date(log.checkInTime);
                            const checkOut = log.checkOutTime ? new Date(log.checkOutTime) : null;
                            const duration = checkOut 
                                ? Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60)) 
                                : null;

                            return (
                                <div key={log.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                                            <History className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">Gym Session</p>
                                            <p className="text-xs text-slate-500">
                                                {checkIn.toLocaleDateString()} • {checkIn.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                {checkOut && ` - ${checkOut.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                                            </p>
                                        </div>
                                    </div>
                                    {duration ? (
                                        <span className="text-xs text-slate-400 font-medium">{duration} mins</span>
                                    ) : (
                                        <span className="text-xs text-orange-500 font-medium">No Check-out</span>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        !isCheckedIn && (
                            <p className="text-center text-slate-500 py-4 text-sm">No recent attendance history.</p>
                        )
                    )}
                </div>
            </div>
        </div>

        {/* Popular Times Graph - Full Width at Bottom */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-blue-600" />
                        Popular Times
                    </h3>
                    <p className="text-sm text-slate-500">Plan your workout to avoid the crowd.</p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-4">
                    {peakHour && (
                        <div className="hidden sm:flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                            <TrendingUp className="w-5 h-5 text-slate-400" />
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Peak Time</p>
                                <p className="font-bold text-slate-700">{peakHour}</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                        <Users className="w-5 h-5 text-slate-400" />
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Live Status</p>
                            <p className={`font-bold ${currentCrowd.color}`}>
                                {currentCrowd.level} 
                                <span className="ml-1 text-slate-400 text-xs font-normal">({currentCrowd.percentage}%)</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trafficData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <XAxis 
                            dataKey="hour" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: '#94a3b8' }} 
                            interval={1} 
                        />
                        <Tooltip 
                            cursor={{ fill: '#f1f5f9' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number) => [`${value}% Capacity`, 'Crowd Level']}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {trafficData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={
                                        entry.count > 75 ? '#ef4444' : // Red for busy
                                        entry.count > 40 ? '#f59e0b' : // Orange/Yellow for moderate
                                        '#22c55e'                       // Green for quiet
                                    } 
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-4 flex justify-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Quiet</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span>Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Busy</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default MemberPortal;
    