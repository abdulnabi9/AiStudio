import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, CreditCard, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import { Member, AttendanceRecord } from '../types';
import { getMembers, getAttendanceStats } from '../services/mockData';
import { generateGymInsights } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [insights, setInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    getMembers().then(setMembers);
    getAttendanceStats().then(setAttendance);
  }, []);

  const handleGenerateInsights = async () => {
    setLoadingInsights(true);
    const result = await generateGymInsights(members, attendance);
    setInsights(result);
    setLoadingInsights(false);
  };

  const activeMembers = members.filter(m => m.status === 'ACTIVE').length;
  const overdueMembers = members.filter(m => m.status === 'OVERDUE').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Members</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{members.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Monthly Revenue</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">$4,250</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-slate-400">
            <span>Updated 2 hours ago</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Members</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{activeMembers}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${(activeMembers / members.length) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Overdue Payments</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{overdueMembers}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600 cursor-pointer hover:underline">
            <span>View details &rarr;</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Weekly Attendance</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-32 h-32" />
          </div>
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <h2 className="text-lg font-semibold">Gemini AI Analyst</h2>
            </div>
            
            <div className="flex-grow">
              {insights ? (
                <div className="prose prose-invert prose-sm">
                  <div className="whitespace-pre-line">{insights}</div>
                </div>
              ) : (
                <p className="text-indigo-100 text-sm">
                  Generate actionable insights based on your current member demographics and attendance patterns using Gemini 2.5 Flash.
                </p>
              )}
            </div>

            <button
              onClick={handleGenerateInsights}
              disabled={loadingInsights}
              className="mt-6 w-full py-2 bg-white text-indigo-600 rounded-lg font-medium text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loadingInsights ? (
                <>Thinking...</>
              ) : (
                <>Generate Insights</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
