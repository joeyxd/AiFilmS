import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

// Layouts
import MainLayout from './layouts/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Main Pages
import Dashboard from './pages/dashboard/Dashboard';
import ProjectList from './pages/projects/ProjectList';
import ProjectDetail from './pages/projects/ProjectDetail';
import Editor from './pages/editor/Editor';
import Settings from './pages/settings/Settings';
import MediaLibrary from './pages/media/MediaLibrary';

// Auth context and hooks
import { useAppDispatch, useAppSelector } from './hooks/reduxHooks';
import { checkSession } from './store/slices/authSlice';

const App = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check session on app init
  useEffect(() => {
    const initializeAuth = async () => {
      await dispatch(checkSession());
      setIsInitialized(true);
    };

    initializeAuth();
  }, [dispatch]);

  // Show loading indicator while checking auth
  if (isLoading || !isInitialized) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/" /> : <ForgotPassword />} />

      {/* Protected routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={!user ? <Navigate to="/login" /> : <Dashboard />} />
        <Route path="/projects" element={!user ? <Navigate to="/login" /> : <ProjectList />} />
        <Route path="/projects/:id" element={!user ? <Navigate to="/login" /> : <ProjectDetail />} />
        <Route path="/editor/:id" element={!user ? <Navigate to="/login" /> : <Editor />} />
        <Route path="/media" element={!user ? <Navigate to="/login" /> : <MediaLibrary />} />
        <Route path="/settings" element={!user ? <Navigate to="/login" /> : <Settings />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
    </Routes>
  );
};

export default App;
