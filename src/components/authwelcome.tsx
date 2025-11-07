import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"
import { useAuth } from "../context/AuthContext"

export default function WelcomePage() {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    // If not authenticated or still loading, redirect to login
    if (!loading && !user) {
      navigate("/login")
      return
    }

    // If authenticated, clean up registration data
    if (user) {
      // Clean up registration data since onboarding is complete
      localStorage.removeItem("registrationData")
      
      // Only auto-navigate if profile shows onboarding is completed
      if (profile?.onboarding_completed) {
        const timer = setTimeout(() => {
          navigate("/dashboard")
        }, 3000) // Increased to 3 seconds to reduce flickering

        return () => clearTimeout(timer)
      }
    }
  }, [navigate, user, loading, profile])

  const handleEnterApp = () => {
    navigate("/dashboard")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating dots */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-[#ff1493] rounded-full opacity-60"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
            y: (typeof window !== 'undefined' ? window.innerHeight : 600) + 50,
            opacity: 0,
          }}
          animate={{
            y: -50,
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 4,
            delay: i * 0.8,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 2,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Main welcome card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: [0.9, 1.02, 1],
        }}
        transition={{
          duration: 0.8,
          times: [0, 0.6, 1],
          ease: "easeOut",
        }}
        className="relative"
      >
        <motion.div
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="w-full max-w-lg mx-auto login-card-backdrop rounded-3xl p-12 shadow-[20px_20px_40px_rgba(209,217,230,1),-20px_-20px_40px_rgba(255,255,255,1)]"
        >
          <div className="flex flex-col items-center text-center">
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.6,
                type: "spring",
                stiffness: 200,
              }}
              className="w-20 h-20 rounded-full flex items-center justify-center mb-8 bg-[#f0f3fa] shadow-[inset_8px_8px_16px_#d1d9e6,inset_-8px_-8px_16px_#ffffff]"
            >
              <CheckCircle className="w-10 h-10 text-[#ff1493]" />
            </motion.div>

            {/* Welcome text */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-4xl font-bold text-gray-700 mb-4 font-mono"
            >
              Welcome aboard!
            </motion.h1>

            {/* Personalized message */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-gray-500 font-mono mb-8 text-lg"
            >
              Hey {user.email?.split("@")[0] || profile?.username}, you're all set to get started!
            </motion.p>

            {/* User selections summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="flex flex-wrap gap-2 justify-center mb-8"
            >
              {profile?.job_role && (
                <div className="px-4 py-2 bg-[#f0f3fa] rounded-full text-sm font-mono text-gray-600 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]">
                  {profile.job_role.replace("-", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </div>
              )}
              {profile?.company_type && (
                <div className="px-4 py-2 bg-[#f0f3fa] rounded-full text-sm font-mono text-gray-600 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]">
                  {profile.company_type}
                </div>
              )}
              {profile?.company_size && (
                <div className="px-4 py-2 bg-[#f0f3fa] rounded-full text-sm font-mono text-gray-600 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]">
                  {profile.company_size} people
                </div>
              )}
            </motion.div>

            {/* Enter app button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              onClick={handleEnterApp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-[#f0f3fa] rounded-2xl text-lg font-semibold shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center gap-2 font-mono text-[#ff1493]"
            >
              Enter App
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}