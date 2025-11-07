"use client"

import { motion } from "framer-motion"

interface AuracleLoaderProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

// Recreating the original PulsingBorder effect with rotating colored lights
const PulsingBorder = ({ size = 'medium', className }: { size?: string, className?: string }) => {
  const sizeMap = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16', 
    large: 'w-24 h-24'
  };

  const containerSize = sizeMap[size as keyof typeof sizeMap] || sizeMap.medium;

  return (
    <div className={`relative ${containerSize} ${className}`}>
      {/* Primary rotating light ring - matching original colors */}
      <motion.div 
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0%, #ff0066 15%, transparent 30%, #00ccff 45%, transparent 60%, #ffcc00 75%, transparent 90%)',
          filter: 'blur(1px)',
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
      
      {/* Secondary counter-rotating ring */}
      <motion.div 
        className="absolute inset-0 rounded-full opacity-80"
        style={{
          background: 'conic-gradient(from 180deg, transparent 0%, #9333ea 20%, transparent 40%, #06b6d4 60%, transparent 80%)',
          filter: 'blur(2px)',
        }}
        animate={{ rotate: -360 }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
      
      {/* Inner black circle to create ring effect */}
      <div className="absolute inset-1 rounded-full bg-black" />
      
      {/* Pulsing inner core */}
      <motion.div 
        className="absolute inset-2 rounded-full border border-white/50"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.4, 1, 0.4] 
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}

export default function AuracleLoader({ size = 'medium', className }: AuracleLoaderProps = {}) {
  const containerSizeMap = {
    small: 'w-16 h-16',
    medium: 'w-20 h-20',
    large: 'w-32 h-32'
  };

  const textSizeMap = {
    small: 'text-[6px]',
    medium: 'text-[8px]', 
    large: 'text-xs'
  };

  const containerSize = containerSizeMap[size];
  const textSize = textSizeMap[size];

  return (
    <div className={`z-30 ${className}`}>
      <div className={`relative ${containerSize} flex items-center justify-center`}>
        {/* Pulsing Border Circle */}
        <PulsingBorder size={size} />

        {/* Rotating Text Around the Border */}
        <motion.svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{
            transform: size === 'small' ? "scale(1.4)" : size === 'large' ? "scale(1.8)" : "scale(1.6)",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }}
        >
          <defs>
            <path id="circle" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
          </defs>
          <text className={textSize} style={{ fill: "rgba(255, 255, 255, 0.9)" }}>
            <textPath href="#circle" startOffset="0%">
              AURACLE • AURACLE • AURACLE • AURACLE • AURACLE • AURACLE •
            </textPath>
          </text>
        </motion.svg>

        {/* Center "A" logo */}
        <div className="absolute text-white font-bold text-center flex items-center justify-center">
          <motion.span
            className={size === 'small' ? 'text-xs' : size === 'large' ? 'text-lg' : 'text-sm'}
            animate={{ 
              textShadow: [
                '0 0 5px #ff0066',
                '0 0 8px #00ccff', 
                '0 0 5px #ffcc00',
                '0 0 8px #9333ea'
              ]
            }}
            transition={{ 
              duration: 2, 
              repeat: Number.POSITIVE_INFINITY, 
              ease: "easeInOut" 
            }}
          >
            A
          </motion.span>
        </div>
      </div>
    </div>
  )
}
