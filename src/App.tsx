import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import Progress from './pages/Progress';
import Levels from './pages/Levels';
import Games from './pages/Games';
import TestSetup from './pages/TestSetup';
import TypingTest from './pages/TypingTest';
import TestResult from './pages/TestResult';
import { useAppStore } from './store/useAppStore';
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useAppStore(state => state.currentUser);
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
function App() {
  const currentUser = useAppStore(state => state.currentUser);
  const navigate = useNavigate();
  // If user is logged in and is on root, redirect to dashboard.
  useEffect(() => {
    // Determine if we are at the root level (empty hash or just #/)
    const currentHash = window.location.hash;
    if (!currentHash || currentHash === '#/' || currentHash === '#') {
      if (currentUser) {
         navigate('/dashboard', { replace: true });
      } else {
         navigate('/login', { replace: true });
      }
    }
  }, [currentUser, navigate]);
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route path="login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="levels/:pathId" element={
          <ProtectedRoute>
            <Levels />
          </ProtectedRoute>
        } />
        
        <Route path="games" element={
          <ProtectedRoute>
            <Games />
          </ProtectedRoute>
        } />
        
        <Route path="progress" element={
          <ProtectedRoute>
            <Progress />
          </ProtectedRoute>
        } />
        
        <Route path="practice/:pathId/:levelId" element={
          <ProtectedRoute>
             <Practice />
          </ProtectedRoute>
        } />
        
        <Route path="test/setup" element={
          <ProtectedRoute>
             <TestSetup />
          </ProtectedRoute>
        } />

        <Route path="test/run" element={
          <ProtectedRoute>
             <TypingTest />
          </ProtectedRoute>
        } />

        <Route path="test/result" element={
          <ProtectedRoute>
             <TestResult />
          </ProtectedRoute>
        } />
        
        <Route path="practice/:pathId" element={
          <ProtectedRoute>
            <Practice />
          </ProtectedRoute>
        } />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} />
      </Route>
    </Routes>
  );
}
export default App;