import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Heart, Play, Upload, Crown } from 'lucide-react'

const FreeDashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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

      {/* Main Content */}
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
          {/* Stats Cards */}
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

        {/* Free Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Basic Tools</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">Access basic editing tools and templates.</p>
              <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                Start Creating
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Community Support</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">Get help from our community forums.</p>
              <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                Join Community
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow opacity-60">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-500">Advanced Analytics</h3>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pro Only</span>
            </div>
            <div className="p-6">
              <p className="text-gray-400 mb-4">Detailed insights and performance tracking.</p>
              <button className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed">
                Upgrade Required
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow opacity-60">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-500">Team Collaboration</h3>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pro Only</span>
            </div>
            <div className="p-6">
              <p className="text-gray-400 mb-4">Collaborate with team members in real-time.</p>
              <button className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed">
                Upgrade Required
              </button>
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

export default FreeDashboard
