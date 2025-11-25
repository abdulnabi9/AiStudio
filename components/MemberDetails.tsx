import React from 'react';
import { Member } from '../types';
import { X, Mail, Phone, Calendar, Dumbbell, Edit2, Trash2 } from 'lucide-react';

interface MemberDetailsProps {
  member: Member;
  onClose: () => void;
  onEdit: (member: Member) => void;
  onDelete: () => void;
}

const MemberDetails: React.FC<MemberDetailsProps> = ({ member, onClose, onEdit, onDelete }) => {
  // Helper for health status (reusing logic for consistency)
  const getHealthStatus = () => {
    if (!member.weight || !member.height) return null;
    const h = member.height / 100;
    const bmi = member.weight / (h * h);
    let status = '';
    let color = '';

    if (bmi < 18.5) { status = 'Underweight'; color = 'text-amber-700 bg-amber-50 border-amber-200'; }
    else if (bmi < 25) { status = 'Healthy'; color = 'text-emerald-700 bg-emerald-50 border-emerald-200'; }
    else if (bmi < 30) { status = 'Overweight'; color = 'text-orange-700 bg-orange-50 border-orange-200'; }
    else { status = 'Obese'; color = 'text-red-700 bg-red-50 border-red-200'; }

    return { bmi: bmi.toFixed(1), status, color };
  };

  const health = getHealthStatus();

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-lg flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
       {/* Header with cover-like background */}
       <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
       </div>

       <div className="px-6 pb-6 -mt-12 flex flex-col flex-1 overflow-hidden">
          {/* Profile Header */}
          <div className="flex justify-between items-end mb-6">
             <div className="relative">
                <img
                  src={member.photoUrl || `https://ui-avatars.com/api/?name=${member.name}&background=random`}
                  alt={member.name}
                  className="w-24 h-24 rounded-xl border-4 border-white shadow-md object-cover bg-white"
                />
             </div>
             <div className="mb-1 flex gap-2">
                <button
                  onClick={() => onEdit(member)}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </button>
             </div>
          </div>

          <div className="overflow-y-auto pr-2 space-y-6 custom-scrollbar">
             {/* Basic Info */}
             <div>
                <h2 className="text-2xl font-bold text-slate-900">{member.name}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      member.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-800'
                  }`}>
                      {member.status}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                    {member.membershipType}
                  </span>
                </div>
             </div>

             {/* Contact Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                   <div className="p-2 bg-white rounded-md shadow-sm mr-3">
                      <Mail className="w-4 h-4 text-slate-500" />
                   </div>
                   <div className="overflow-hidden">
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="text-sm font-medium text-slate-900 truncate" title={member.email}>{member.email}</p>
                   </div>
                </div>
                <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                   <div className="p-2 bg-white rounded-md shadow-sm mr-3">
                      <Phone className="w-4 h-4 text-slate-500" />
                   </div>
                   <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="text-sm font-medium text-slate-900">{member.mobileNumber}</p>
                   </div>
                </div>
             </div>

             {/* Stats Grid */}
             <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                    <Dumbbell className="w-4 h-4 mr-2 text-blue-600" />
                    Physical Stats & Health
                </h3>
                <div className="grid grid-cols-3 gap-3">
                   <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Height</p>
                      <p className="font-semibold text-slate-900">{member.height ? `${member.height} cm` : '-'}</p>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Weight</p>
                      <p className="font-semibold text-slate-900">{member.weight ? `${member.weight} kg` : '-'}</p>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Age</p>
                      <p className="font-semibold text-slate-900">{member.age || '-'}</p>
                   </div>
                </div>
                {health && (
                    <div className={`mt-3 p-3 rounded-lg border flex justify-between items-center ${health.color}`}>
                        <div className="flex flex-col">
                            <span className="text-xs uppercase tracking-wider opacity-80">Health Status</span>
                            <span className="text-sm font-bold">{health.status}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs uppercase tracking-wider opacity-80">BMI</span>
                            <span className="block text-lg font-bold leading-none">{health.bmi}</span>
                        </div>
                    </div>
                )}
             </div>

             {/* Membership Dates */}
             <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                    Membership Details
                </h3>
                <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
                    <div className="p-3 flex justify-between text-sm">
                        <span className="text-slate-500">Plan Category</span>
                        <span className="font-medium text-slate-900">{member.planCategory.replace('_', ' ')}</span>
                    </div>
                    <div className="p-3 flex justify-between text-sm">
                        <span className="text-slate-500">Join Date</span>
                        <span className="font-medium text-slate-900">{new Date(member.joinDate).toLocaleDateString()}</span>
                    </div>
                    <div className="p-3 flex justify-between text-sm">
                        <span className="text-slate-500">Next Due Date</span>
                        <span className={`font-medium ${member.status === 'OVERDUE' ? 'text-red-600' : 'text-slate-900'}`}>
                            {new Date(member.nextDueDate).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="p-3 flex justify-between text-sm">
                        <span className="text-slate-500">Last Check-in</span>
                        <span className="font-medium text-slate-900">
                            {member.lastCheckIn ? new Date(member.lastCheckIn).toLocaleDateString() + ' ' + new Date(member.lastCheckIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never'}
                        </span>
                    </div>
                </div>
             </div>
             
             {member.notes && (
                 <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Notes</h3>
                    <p className="text-sm text-slate-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100 italic">
                        "{member.notes}"
                    </p>
                 </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default MemberDetails;