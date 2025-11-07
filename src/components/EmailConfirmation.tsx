import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BackgroundSlideshow from './BackgroundSlideshow'
import { useAuth } from '../context/AuthContext'

const EmailConfirmation: React.FC = () => {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [isSkipping, setIsSkipping] = useState(false)

  const handleBackToLogin = () => {
    navigate('/login')
  }

  // Development helper - skip email verification
  const handleSkipVerification = async () => {
    setIsSkipping(true)
    try {
      // Get the email from registration data if available
      const registrationData = localStorage.getItem("registrationData")
      if (registrationData) {
        const data = JSON.parse(registrationData)
        console.log('Attempting to sign in without verification for development...')
        
        // Try to sign in - this will work if email confirmation is disabled in Supabase
        const result = await signIn(data.email, data.password)
        if (result.error) {
          alert('Email confirmation is still required. Please check your Supabase settings or contact support.')
        } else {
          localStorage.removeItem("registrationData")
          navigate('/dashboard')
        }
      } else {
        alert('No registration data found. Please try registering again.')
      }
    } catch (error) {
      console.error('Skip verification error:', error)
      alert('Unable to skip verification. Please check your email or contact support.')
    } finally {
      setIsSkipping(false)
    }
  }

  return (
    <>
      <BackgroundSlideshow />
      <div className="relative min-h-screen flex items-center justify-center p-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto login-card-backdrop rounded-3xl p-8 shadow-[20px_20px_40px_rgba(209,217,230,1),-20px_-20px_40px_rgba(255,255,255,1)]"
        >
          <div className="flex flex-col items-center text-center">
            {/* Email Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="w-20 h-20 rounded-full bg-[#f0f3fa] flex items-center justify-center mb-6 shadow-[inset_8px_8px_16px_#d1d9e6,inset_-8px_-8px_16px_#ffffff]"
            >
              <Mail className="w-8 h-8 text-blue-500" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-2xl font-bold text-gray-700 mb-3 font-mono"
            >
              Check Your Email
            </motion.h1>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="text-gray-500 font-mono mb-6 leading-relaxed"
            >
              We've sent you a confirmation link. Please check your email and click the link to activate your account.
            </motion.p>

            {/* Steps */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="w-full text-left mb-8"
            >
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600 font-mono">Check your inbox</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600 font-mono">Click the confirmation link</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600 font-mono">Sign in to your account</span>
              </div>
            </motion.div>

            {/* Back to Login Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.4 }}
              onClick={handleBackToLogin}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-[#f0f3fa] rounded-2xl font-semibold shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 font-mono text-[#ff1493] mb-4"
            >
              Back to Login
            </motion.button>

            {/* Development Skip Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.4 }}
              onClick={handleSkipVerification}
              disabled={isSkipping}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gray-100 rounded-2xl font-semibold shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 font-mono text-gray-600 disabled:opacity-50"
            >
              {isSkipping ? 'Signing In...' : 'Skip Verification (Dev)'}
            </motion.button>

            {/* Help Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.4 }}
              className="text-xs text-gray-400 font-mono mt-4"
            >
              Didn't receive the email? Check your spam folder or contact support.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default EmailConfirmation
