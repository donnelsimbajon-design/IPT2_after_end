import React from 'react';
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Layout from './Layout';
import { ThemeProvider } from './ThemeContext';

import Login from './login';
import Dashboard from './Dashboard';
import Students from './Students';
import Faculty from './Faculty';
import Reports from './Reports';
import Settings from './Settings';
import Archive from './Archive';
import AccountSettings from './AccountSettings';

export default function Routers() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
          <Route path="/" element={<Login />} />
          
          {/* Protected Routes with Layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/students" element={
            <ProtectedRoute>
              <Layout><Students /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/faculty" element={
            <ProtectedRoute>
              <Layout><Faculty /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute>
              <Layout><Reports /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout><Settings /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/archives" element={
            <ProtectedRoute>
              <Layout><Archive /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/account" element={
            <ProtectedRoute>
              <Layout><AccountSettings /></Layout>
            </ProtectedRoute>
          } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

if(document.getElementById("root")) {
  console.log('React mounting Routers into #root');
  ReactDOM.render(<Routers />, document.getElementById("root"));
}