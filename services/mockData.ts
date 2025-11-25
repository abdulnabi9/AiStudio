
import { Member, MembershipType, PlanCategory, Payment, User, UserRole, AttendanceRecord, AttendanceLog } from '../types';
import { supabase } from './supabaseClient';

// Mock Tenant ID
export const CURRENT_TENANT_ID = 'tenant_123';

// Storage Key
const COORDS_STORAGE_KEY = 'gym_coordinates';

// Default Location (Central Park, NY)
const DEFAULT_COORDINATES = {
  latitude: 40.785091,
  longitude: -73.968285,
  radiusMeters: 100
};

// Helper to safely extract error message
const getSafeErrorMessage = (error: any): string => {
    if (!error) return "Unknown error occurred";
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    // Handle Supabase/Postgrest Error Object
    if (typeof error === 'object') {
        if (error.message) return error.message;
        if (error.error_description) return error.error_description;
        // Fallback for objects that don't look like errors
        try {
            return JSON.stringify(error);
        } catch (e) {
            return "An unexpected error occurred";
        }
    }
    return "An unexpected error occurred";
};

// Get Coordinates (from Storage or Default)
export const getGymCoordinates = () => {
  const stored = localStorage.getItem(COORDS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_COORDINATES;
};

// Save Coordinates
export const saveGymCoordinates = (lat: number, lng: number, radius: number) => {
  const coords = { latitude: lat, longitude: lng, radiusMeters: radius };
  localStorage.setItem(COORDS_STORAGE_KEY, JSON.stringify(coords));
  return coords;
};

// Helper for demo purposes to move the gym to the user (Updates global state)
export const updateGymLocation = (lat: number, lng: number) => {
  const current = getGymCoordinates();
  saveGymCoordinates(lat, lng, current.radiusMeters);
};

// Mock Users (Fallback only)
export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@gymforce.com',
    role: UserRole.GYM_ADMIN,
    tenantId: CURRENT_TENANT_ID,
    avatarUrl: 'https://picsum.photos/100/100'
  }
];

// Mock Members
export const MOCK_MEMBERS: Member[] = [
  {
    id: 'm1',
    tenantId: CURRENT_TENANT_ID,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    mobileNumber: '555-0101',
    joinDate: '2023-01-15',
    membershipType: MembershipType.ANNUAL,
    planCategory: PlanCategory.FULL_ACCESS,
    nextDueDate: '2024-01-15',
    status: 'ACTIVE',
    lastCheckIn: '2023-10-26T08:30:00',
    weight: 65
  },
  {
    id: 'm2',
    tenantId: CURRENT_TENANT_ID,
    name: 'Bob Smith',
    email: 'bob@example.com',
    mobileNumber: '555-0102',
    joinDate: '2023-05-20',
    membershipType: MembershipType.MONTHLY,
    planCategory: PlanCategory.STRENGTH,
    nextDueDate: '2023-11-20',
    status: 'OVERDUE',
    lastCheckIn: '2023-10-25T18:15:00',
    weight: 85
  }
];

// Mock Payments
export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'p1',
    memberId: 'm1',
    memberName: 'Alice Johnson',
    amount: 500,
    date: '2023-01-15',
    method: 'CREDIT_CARD',
    status: 'PAID'
  },
  {
    id: 'p2',
    memberId: 'm2',
    memberName: 'Bob Smith',
    amount: 50,
    date: '2023-09-20',
    method: 'CASH',
    status: 'PAID'
  }
];

// Mock Attendance Data for Chart (Fallback)
export const MOCK_ATTENDANCE_STATS: AttendanceRecord[] = [
  { date: 'Mon', count: 45 },
  { date: 'Tue', count: 52 },
  { date: 'Wed', count: 49 },
  { date: 'Thu', count: 60 },
  { date: 'Fri', count: 55 },
  { date: 'Sat', count: 30 },
  { date: 'Sun', count: 20 },
];

export interface HourlyTraffic {
  hour: string; // e.g., "6 AM"
  hourInt: number; // e.g., 6
  count: number; // 0-100 percentage
}

