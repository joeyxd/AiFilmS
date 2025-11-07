import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Star, Zap, BarChart3, Users } from 'lucide-react'

const ProDashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Projects Created</p>
                <p className="text-2xl font-bold text-gray-900">47</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Views Generated</p>
                <p className="text-2xl font-bold text-gray-900">12.4K</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Collaborators</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Advanced Tools</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">Access professional-grade tools and templates.</p>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                Explore Tools
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Analytics Dashboard</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">Track performance with detailed analytics.</p>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                View Analytics
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Collaboration Features</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">Work seamlessly with your team members.</p>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                Manage Team
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Priority Support</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">Get faster support response times.</p>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                Contact Support
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
              <span className="ml-2 text-yellow-600 font-medium">Pro</span>
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

export default ProDashboard
