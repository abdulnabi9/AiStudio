import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import MembersList from './components/MembersList';
import MemberPortal from './components/MemberPortal';
import Settings from './components/Settings';
import { User, UserRole, Member } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | undefined>(undefined);

  // Check for persisted session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('gymForceUser');
    const storedMember = localStorage.getItem('gymForceMember');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedMember) {
        setCurrentMember(JSON.parse(storedMember));
    }
  }, []);

  const handleLogin = (loggedInUser: User, loggedInMember?: Member) => {
    setUser(loggedInUser);
    localStorage.setItem('gymForceUser', JSON.stringify(loggedInUser));
    
    if (loggedInMember) {
        setCurrentMember(loggedInMember);
        localStorage.setItem('gymForceMember', JSON.stringify(loggedInMember));
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentMember(undefined);
    localStorage.removeItem('gymForceUser');
    localStorage.removeItem('gymForceMember');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const isAdmin = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.GYM_ADMIN;

  return (
    <HashRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          {isAdmin ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/members" element={<MembersList />} />
              <Route path="/payments" element={<div className="p-8 text-center text-slate-500">Payments Module (Coming Soon)</div>} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<MemberPortal member={currentMember} />} />
              <Route path="/history" element={<div className="p-8 text-center text-slate-500">Attendance History (Coming Soon)</div>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;