// Mock Hourly Traffic (Peaks at 7-8 AM and 6-7 PM)
export const MOCK_HOURLY_TRAFFIC: HourlyTraffic[] = [
  { hour: '6 AM', hourInt: 6, count: 45 },
  { hour: '7 AM', hourInt: 7, count: 75 },
  { hour: '8 AM', hourInt: 8, count: 85 },
  { hour: '9 AM', hourInt: 9, count: 60 },
  { hour: '10 AM', hourInt: 10, count: 40 },
  { hour: '11 AM', hourInt: 11, count: 30 },
  { hour: '12 PM', hourInt: 12, count: 45 },
  { hour: '1 PM', hourInt: 13, count: 40 },
  { hour: '2 PM', hourInt: 14, count: 35 },
  { hour: '3 PM', hourInt: 15, count: 30 },
  { hour: '4 PM', hourInt: 16, count: 55 },
  { hour: '5 PM', hourInt: 17, count: 85 },
  { hour: '6 PM', hourInt: 18, count: 95 },
  { hour: '7 PM', hourInt: 19, count: 90 },
  { hour: '8 PM', hourInt: 20, count: 70 },
  { hour: '9 PM', hourInt: 21, count: 50 },
  { hour: '10 PM', hourInt: 22, count: 20 },
];

// Helper to map Supabase row to Member type
const mapSupabaseToMember = (d: any): Member => ({
  id: d.id,
  tenantId: d.tenant_id || CURRENT_TENANT_ID,
  name: d.name,
  email: d.email,
  mobileNumber: d.mobile_number,
  joinDate: d.join_date,
  membershipType: d.membership_type as MembershipType,
  planCategory: d.plan_category as PlanCategory,
  nextDueDate: d.next_due_date,
  status: d.status,
  lastCheckIn: d.last_check_in,
  weight: d.weight,
  height: d.height,
  notes: d.notes,
  age: d.age,
  photoUrl: d.photo_url
});

export const getMembers = async (): Promise<Member[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map(mapSupabaseToMember);
      }
    } catch (e) {
      console.warn("Supabase fetch failed, falling back to mock data", e);
    }
  }
  return Promise.resolve(MOCK_MEMBERS);
};

export const getUpcomingRenewals = async (days: number = 7): Promise<Member[]> => {
    if (!supabase) return [];
    
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    const todayStr = today.toISOString().split('T')[0];
    const futureStr = futureDate.toISOString().split('T')[0];

    try {
        const { data, error } = await supabase
            .from('members')
            .select('*')
            // next_due_date is between today and today+days
            .gte('next_due_date', todayStr)
            .lte('next_due_date', futureStr)
            .order('next_due_date', { ascending: true });
            
        if (error) {
            // Graceful handling for missing column/table
             if (error.code === '42703' || error.message.includes('column')) return [];
             if (error.code === '42P01') return [];
             throw error;
        }
        
        return data.map(mapSupabaseToMember);
    } catch (e) {
        console.error("Error fetching renewals:", e);
        return [];
    }
};

export const loginUser = async (email: string, password: string): Promise<{ user: User, member?: Member } | null> => {
  if (!supabase) return null;

  // 1. Check if it's the hardcoded mock admin
  if (email === 'admin@gymforce.com' && password === 'password') {
    return { user: MOCK_USERS[0] };
  }

  // 2. Check Supabase Members table for login
  try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();

      if (error) {
          // Detect schema cache error (code 42703 is undefined_column)
          if (error.code === '42703' || (error.message && (error.message.includes('password') || error.message.includes('column')))) {
              console.warn("Schema mismatch (missing password column). Falling back to email-only auth.");
              // Fallback: Check user by email only if schema is out of sync
              const { data: fallbackData, error: fallbackError } = await supabase
                  .from('members')
                  .select('*')
                  .eq('email', email)
                  .maybeSingle();

              if (!fallbackError && fallbackData) {
                  const member = mapSupabaseToMember(fallbackData);
                  const user: User = {
                      id: member.id,
                      name: member.name,
                      email: member.email,
                      role: UserRole.MEMBER,
                      tenantId: member.tenantId,
                      avatarUrl: member.photoUrl
                  };
                  return { user, member };
              }
          }
          throw error;
      }

      if (data) {
         const member = mapSupabaseToMember(data);
         const user: User = {
             id: member.id,
             name: member.name,
             email: member.email,
             role: UserRole.MEMBER,
             tenantId: member.tenantId,
             avatarUrl: member.photoUrl
         };
         return { user, member };
      }
  } catch (err: any) {
      console.error("Login failed:", err);
  }

  return null;
};

