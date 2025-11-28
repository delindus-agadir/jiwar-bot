import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard'));
const ReferenceGuide = lazy(() => import('./components/ReferenceGuide'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const Login = lazy(() => import('./components/Login'));
const SignUp = lazy(() => import('./components/SignUp'));
const OAuthCallback = lazy(() => import('./components/OAuthCallback'));
const CompleteRegistration = lazy(() => import('./components/CompleteRegistration'));
const ActivityList = lazy(() => import('./components/ActivityList'));
const WelcomePage = lazy(() => import('./components/WelcomePage'));
const TelegramLogin = lazy(() => import('./components/TelegramLogin'));
const TelegramSignup = lazy(() => import('./components/TelegramSignup'));
const TelegramAuth = lazy(() => import('./components/TelegramAuth'));
const UserApproval = lazy(() => import('./components/UserApproval'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>جاري التحميل...</div>}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<WelcomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/oauth-callback" element={<OAuthCallback />} />
              <Route path="/complete-registration" element={<CompleteRegistration />} />
              <Route path="/telegram-login" element={<TelegramLogin />} />
              <Route path="/telegram-signup" element={<TelegramSignup />} />
              <Route path="/telegram-auth" element={<TelegramAuth />} />

              {/* Public route for activities - visitors can view */}
              <Route path="/activities" element={<ActivityList />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guide"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ReferenceGuide />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <UserProfile />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/approvals"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <UserApproval />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
