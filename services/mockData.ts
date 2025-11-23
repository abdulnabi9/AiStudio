import { Member, MembershipType, PlanCategory, Payment, User, UserRole, AttendanceRecord } from '../types';

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

// Mock Users
export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@gymforce.com',
    role: UserRole.GYM_ADMIN,
    tenantId: CURRENT_TENANT_ID,
    avatarUrl: 'https://picsum.photos/100/100'
  },
  {
    id: 'u2',
    name: 'John Doe',
    email: 'john@example.com',
    role: UserRole.MEMBER,
    tenantId: CURRENT_TENANT_ID,
    avatarUrl: 'https://picsum.photos/101/101'
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
  },
  {
    id: 'm3',
    tenantId: CURRENT_TENANT_ID,
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    mobileNumber: '555-0103',
    joinDate: '2023-09-01',
    membershipType: MembershipType.QUARTERLY,
    planCategory: PlanCategory.CARDIO,
    nextDueDate: '2023-12-01',
    status: 'ACTIVE',
    lastCheckIn: '2023-10-27T07:00:00',
    weight: 72
  },
  {
    id: 'm4',
    tenantId: CURRENT_TENANT_ID,
    name: 'Diana Prince',
    email: 'diana@example.com',
    mobileNumber: '555-0104',
    joinDate: '2023-10-05',
    membershipType: MembershipType.MONTHLY,
    planCategory: PlanCategory.FULL_ACCESS,
    nextDueDate: '2023-11-05',
    status: 'ACTIVE',
    lastCheckIn: '2023-10-27T09:45:00',
    weight: 60
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

// Mock Attendance Data for Chart
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

export const getMembers = () => Promise.resolve(MOCK_MEMBERS);
export const getPayments = () => Promise.resolve(MOCK_PAYMENTS);
export const getAttendanceStats = () => Promise.resolve(MOCK_ATTENDANCE_STATS);
export const getHourlyTraffic = () => Promise.resolve(MOCK_HOURLY_TRAFFIC);