// --- PASSWORD RESET LOGIC ---

// 1. Request OTP
export const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (!supabase) return { success: false, message: "System not connected" };

    try {
        // Check if user exists
        const { data: member, error } = await supabase
            .from('members')
            .select('id, name')
            .eq('email', email)
            .maybeSingle();

        if (error) throw error;
        if (!member) return { success: false, message: "Email not found." };

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Expiry 15 mins from now
        const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        // Save OTP to DB
        const { error: updateError } = await supabase
            .from('members')
            .update({ 
                reset_otp: otp, 
                reset_otp_expiry: expiry 
            })
            .eq('id', member.id);

        if (updateError) {
             // Handle missing column error gracefully
             if (updateError.code === '42703') {
                 return { success: false, message: "Database schema not updated. Please contact admin to run SQL migrations." };
             }
             throw updateError;
        }

        // --- SIMULATE EMAIL SENDING ---
        // In a real app, you would call an API (e.g., EmailJS, SendGrid, Supabase Edge Function) here.
        // For this demo, we alert it.
        console.log(`[EMAIL SERVICE MOCK] To: ${email} | Subject: Password Reset | OTP: ${otp}`);
        alert(`DEMO MODE: An email would be sent to ${email}.\n\nYour Verification Code is: ${otp}\n\n(Check console logs for details)`);

        return { success: true, message: "OTP sent to your email." };
    } catch (e: any) {
        console.error("Reset request failed:", e);
        return { success: false, message: getSafeErrorMessage(e) };
    }
};

// 2. Verify OTP and Reset Password
export const resetPasswordWithOtp = async (email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!supabase) return { success: false, message: "System not connected" };

    try {
        const { data: member, error } = await supabase
            .from('members')
            .select('id, reset_otp, reset_otp_expiry')
            .eq('email', email)
            .maybeSingle();

        if (error || !member) return { success: false, message: "Invalid request." };

        // Verify OTP
        if (member.reset_otp !== otp) {
            return { success: false, message: "Invalid OTP code." };
        }

        // Verify Expiry
        if (new Date() > new Date(member.reset_otp_expiry)) {
            return { success: false, message: "OTP has expired. Please request a new one." };
        }

        // Update Password and Clear OTP
        const { error: updateError } = await supabase
            .from('members')
            .update({ 
                password: newPassword,
                reset_otp: null,
                reset_otp_expiry: null
            })
            .eq('id', member.id);

        if (updateError) throw updateError;

        return { success: true, message: "Password updated successfully! Please login." };
    } catch (e: any) {
        console.error("Reset failed:", e);
        return { success: false, message: getSafeErrorMessage(e) };
    }
};

