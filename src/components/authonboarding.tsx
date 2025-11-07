import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckCircle, ArrowRight, LogOut } from "lucide-react"
import BackgroundSlideshow from "./BackgroundSlideshow"
import { useAuth } from "../context/AuthContext"

interface RegistrationData {
  username: string
  email: string
  password: string
  registrationTime: string
}

export default function OnboardingPage() {
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null)
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate("/login", { replace: true })
  }

  useEffect(() => {
    // If user has already completed onboarding, redirect to dashboard
    if (profile?.onboarding_completed) {
      navigate("/dashboard", { replace: true })
      return
    }

    // Check if we have registration data from the registration form
    const data = localStorage.getItem("registrationData")
    if (!data) {
      // If no registration data and not logged in, go to register
      if (!user) {
        navigate("/register", { replace: true })
        return
      }
      // If logged in but no registration data, this might be an existing user
      // Just show the onboarding page anyway
    } else {
      const parsedData = JSON.parse(data)
      setRegistrationData(parsedData)
    }

    // Auto-navigate to job role selection after 2 seconds only if we have registration data
    if (data) {
      const timer = setTimeout(() => {
        navigate("/job-role")
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [navigate, user, profile])

  const handleContinue = () => {
    // Navigate to job role selection
    navigate("/job-role")
  }

  // Show loading if we're still checking
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  // Use user email as fallback if no registration data
  const displayEmail = registrationData?.email || user?.email || "User"

  return (
    <>
      <BackgroundSlideshow />
      <div className="relative min-h-screen flex items-center justify-center p-4 z-10">
        {/* Sign Out Button - Top Right */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={handleSignOut}
          className="absolute top-6 right-6 p-3 bg-[#f0f3fa] rounded-xl shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all duration-200 text-gray-600 hover:text-[#ff1493]"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto login-card-backdrop rounded-3xl p-8 shadow-[20px_20px_40px_rgba(209,217,230,1),-20px_-20px_40px_rgba(255,255,255,1)]"
        >
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-[#f0f3fa] shadow-[inset_8px_8px_16px_#d1d9e6,inset_-8px_-8px_16px_#ffffff]"
          >
            <CheckCircle className="w-8 h-8 text-[#ff1493]" />
          </motion.div>

          <h1 className="text-2xl font-bold text-gray-700 mb-2 font-mono">Welcome!</h1>
          <p className="text-gray-500 mb-6 font-mono">
            Hey {displayEmail.split("@")[0]}, you're all set! Let's get you started.
          </p>

          <div className="w-full space-y-4 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 p-4 bg-[#f0f3fa] rounded-2xl shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]"
            >
              <div className="w-3 h-3 bg-[#ff1493] rounded-full shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff]"></div>
              <span className="text-gray-600 font-mono">Account created</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-3 p-4 bg-[#f0f3fa] rounded-2xl shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]"
            >
              <div className="w-3 h-3 bg-[#ff1493] rounded-full shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff]"></div>
              <span className="text-gray-600 font-mono">Profile setup ready</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="flex items-center gap-3 p-4 bg-[#f0f3fa] rounded-2xl shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]"
            >
              <div className="w-3 h-3 bg-gray-300 rounded-full shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff]"></div>
              <span className="text-gray-400 font-mono">Complete onboarding</span>
            </motion.div>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            onClick={handleContinue}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-[#f0f3fa] rounded-2xl text-lg font-semibold shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center justify-center gap-2 font-mono text-[#ff1493]"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
    </>
  )
}
