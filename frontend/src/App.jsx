import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import DocumentDetails from './pages/DocumentDetails';
import UploadDocument from './pages/UploadDocument';
import Search from './pages/Search';
import History from './pages/History';
import Profile from './pages/Profile';
import AdminManagement from './pages/AdminManagement';
import DocumentDates from './pages/DocumentDates';

const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return children;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '250px', display: 'flex', flexDirection: 'column', minWidth: 0, width: 'calc(100% - 250px)', maxWidth: 'calc(100vw - 250px)', overflowX: 'hidden' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '24px', backgroundColor: 'var(--bg-primary)', minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/documents" element={<AppLayout><Documents /></AppLayout>} />
        <Route path="/documents/:id" element={<AppLayout><DocumentDetails /></AppLayout>} />
        <Route path="/upload" element={<AppLayout><UploadDocument /></AppLayout>} />
        <Route path="/search" element={<AppLayout><Search /></AppLayout>} />
        <Route path="/history" element={<AppLayout><History /></AppLayout>} />
        <Route path="/dates" element={<AppLayout><DocumentDates /></AppLayout>} />
        <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
        
        <Route element={<ProtectedRoute adminOnly={true} />}>
          <Route path="/admin" element={<AppLayout><AdminManagement /></AppLayout>} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
