import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

// Background images for slideshow - all images restored
const backgroundImages = [
  "/img/alchemyrefiner_alchemymagic_0_2c60cda9-5c96-4617-b12a-1e3a83408963_0.jpg",
  "/img/Leonardo_Anime_XL_A_highly_detailed_digital_painting_of_a_coas_0%20(1).jpg",
  "/img/Leonardo_Phoenix_10_Panoramic_shot_of_the_ancient_lost_city_Th_0.jpg",
  "/img/Lucid_Origin_Surreal_lunar_colony_situated_under_a_vibrant_glo_0.jpg",
  "/img/Lucid_Realism_A_macro_shot_hyperrealistic_intricate_human_eye__1.jpg"
];

const BackgroundSlideshow: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={backgroundImages[currentImageIndex]}
            alt="Background"
            className="w-full h-full object-cover slideshow-image transform scale-110"
            style={{
              objectPosition: 'center center',
              filter: 'brightness(1.05) contrast(1.1) saturate(1.2)'
            }}
            onLoad={() => {
              console.log('Image loaded:', backgroundImages[currentImageIndex]);
            }}
            onError={(e) => {
              console.error('Failed to load image:', backgroundImages[currentImageIndex]);
              console.error('Error:', e);
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const AvatarPlaceholder: React.FC = () => {
  return (
    <div className="w-20 h-20 rounded-full bg-[#f0f3fa] flex items-center justify-center mb-8 shadow-[inset_8px_8px_16px_#d1d9e6,inset_-8px_-8px_16px_#ffffff]">
      <User
        className="w-8 h-8 text-gray-400"
        style={{
          color: "#374151",
        }}
      />
    </div>
  )
}

interface InputFieldProps {
  type: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  showPasswordToggle?: boolean
}

const InputField: React.FC<InputFieldProps> = ({ type, placeholder, value, onChange, showPasswordToggle = false }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputType = showPasswordToggle ? (showPassword ? "text" : "password") : type
  return (
    <div className="relative mb-6">
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full px-6 py-4 bg-[#f0f3fa] rounded-2xl text-gray-700 placeholder-gray-400 outline-none transition-all duration-200 font-mono ${isFocused ? "shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] ring-2 ring-[#ff149380]" : "shadow-[inset_8px_8px_16px_#d1d9e6,inset_-8px_-8px_16px_#ffffff]"}`}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  )
}

interface LoginButtonProps {
  onClick: (e: React.FormEvent) => void
  isLoading: boolean
}

const LoginButton: React.FC<LoginButtonProps> = ({ onClick, isLoading }) => {
  return (
    <motion.button
      type="submit"
      onClick={onClick}
      whileHover={{
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
      className={`w-full py-4 bg-[#f0f3fa] rounded-2xl text-gray-700 text-lg mb-6 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 font-mono font-normal ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      style={{
        // @ts-ignore - Framer Motion style override
        color: "#ff1493",
      }}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : "Login"}
    </motion.button>
  )
}

interface FooterLinksProps {
  onForgotPassword: () => void
  onSignUp: () => void
}

const FooterLinks: React.FC<FooterLinksProps> = ({ onForgotPassword, onSignUp }) => {
  return (
    <div className="flex justify-between items-center text-sm">
      <button 
        type="button"
        onClick={onForgotPassword}
        className="text-gray-500 hover:text-[#ff1493] hover:underline transition-all duration-200 font-mono"
      >
        Forgot password?
      </button>
      <button
        type="button"
        onClick={onSignUp}
        className="text-gray-500 hover:text-[#ff1493] hover:underline transition-all duration-200 font-mono"
        style={{
          marginLeft: "5px",
        }}
      >
        or Sign up
      </button>
    </div>
  )
}

const LoginCard: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!email || !password) {
      alert("Please fill in both fields")
      return
    }

    if (!email.includes("@")) {
      alert("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn(email, password)
      if (result.error) {
        alert("Login failed: " + result.error.message)
      } else {
        // Success - navigation will be handled by App component
        navigate("/dashboard")
      }
    } catch (error) {
      console.error("Login failed:", error)
      alert("Login failed: " + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    navigate("/forgot-password")
  }

  const handleSignUp = () => {
    navigate("/register")
  }

  return (
    <>
      <BackgroundSlideshow />
      <div className="relative z-10 w-full flex flex-col items-center">
        <h1 className="text-3xl text-center font-mono font-black text-white mt-20 mb-6 drop-shadow-lg">Sign In</h1>
        <div className="relative w-full max-w-md mx-auto">
          <div className="moving-border">
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
              }}
              className="w-full login-card-backdrop rounded-3xl p-8 shadow-[20px_20px_40px_rgba(209,217,230,0.6),-20px_-20px_40px_rgba(255,255,255,0.6)] mt-4 relative z-10"
            >
              <div className="flex flex-col items-center">
                <AvatarPlaceholder />

                <form onSubmit={handleSubmit} className="w-full">
                  <InputField type="email" placeholder="Email" value={email} onChange={setEmail} />

                  <InputField
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={setPassword}
                    showPasswordToggle={true}
                  />

                  <LoginButton onClick={handleSubmit} isLoading={isLoading} />
                </form>

                <FooterLinks onForgotPassword={handleForgotPassword} onSignUp={handleSignUp} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginCard
