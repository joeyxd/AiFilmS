import React, { useState, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { 
  Film, Users, FileText, Video, Clapperboard, 
  Crown, BarChart3, Shield, Settings,
  Heart, Palette
} from 'lucide-react'
import StoryPortfolioPage from '../StoryPortfolioPage'
import AgentSettingsModal from '../AgentSettingsModal'
import ImageGenerationTab from '../ImageGenerationTab'
import AuracleLogo from '../AuracleLogo'
import './animated-dashboard.css'

interface DashboardPage {
  id: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  content?: React.ReactNode
  bgColor: string
  minTier: 'free' | 'pro' | 'enterprise' | 'admin'
}

const RoleBasedAnimatedDashboard: React.FC = () => {
  const { user, profile, loading, signOut, dashboardType } = useAuth()
  const [activePage, setActivePage] = useState(0)
  const [showAgentSettings, setShowAgentSettings] = useState(false)

  // Define all possible dashboard pages with role requirements - function to include activePage
  const getAllDashboardPages = (): DashboardPage[] => [
    {
      id: "projects",
      icon: Film,
      title: "Projects",
      content: <StoryPortfolioPage isActive={activePage === 0} />,
      bgColor: "bg-black",
      minTier: "free"
    },
    {
      id: "stories",
      icon: Users,
      title: "Stories",
      content: (
        <div className="hint">
          <span>Develop chapters and characters</span>
          <br />
          <span className="text-blue-400">for your different narratives</span>
        </div>
      ),
      bgColor: "bg-blue-600",
      minTier: "free"
    },
    {
      id: "scripts",
      icon: FileText,
      title: "Scripts",
      content: (
        <div className="hint">
          <span>Write scripts and prompts</span>
          <br />
          <span className="text-green-400">for each chapter and story</span>
        </div>
      ),
      bgColor: "bg-green-600",
      minTier: "free"
    },
    {
      id: "media",
      icon: Video,
      title: "Media",
      content: (
        <div className="hint">
          <span>View generated images and videos</span>
          <br />
          <span className="text-purple-400">Edit and refine your content</span>
        </div>
      ),
      bgColor: "bg-purple-600",
      minTier: "free"
    },
    {
      id: "studio",
      icon: Clapperboard,
      title: "Studio",
      content: (
        <div className="hint">
          <span>Advanced editing tools</span>
          <br />
          <span className="text-red-400">and production features</span>
        </div>
      ),
      bgColor: "bg-red-600",
      minTier: "free"
    },
    {
      id: "analytics",
      icon: BarChart3,
      title: "Analytics",
      content: (
        <div className="hint">
          <span>Track performance metrics</span>
          <br />
          <span className="text-indigo-400">and audience insights</span>
        </div>
      ),
      bgColor: "bg-indigo-600",
      minTier: "enterprise"
    },
    {
      id: "image-generation",
      icon: Palette,
      title: "AI Images",
      content: <ImageGenerationTab isActive={activePage === 6} />,
      bgColor: "bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600",
      minTier: "free"
    },
    {
      id: "settings",
      icon: Settings,
      title: "Settings",
      content: (
        <div className="hint">
          <span>Configure AI agents</span>
          <br />
          <span className="text-gray-300">and customize workflows</span>
          <button
            onClick={() => setShowAgentSettings(true)}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Edit Agents
          </button>
        </div>
      ),
      bgColor: "bg-gray-600",
      minTier: "free"
    },
    {
      id: "admin",
      icon: Crown,
      title: "Admin",
      content: (
        <div className="hint">
          <span>System administration</span>
          <br />
          <span className="text-amber-400">and user management</span>
        </div>
      ),
      bgColor: "bg-amber-600",
      minTier: "admin"
    }
  ]

  // Filter pages based on user's dashboard type
  const availablePages = useMemo(() => {
    const allDashboardPages = getAllDashboardPages()
    const tierHierarchy = { 'free': 0, 'pro': 1, 'enterprise': 2, 'admin': 3 }
    const userTierLevel = tierHierarchy[dashboardType]
    
    return allDashboardPages.filter(page => {
      const pageTierLevel = tierHierarchy[page.minTier]
      return userTierLevel >= pageTierLevel
    })
  }, [dashboardType, activePage])

  // Custom Role Icon Component
  const RoleIconComponent = ({ tier, className }: { tier: string; className?: string }) => {
    if (tier === 'pro') {
      return (
        <div className="w-5 h-5 flex items-center justify-center">
          <AuracleLogo size="small" />
        </div>
      )
    }
    
    const roleIcons = {
      'free': Heart,
      'enterprise': Crown,
      'admin': Shield
    }
    
    const IconComponent = roleIcons[tier as keyof typeof roleIcons] || Heart
    return <IconComponent className={className} />
  }

  // Get user display info
  const getUserDisplayInfo = () => {
    const roleColors = {
      'free': 'text-pink-500',
      'pro': 'text-yellow-500',
      'enterprise': 'text-purple-500',
      'admin': 'text-red-500'
    }

    return {
      color: roleColors[dashboardType],
      background: 'bg-black', // ALWAYS BLACK - NO ROLE-BASED BACKGROUND
      tier: dashboardType.charAt(0).toUpperCase() + dashboardType.slice(1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your creative studio...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const userInfo = getUserDisplayInfo()

  return (
    <div className={`dashboard-container ${userInfo.background}`} style={{ backgroundColor: '#000000' }}>
      {/* Header with user info and logout - only show on home/showcase page */}
      {activePage === 0 && (
        <div className="absolute top-4 right-4 z-[2] flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2">
          <RoleIconComponent tier={dashboardType} className={`w-5 h-5 ${userInfo.color}`} />
          <span className="text-white text-sm font-medium">
            {profile?.username} • {userInfo.tier}
          </span>
        </div>
        <button
          onClick={signOut}
          className="bg-red-600/80 backdrop-blur-sm hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          Sign Out
        </button>
      </div>
      )}

      {/* Navigation Menu */}
      <ul className="dashboard-menu">
        {availablePages.map((page, index) => {
          const IconComponent = page.icon
          return (
            <li key={page.id}>
              <button
                onClick={() => setActivePage(index)}
                className={`dashboard-menu-icon ${activePage === index ? "active" : ""}`}
                aria-label={`Navigate to ${page.title}`}
                title={page.title}
              >
                <IconComponent className="w-8 h-8" />
              </button>
            </li>
          )
        })}
      </ul>

      {/* Pages */}
      {availablePages.map((page, index) => {
        const IconComponent = page.icon
        return (
          <div
            key={page.id}
            className={`dashboard-page ${page.bgColor} ${
              index === 0 ? "page-home" : "page-secondary"
            } ${activePage === index ? "page-active" : ""}`}
          >
            {page.id === "projects" ? (
              // Full-screen portfolio showcase for projects
              <div className="w-full h-full relative">
                {page.content}
              </div>
            ) : page.id === "image-generation" ? (
              // Full-screen image generation interface
              <div className="w-full h-full relative overflow-auto">
                {page.content}
              </div>
            ) : (
              // Standard content layout for other pages
              <section className="dashboard-content">
                <IconComponent className="dashboard-page-icon" />
                <span className="dashboard-title">{page.title}</span>
                {page.content}
                
                {/* Add tier-specific features hint */}
                {page.minTier !== 'free' && (
                  <div className="mt-4 text-xs text-white/60">
                    {page.minTier === 'pro' && '✨ Pro Feature'}
                    {page.minTier === 'enterprise' && '🏢 Enterprise Feature'}
                    {page.minTier === 'admin' && '👑 Admin Only'}
                  </div>
                )}
              </section>
            )}
          </div>
        )
      })}

      {/* Central Auracle Logo for home page */}
      {activePage === 0 && (
        <div className="absolute top-8 left-8 z-[1]">
          <div className="text-left">
            <AuracleLogo size="large" />
            <div className="mt-2 text-white/70 text-xs font-light tracking-wider max-w-xs">
              AI-Powered Cinematic Storytelling
            </div>
          </div>
        </div>
      )}

      {/* Welcome message for first-time users */}
      {activePage === 0 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center z-[1]">
          <p className="text-white/80 text-sm">
            Welcome to Auracle Film Studio, {profile?.username}!
          </p>
          <p className="text-white/60 text-xs mt-1">
            Click the icons on the left to explore your creative tools
          </p>
        </div>
      )}

      {/* Agent Settings Modal */}
      {showAgentSettings && (
        <AgentSettingsModal 
          isOpen={showAgentSettings} 
          onClose={() => setShowAgentSettings(false)} 
        />
      )}
    </div>
  )
}

export default RoleBasedAnimatedDashboard
