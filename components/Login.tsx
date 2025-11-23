import React, { useState } from 'react';
import { User, UserRole, MembershipType, PlanCategory, Member } from '../types';
import { MOCK_USERS, MOCK_MEMBERS } from '../services/mockData';
import { Lock, Mail, Dumbbell, User as UserIcon, ShieldCheck, Phone, Ruler, Weight, Calendar, CreditCard } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User, member?: Member) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loginType, setLoginType] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Basic Auth
  const [email, setEmail] = useState('john@example.com');
  const [password, setPassword] = useState('password');
  
  // Member Profile Data
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [membershipType, setMembershipType] = useState<MembershipType>(MembershipType.MONTHLY);
  const [planCategory, setPlanCategory] = useState<PlanCategory>(PlanCategory.FULL_ACCESS);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTypeChange = (type: 'MEMBER' | 'ADMIN') => {
    setLoginType(type);
    setIsSignUp(false); // Reset to login mode when switching types
    setError('');
    
    // Auto-fill for demo convenience
    if (type === 'ADMIN') {
      setEmail('admin@gymforce.com');
    } else {
      setEmail('john@example.com');
    }
    setPassword('password');
  };

  const handleToggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setError('');
    
    if (!isSignUp) {
        // Switching to Sign Up: Clear fields
        setName('');
        setEmail('');
        setPassword('');
        setMobile('');
        setAge('');
        setHeight('');
        setWeight('');
    } else {
        // Switching to Sign In: Reset demo defaults
        setEmail('john@example.com');
        setPassword('password');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API delay
    setTimeout(() => {
      if (isSignUp && loginType === 'MEMBER') {
         // Handle Sign Up
         if (!name.trim() || !email.trim() || !password.trim() || !mobile.trim()) {
             setError('Please fill in all required fields.');
             setIsLoading(false);
             return;
         }

         // 1. Check if user already has an account
         const existingUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
         if (existingUser) {
             setError('An account with this email already exists. Please Sign In.');
             setIsLoading(false);
             return;
         }

         // Create New Member Object
         const newMember: Member = {
            id: `m-${Date.now()}`,
            tenantId: 'tenant_123',
            name: name,
            email: email,
            mobileNumber: mobile,
            joinDate: new Date().toISOString(),
            membershipType: membershipType,
            planCategory: planCategory,
            nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
            status: 'ACTIVE',
            weight: weight ? parseFloat(weight) : undefined,
            height: height ? parseFloat(height) : undefined,
            age: age ? parseInt(age) : undefined,
         };

         const newUser: User = {
             id: `u-${Date.now()}`,
             name: name,
             email: email,
             role: UserRole.MEMBER,
             tenantId: 'tenant_123',
             avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
         };
         
         onLogin(newUser, newMember);
      } else {
         // Handle Sign In
         const user = MOCK_USERS.find(u => u.email === email);
      
         if (user) {
            const isAdminRole = user.role === UserRole.GYM_ADMIN || user.role === UserRole.SUPER_ADMIN;
            const isMemberRole = user.role === UserRole.MEMBER;

            if (loginType === 'ADMIN' && !isAdminRole) {
                setError('This account does not have admin privileges.');
                setIsLoading(false);
                return;
            }

            if (loginType === 'MEMBER' && !isMemberRole) {
                setError('Please use the Admin Portal for staff accounts.');
                setIsLoading(false);
                return;
            }

            // Find associated member profile if it's a member login
            const memberProfile = isMemberRole ? MOCK_MEMBERS.find(m => m.email === user.email) : undefined;
            onLogin(user, memberProfile);
         } else {
            setError('Invalid credentials');
         }
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-xl w-full transition-all duration-300 overflow-hidden ${isSignUp ? 'max-w-3xl' : 'max-w-md'}`}>
        <div className="bg-blue-600 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-full">
              <Dumbbell className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">GymForce SaaS</h1>
          <p className="text-blue-100 mt-2">Manage your gym with ease</p>
        </div>
        
        <div className="p-8">
          {/* Login Type Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6 max-w-sm mx-auto">
            <button
                type="button"
                onClick={() => handleTypeChange('MEMBER')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                    loginType === 'MEMBER' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <UserIcon className="w-4 h-4" />
                Member
            </button>
            <button
                type="button"
                onClick={() => handleTypeChange('ADMIN')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                    loginType === 'ADMIN' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <ShieldCheck className="w-4 h-4" />
                Admin
            </button>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-slate-800">
                {loginType === 'ADMIN' ? 'Admin Portal' : (isSignUp ? 'New Member Registration' : 'Member Login')}
            </h2>
            {isSignUp && (
                <p className="text-xs text-slate-500 mt-1">Complete your profile to join GymForce</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && loginType === 'MEMBER' ? (
                // Sign Up Form (Expanded)
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                     {/* Left Column: Personal Info */}
                     <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b pb-2">Personal Details</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="John Doe"
                                required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="you@example.com"
                                required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="••••••••"
                                required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                type="tel"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="+1 555 000 0000"
                                required
                                />
                            </div>
                        </div>
                     </div>

                     {/* Right Column: Physical & Plan Info */}
                     <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b pb-2">Physical Stats & Plan</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="25"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Height (cm)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="175"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="70"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Membership Type</label>
                            <select
                                value={membershipType}
                                onChange={(e) => setMembershipType(e.target.value as MembershipType)}
                                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                {Object.values(MembershipType).map((type) => (
                                <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Plan</label>
                            <select
                                value={planCategory}
                                onChange={(e) => setPlanCategory(e.target.value as PlanCategory)}
                                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                {Object.values(PlanCategory).map((plan) => (
                                <option key={plan} value={plan}>{plan.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                     </div>
                </div>
            ) : (
                // Sign In Form (Standard)
                <div className="space-y-6">
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="you@example.com"
                        required
                        />
                    </div>
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="••••••••"
                        required
                        />
                    </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading 
                ? 'Processing...' 
                : (loginType === 'ADMIN' ? 'Sign In as Admin' : (isSignUp ? 'Join GymForce' : 'Sign In'))}
            </button>
          </form>

          {loginType === 'MEMBER' && (
             <div className="mt-6 text-center">
                 <button
                    type="button"
                    onClick={handleToggleSignUp}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                 >
                     {isSignUp ? 'Already have an account? Sign In' : "New to GymForce? Create an Account"}
                 </button>
             </div>
          )}

          {!isSignUp && (
            <div className="mt-6 text-center text-xs text-slate-500">
                <p>Demo Credentials:</p>
                {loginType === 'ADMIN' ? (
                     <p>Admin: admin@gymforce.com / password</p>
                ) : (
                     <p>Member: john@example.com / password</p>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;