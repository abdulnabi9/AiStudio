import React, { useEffect, useState } from 'react';
import { Member } from '../types';
import { getMembers } from '../services/mockData';
import { Search, Plus, Filter, MoreVertical, Mail, Edit2 } from 'lucide-react';
import MemberForm from './MemberForm';
import MemberDetails from './MemberDetails';

const MembersList: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);

  useEffect(() => {
    // In a real app, this would be an API call. 
    // Since we're using mock data that doesn't persist to a real backend in this demo,
    // we only load it once. Subsequent updates happen in local state.
    getMembers().then(setMembers);
  }, []);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMember = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setViewingMember(null); // Close details if open
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleViewMember = (member: Member) => {
    setViewingMember(member);
  };

  const handleFormSubmit = (data: any) => {
    if (editingMember) {
      // Update existing member
      setMembers(prev => prev.map(m => m.id === editingMember.id ? { ...m, ...data } : m));
    } else {
      // Create new member
      const newMember: Member = {
        id: Math.random().toString(36).substr(2, 9),
        tenantId: 'tenant_123', // Hardcoded for demo
        status: 'ACTIVE',
        ...data
      };
      setMembers(prev => [newMember, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Members</h1>
          <p className="text-slate-500">Manage your gym members and subscriptions.</p>
        </div>
        <button 
          onClick={handleAddMember}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Member</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Plan</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Next Due</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Check-in</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredMembers.map((member) => (
                <tr 
                    key={member.id} 
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => handleViewMember(member)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img 
                          className="h-10 w-10 rounded-full bg-slate-200 object-cover" 
                          src={member.photoUrl || `https://ui-avatars.com/api/?name=${member.name}&background=random`} 
                          alt={member.name} 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{member.name}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                           <Mail className="w-3 h-3" /> {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{member.membershipType}</div>
                    <div className="text-xs text-slate-500">{member.planCategory}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                        member.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 
                        'bg-slate-100 text-slate-800'}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(member.nextDueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {member.lastCheckIn ? new Date(member.lastCheckIn).toLocaleDateString() + ' ' + new Date(member.lastCheckIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditMember(member);
                            }}
                            className="text-slate-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                            title="Edit Member"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={(e) => e.stopPropagation()} 
                            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No members found matching your search.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <MemberForm 
                initialData={editingMember}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsModalOpen(false)}
            />
        </div>
      )}

      {/* View Details Modal Overlay */}
      {viewingMember && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <MemberDetails 
                member={viewingMember}
                onClose={() => setViewingMember(null)}
                onEdit={handleEditMember}
            />
        </div>
      )}
    </div>
  );
};

export default MembersList;