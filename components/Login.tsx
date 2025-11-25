
import React, { useState } from 'react';
import { User, UserRole, MembershipType, PlanCategory, Member } from '../types';
import { createMember, loginUser, requestPasswordReset, resetPasswordWithOtp } from '../services/mockData';
import { Lock, Mail, Dumbbell, User as UserIcon, ShieldCheck, Phone, AlertCircle, ArrowLeft, KeyRound, Send } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User, member?: Member) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loginType, setLoginType] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  
  // Views: 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD'
  const [view, setView] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD'>('LOGIN');
  
  // Basic Auth
  const [email, setEmail] = useState('c@gmail.com');
  const [password, setPassword] = useState('987654');
  
  // Forgot Password Flow
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Member Profile Data (For Sign Up)
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [membershipType, setMembershipType] = useState<MembershipType>(MembershipType.MONTHLY);
  const [planCategory, setPlanCategory] = useState<PlanCategory>(PlanCategory.FULL_ACCESS);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTypeChange = (type: 'MEMBER' | 'ADMIN') => {
    setLoginType(type);
    setView('LOGIN'); // Reset to login mode
    setError('');
    setSuccessMsg('');
    
    // Auto-fill for demo convenience
    if (type === 'ADMIN') {
      setEmail('admin@gymforce.com');
      setPassword('password');
    } else {
      setEmail('c@gmail.com');
      setPassword('987654');
    }
  };

  const handleToggleSignUp = () => {
    if (view === 'LOGIN') {
        setView('SIGNUP');
        // Clear fields for new input
        setName('');
        setEmail('');
        setPassword('');
        setMobile('');
        setAge('');
        setHeight('');
        setWeight('');
    } else {
        setView('LOGIN');
        // Reset defaults
        if (loginType === 'ADMIN') {
            setEmail('admin@gymforce.com');
            setPassword('password');
        } else {
            setEmail('c@gmail.com');
            setPassword('987654');
        }
    }
    setError('');
    setSuccessMsg('');
  };

  const handleForgotPasswordClick = () => {
      setView('FORGOT_PASSWORD');
      setEmail(''); // Clear for input
      setError('');
      setSuccessMsg('');
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');
      
      try {
          const result = await requestPasswordReset(email);
          
          if (result.success) {
              setSuccessMsg(result.message);
              setView('RESET_PASSWORD');
          } else {
              setError(typeof result.message === 'string' ? result.message : 'Failed to send OTP');
          }
      } catch (err: any) {
          setError(err?.message || 'An unexpected error occurred');
      } finally {
          setIsLoading(false);
      }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');

      try {
          const result = await resetPasswordWithOtp(email, otp, newPassword);

          if (result.success) {
              setSuccessMsg(result.message);
              setTimeout(() => {
                  setView('LOGIN');
                  setPassword(newPassword); // Auto-fill new password
                  setSuccessMsg('Password updated. Please login.');
              }, 2000);
          } else {
               setError(typeof result.message === 'string' ? result.message : 'Failed to reset password');
          }
      } catch (err: any) {
           setError(err?.message || 'An unexpected error occurred');
      } finally {
          setIsLoading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (view === 'SIGNUP' && loginType === 'MEMBER') {
         // Handle Sign Up
         if (!name.trim() || !email.trim() || !password.trim() || !mobile.trim()) {
             setError('Please fill in all required fields.');
             setIsLoading(false);
             return;
         }

         // Enforce Join Date as Today for new self-sign-ups
         const today = new Date();
         
         // Create New Member Object for DB (or Update if claiming)
         const newMemberData: Partial<Member> & { password?: string } = {
            name: name,
            email: email,
            mobileNumber: mobile,
            joinDate: today.toISOString(), // Force Today
            membershipType: membershipType,
            planCategory: planCategory,
            nextDueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
            status: 'ACTIVE',
            weight: weight ? parseFloat(weight) : undefined,
            height: height ? parseFloat(height) : undefined,
            age: age ? parseInt(age) : undefined,
            password: password // Set the password
         };

         // Insert into Supabase (createMember handles logic to check if email exists and update it)
         const createdMember = await createMember(newMemberData);
         
         if (!createdMember) {
             throw new Error("Failed to create member");
         }

         const newUser: User = {
             id: createdMember.id,
             name: createdMember.name,
             email: createdMember.email,
             role: UserRole.MEMBER,
             tenantId: createdMember.tenantId,
             avatarUrl: createdMember.photoUrl
         };
         
         onLogin(newUser, createdMember);
      } else {
         // Handle Sign In with Real DB Check
         const result = await loginUser(email, password);
      
         if (result) {
            const { user, member } = result;
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

            onLogin(user, member);
         } else {
             setError('Invalid email or password.');
         }
      }
    } catch (err: any) {
        console.error("Login Error caught:", err);
        let errorMessage = 'An unexpected error occurred.';
        
        if (typeof err === 'string') {
            errorMessage = err;
        } else if (err instanceof Error) {
            errorMessage = err.message;
        } else if (err && typeof err === 'object') {
            if (err.message) {
                errorMessage = err.message;
            } else if (err.error_description) {
                errorMessage = err.error_description;
            } else {
                errorMessage = 'An error occurred. Please check console for details.';
            }
        }
        
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  // --- RENDER FORGOT PASSWORD FLOW ---
  if (view === 'FORGOT_PASSWORD') {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 animate-in zoom-in-95">
                <div className="text-center mb-6">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <KeyRound className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Forgot Password?</h2>
                    <p className="text-slate-500 mt-2 text-sm">Enter your email and we'll send you an OTP code to reset it.</p>
                </div>

                <form onSubmit={handleRequestOtp} className="space-y-6">
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
                                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70"
                    >
                        {isLoading ? 'Sending...' : 'Send OTP Code'}
                    </button>
                </form>

                <button 
                    onClick={() => setView('LOGIN')}
                    className="w-full mt-4 text-sm text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                </button>
            </div>
        </div>
      );
  }

  if (view === 'RESET_PASSWORD') {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 animate-in zoom-in-95">
                <div className="text-center mb-6">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Check Your Email</h2>
                    <p className="text-slate-500 mt-2 text-sm">Enter the OTP sent to <strong>{email}</strong></p>
                    <p className="text-xs text-amber-600 mt-1 font-medium">(Demo: Check Console/Alert for Code)</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP Code</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="block w-full px-3 py-2 text-center text-2xl tracking-widest border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="123456"
                            maxLength={6}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="New strong password"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}
                    
                    {successMsg && (
                        <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> {successMsg}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70"
                    >
                        {isLoading ? 'Updating...' : 'Set New Password'}
                    </button>
                </form>

                <button 
                    onClick={() => setView('FORGOT_PASSWORD')}
                    className="w-full mt-4 text-sm text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2"
                >
                    Resend Code
                </button>
            </div>
        </div>
      );
  }

  // --- STANDARD LOGIN / SIGNUP ---

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-xl w-full transition-all duration-300 overflow-hidden ${view === 'SIGNUP' ? 'max-w-3xl' : 'max-w-md'}`}>
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
                {loginType === 'ADMIN' ? 'Admin Portal' : (view === 'SIGNUP' ? 'New Member Registration' : 'Member Login')}
            </h2>
            {view === 'SIGNUP' && (
                <p className="text-xs text-slate-500 mt-1">
                    If your gym added you, sign up with that email to claim your account.
                </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {view === 'SIGNUP' && loginType === 'MEMBER' ? (
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
                                <p className="text-[10px] text-slate-500 mt-1">Use the email provided to your gym.</p>
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
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-slate-700">Password</label>
                            {loginType === 'MEMBER' && (
                                <button type="button" onClick={handleForgotPasswordClick} className="text-xs text-blue-600 hover:text-blue-700 hover:underline">
                                    Forgot Password?
                                </button>
                            )}
                        </div>
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
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-600 text-sm break-all">{error}</p>
                </div>
            )}
            
            {successMsg && (
                <div className="p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <p className="text-green-600 text-sm break-all">{successMsg}</p>
                </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading 
                ? 'Processing...' 
                : (loginType === 'ADMIN' ? 'Sign In as Admin' : (view === 'SIGNUP' ? 'Join GymForce' : 'Sign In'))}
            </button>
          </form>

          {loginType === 'MEMBER' && (
             <div className="mt-6 text-center">
                 <button
                    type="button"
                    onClick={handleToggleSignUp}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                 >
                     {view === 'SIGNUP' ? 'Already have an account? Sign In' : "New to GymForce? Claim/Create Account"}
                 </button>
             </div>
          )}

          {view !== 'SIGNUP' && (
            <div className="mt-6 text-center text-xs text-slate-500">
                <p>Demo Credentials:</p>
                {loginType === 'ADMIN' ? (
                     <p>Admin: admin@gymforce.com / password</p>
                ) : (
                     <p>Member: c@gmail.com / 987654</p>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