export const createMember = async (member: Partial<Member> & { password?: string }): Promise<Member | null> => {
  if (!supabase) {
    console.warn("Supabase not configured, returning mock object");
    return { ...member, id: `mock-${Date.now()}` } as Member;
  }

  const { data: existing } = await supabase
    .from('members')
    .select('id')
    .eq('email', member.email)
    .maybeSingle();

  const dbPayload: any = {
    tenant_id: CURRENT_TENANT_ID,
    name: member.name,
    email: member.email,
    mobile_number: member.mobileNumber,
    membership_type: member.membershipType,
    plan_category: member.planCategory,
    status: member.status || 'ACTIVE',
    join_date: member.joinDate,
    next_due_date: member.nextDueDate,
    weight: member.weight,
    height: member.height,
    age: member.age,
    photo_url: member.photoUrl,
    notes: member.notes,
  };

  if (member.password) {
    dbPayload.password = member.password;
  }

  let resultData;
  
  try {
      if (existing) {
        let { data, error } = await supabase
            .from('members')
            .update(dbPayload)
            .eq('id', existing.id)
            .select()
            .single();
        
        if (error) {
            if (error.code === '42703' || (error.message && error.message.includes('password'))) {
                console.warn("Schema mismatch: Retrying update without password field.");
                delete dbPayload.password;
                const retry = await supabase
                    .from('members')
                    .update(dbPayload)
                    .eq('id', existing.id)
                    .select()
                    .single();
                if (retry.error) throw retry.error;
                data = retry.data;
            } else {
                throw error;
            }
        }
        resultData = data;
      } else {
        let { data, error } = await supabase
            .from('members')
            .insert([dbPayload])
            .select()
            .single();

        if (error) {
            if (error.code === '42703' || (error.message && error.message.includes('password'))) {
                console.warn("Schema mismatch: Retrying insert without password field.");
                delete dbPayload.password;
                const retry = await supabase
                    .from('members')
                    .insert([dbPayload])
                    .select()
                    .single();
                if (retry.error) throw retry.error;
                data = retry.data;
            } else {
                throw error;
            }
        }
        resultData = data;
      }
  } catch (err) {
      console.error("Error creating/updating member:", err);
      return null;
  }

  return mapSupabaseToMember(resultData);
};

export const bulkCreateMembers = async (members: any[]): Promise<boolean> => {
    if (!supabase) return false;

    const payload = members.map(m => ({
        tenant_id: CURRENT_TENANT_ID,
        name: m.name,
        email: m.email,
        mobile_number: m.mobileNumber,
        membership_type: MembershipType.MONTHLY,
        plan_category: PlanCategory.FULL_ACCESS,
        status: 'ACTIVE',
        join_date: new Date().toISOString(),
        next_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    const { error } = await supabase.from('members').insert(payload);
    
    if (error) {
        console.error("Bulk insert failed", error);
        throw error;
    }
    return true;
};

export const updateMember = async (member: Partial<Member>): Promise<Member | null> => {
  if (!supabase || !member.id) return null;

  const dbPayload = {
    name: member.name,
    email: member.email,
    mobile_number: member.mobileNumber,
    membership_type: member.membershipType,
    plan_category: member.planCategory,
    status: member.status,
    join_date: member.joinDate,
    next_due_date: member.nextDueDate,
    weight: member.weight,
    height: member.height,
    age: member.age,
    photo_url: member.photoUrl,
    notes: member.notes
  };

  const { data, error } = await supabase
    .from('members')
    .update(dbPayload)
    .eq('id', member.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating member:", error);
    throw error;
  }

  return mapSupabaseToMember(data);
};

export const deleteMember = async (id: string): Promise<boolean> => {
  if (!supabase) return false;

  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting member:", error);
    throw error;
  }

  return true;
};

// --- ATTENDANCE LOGIC ---

// Check In Member to Database
export const checkInMember = async (memberId: string): Promise<{ success: boolean; id?: string; error?: string }> => {
    if (!supabase) return { success: false, error: "Database not connected" };

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const payload = {
        member_id: memberId,
        tenant_id: CURRENT_TENANT_ID,
        check_in_time: now.toISOString(),
        date: todayStr
    };

    try {
        const { data, error } = await supabase
            .from('attendance')
            .insert([payload])
            .select()
            .single();

        if (error) {
            // Graceful handling if table doesn't exist yet
            if (error.code === '42P01' || error.message.includes('Could not find the table')) {
                console.warn("Attendance table missing. Returning mock success.");
                return { success: true, id: 'mock-attendance-' + Date.now() };
            }
             // Graceful handling for UUID syntax error (legacy mock data users)
             if (error.code === '22P02') {
                 console.warn("Invalid UUID for check-in (likely mock user). Falling back to mock success.");
                 return { success: true, id: 'mock-attendance-' + Date.now() };
             }
            throw error;
        }

        // Also update the member's 'last_check_in' field
        const { error: memberError } = await supabase.from('members').update({ last_check_in: now.toISOString() }).eq('id', memberId);
        if (memberError && (memberError.code === '42P01' || memberError.message.includes('Could not find the table'))) {
             console.warn("Members table update skipped (table missing/schema mismatch)");
        }

        return { success: true, id: data.id };
    } catch (e: any) {
        console.error("Check-in failed:", e);
        return { success: false, error: getSafeErrorMessage(e) };
    }
};

// Check Out Member in Database
export const checkOutMember = async (attendanceId: string): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) return { success: false, error: "Database disconnected" };
    
    if (attendanceId.startsWith('mock-')) return { success: true }; // Handle mock session

    try {
        const { error, count } = await supabase
            .from('attendance')
            .update({ check_out_time: new Date().toISOString() })
            .eq('id', attendanceId)
            .select('*', { count: 'exact' }); // Request count to see if row was actually updated
        
        if (error) {
             console.warn("Supabase Checkout Error:", error);
             if (error.code === '42P01' || error.message.includes('Could not find the table')) return { success: true };
             return { success: false, error: error.message }; 
        }

        // If count is 0, it means no row was found (ID mismatch) or RLS policy hid the row from update
        if (count === 0) {
             console.warn("Checkout failed: No row updated. Check permissions or ID.");
             return { success: false, error: "Session not found or permission denied" };
        }
        
        return { success: true };
    } catch (e: any) {
        console.error("Check-out exception:", e);
        return { success: false, error: getSafeErrorMessage(e) };
    }
};

