import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';

// Components
import LoginCard from './components/login';
import RegisterCard from './components/register';
import OnboardingPage from './components/authonboarding';
import JobRolePage from './components/authjobrole';
import CompanyInfoPage from './components/authcompanyinfo';
import WelcomePage from './components/authwelcome';
import EmailConfirmation from './components/EmailConfirmation';
import AuthConfirm from './components/AuthConfirm';
import LoadingScreen from './components/LoadingScreen';

// Main Pages
import RoleBasedAnimatedDashboard from './components/Dashboard/RoleBasedAnimatedDashboard';
import PortfolioShowcase from './components/portafolio-showcase';
import AIDebugPanel from './components/ai/AIDebugPanel';

// Auth context
import { AuthProvider, useAuth } from './context/AuthContext';

// App component wrapped with AuthProvider
const AppContent = () => {
  const { user, loading, profile } = useAuth();

  console.log('=== CLEAN APP DEBUG ===', { 
    user: !!user, 
    loading, 
    profile: !!profile, 
    onboardingCompleted: profile?.onboarding_completed,
    userEmail: user?.email,
    profileData: profile // Show full profile to see onboarding status
  });

  // Show loading indicator while checking auth
  if (loading) {
    return (
      <LoadingScreen 
        message="Initializing Auracle Film Studio..."
        subMessage="Setting up your creative workspace"
      />
    );
  }

  // Simple, clear routing logic
  const isAuthenticated = !!user;
  const hasProfile = !!profile;
  const onboardingComplete = hasProfile && profile.onboarding_completed;
  
  // If user is authenticated but profile is still loading, show loading state
  const isProfileLoading = isAuthenticated && !hasProfile && !loading;

  // Login page component
  const LoginPage = () => (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <LoginCard />
    </div>
  );

  // Register page component
  const RegisterPage = () => (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <RegisterCard />
    </div>
  );

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} 
      />
      
      {/* Onboarding routes */}
      <Route 
        path="/onboarding" 
        element={
          !isAuthenticated ? <Navigate to="/login" replace /> :
          onboardingComplete ? <Navigate to="/dashboard" replace /> : 
          <OnboardingPage />
        } 
      />
      <Route 
        path="/job-role" 
        element={
          !isAuthenticated ? <Navigate to="/login" replace /> :
          onboardingComplete ? <Navigate to="/dashboard" replace /> : 
          <JobRolePage />
        } 
      />
      <Route 
        path="/company-info" 
        element={
          !isAuthenticated ? <Navigate to="/login" replace /> :
          onboardingComplete ? <Navigate to="/dashboard" replace /> : 
          <CompanyInfoPage />
        } 
      />
      <Route 
        path="/welcome" 
        element={
          !isAuthenticated ? <Navigate to="/login" replace /> :
          onboardingComplete ? <Navigate to="/dashboard" replace /> : 
          <WelcomePage />
        } 
      />
      
      {/* Special auth routes */}
      <Route path="/email-confirmation" element={<EmailConfirmation />} />
      <Route path="/auth/confirm" element={<AuthConfirm />} />

      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          !isAuthenticated ? <Navigate to="/login" replace /> : 
          isProfileLoading ? (
            <LoadingScreen 
              message="Loading your profile..."
              subMessage="Preparing your personalized experience"
            />
          ) :
          !onboardingComplete ? <Navigate to="/onboarding" replace /> :
          <RoleBasedAnimatedDashboard />
        } 
      />
      
      {/* Test route for portfolio showcase */}
      <Route 
        path="/portfolio-test" 
        element={<PortfolioShowcase />} 
      />
      
      {/* AI Debug Panel for viewing analysis results */}
      <Route 
        path="/ai-debug" 
        element={
          !isAuthenticated ? <Navigate to="/login" replace /> : 
          <AIDebugPanel />
        } 
      />
      
      {/* Other protected routes with layout */}
      <Route element={<MainLayout />}>
        {/* Add other protected routes here if needed */}
      </Route>

      {/* Root route */}
      <Route 
        path="/" 
        element={
          !isAuthenticated ? <Navigate to="/login" replace /> : 
          !onboardingComplete ? <Navigate to="/onboarding" replace /> :
          <Navigate to="/dashboard" replace />
        } 
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App component with AuthProvider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
