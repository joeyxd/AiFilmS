import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { Crown, Building2, Star, Heart, Users, Zap, Play, Upload } from 'lucide-react'

const Dashboard: React.FC = () => {
  const { user, profile, loading, signOut } = useAuth()
  const [dashboardType, setDashboardType] = useState<string>('')

  useEffect(() => {
    if (profile) {
      // Determine dashboard type based on subscription tier and role
      // Check if user has admin privileges (you can customize this logic)
      if (profile.job_role === 'business-owner' && profile.subscription_tier === 'enterprise') {
        setDashboardType('admin')
      } else if (profile.subscription_tier === 'enterprise') {
        setDashboardType('enterprise')
      } else if (profile.subscription_tier === 'pro') {
        setDashboardType('pro')
      } else {
        setDashboardType('free')
      }
    }
  }, [profile])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Admin Dashboard
  if (dashboardType === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Crown className="h-8 w-8 text-purple-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Welcome, {profile?.username}</span>
                <button
                  onClick={signOut}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">2,847</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Enterprise Dashboard
  if (dashboardType === 'enterprise') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Enterprise Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Welcome, {profile?.username}</span>
                <button
                  onClick={signOut}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Team Members</p>
                  <p className="text-2xl font-bold text-gray-900">127</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Pro Dashboard
  if (dashboardType === 'pro') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-500 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Pro Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Welcome, {profile?.username}</span>
                <button
                  onClick={signOut}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Projects Created</p>
                  <p className="text-2xl font-bold text-gray-900">47</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Free Dashboard (default)
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-pink-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Welcome to FilmStudio</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {profile?.username}</span>
              <button
                onClick={signOut}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upgrade Banner */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Unlock Pro Features</h2>
              <p className="text-pink-100">Upgrade to access advanced tools, analytics, and unlimited projects.</p>
            </div>
            <button className="bg-white text-purple-600 px-6 py-2 rounded-md font-medium hover:bg-gray-100">
              Upgrade Now
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Play className="h-8 w-8 text-pink-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Projects Created</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-xs text-gray-400">of 5 free projects</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Upload className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900">1.2GB</p>
                <p className="text-xs text-gray-400">of 2GB free</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Account Type</p>
                <p className="text-2xl font-bold text-gray-900">Free</p>
                <p className="text-xs text-pink-500 cursor-pointer hover:underline">Upgrade to Pro</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">Username:</span>
              <span className="ml-2 text-gray-900">{profile?.username}</span>
            </div>
            <div>
              <span className="font-medium text-gray-500">Email:</span>
              <span className="ml-2 text-gray-900">{user?.email}</span>
            </div>
            <div>
              <span className="font-medium text-gray-500">Role:</span>
              <span className="ml-2 text-gray-900">{profile?.job_role}</span>
            </div>
            <div>
              <span className="font-medium text-gray-500">Subscription:</span>
              <span className="ml-2 text-pink-500 font-medium">Free</span>
            </div>
            <div>
              <span className="font-medium text-gray-500">Company:</span>
              <span className="ml-2 text-gray-900">{profile?.company_type}</span>
            </div>
            <div>
              <span className="font-medium text-gray-500">Team Size:</span>
              <span className="ml-2 text-gray-900">{profile?.company_size}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