// Get Active Session (Checked In but not Checked Out)
export const getActiveCheckIn = async (memberId: string): Promise<AttendanceLog | null> => {
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('member_id', memberId)
            .is('check_out_time', null) // Still open
            .order('check_in_time', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
             if (error.code === '42P01' || error.message.includes('Could not find the table')) return null; 
             // Graceful handling for UUID syntax error
             if (error.code === '22P02') return null;
             throw error;
        }

        if (data) {
            return {
                id: data.id,
                memberId: data.member_id,
                checkInTime: data.check_in_time,
                date: data.date
            };
        }
    } catch (e) {
        console.error("Error fetching active session:", e);
    }
    return null;
};

// Get Member History
export const getMemberHistory = async (memberId: string): Promise<AttendanceLog[]> => {
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('member_id', memberId)
            .not('check_out_time', 'is', null) // Only completed sessions usually, or all
            .order('check_in_time', { ascending: false })
            .limit(20);

        if (error) {
            if (error.code === '42P01' || error.message.includes('Could not find the table')) return []; 
            if (error.code === '22P02') return [];
            throw error;
        }

        return data.map((d: any) => ({
            id: d.id,
            memberId: d.member_id,
            checkInTime: d.check_in_time,
            checkOutTime: d.check_out_time,
            date: d.date
        }));
    } catch (e) {
        console.error("Error fetching history:", e);
        return [];
    }
};

// Get Aggregated Stats (Replaces Mock Data)
export const getAttendanceStats = async (): Promise<AttendanceRecord[]> => {
    if (!supabase) return MOCK_ATTENDANCE_STATS;

    try {
        // Fetch last 7 days of data
        const { data, error } = await supabase
            .from('attendance')
            .select('date')
            .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        if (error) {
             if (error.code === '42P01' || error.message.includes('Could not find the table')) return MOCK_ATTENDANCE_STATS;
             throw error;
        }

        // Aggregate in memory (simple for small datasets)
        const counts: Record<string, number> = {};
        data.forEach((row: any) => {
            counts[row.date] = (counts[row.date] || 0) + 1;
        });

        // Convert to array format expected by Recharts
        const stats: AttendanceRecord[] = Object.keys(counts).map(date => ({
            date,
            count: counts[date]
        })).sort((a, b) => a.date.localeCompare(b.date));

        if (stats.length === 0) return MOCK_ATTENDANCE_STATS; // Return mock if no real data yet
        return stats;
    } catch (e) {
        console.error("Error fetching stats:", e);
        return MOCK_ATTENDANCE_STATS;
    }
};

export const getPayments = () => Promise.resolve(MOCK_PAYMENTS);
export const getHourlyTraffic = () => Promise.resolve(MOCK_HOURLY_TRAFFIC);
