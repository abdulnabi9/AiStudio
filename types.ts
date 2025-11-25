
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  GYM_ADMIN = 'GYM_ADMIN',
  MEMBER = 'MEMBER'
}

export enum MembershipType {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUAL = 'ANNUAL'
}

export enum PlanCategory {
  CARDIO = 'CARDIO',
  STRENGTH = 'STRENGTH',
  FULL_ACCESS = 'FULL_ACCESS'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  avatarUrl?: string;
}

export interface Member {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  mobileNumber: string;
  joinDate: string;
  membershipType: MembershipType;
  planCategory: PlanCategory;
  nextDueDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'OVERDUE';
  lastCheckIn?: string;
  weight?: number;
  height?: number;
  notes?: string;
  age?: number;
  photoUrl?: string;
}

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  method: 'CREDIT_CARD' | 'CASH' | 'UPI';
  status: 'PAID' | 'PENDING' | 'FAILED';
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface AttendanceLog {
  id: string;
  memberId: string;
  checkInTime: string;
  checkOutTime?: string;
  date: string;
}
