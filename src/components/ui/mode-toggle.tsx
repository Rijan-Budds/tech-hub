"use client"
import * as React from "react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === 'dark'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <div 
      className={`
        relative w-12 h-6 sm:w-16 sm:h-8 rounded-full cursor-pointer transition-all duration-700 ease-in-out overflow-hidden
        ${isDark 
          ? 'bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-800' 
          : 'bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500'
        }
      `}
      style={{
        boxShadow: isDark 
          ? '0 4px 16px rgba(99, 102, 241, 0.3)' 
          : '0 4px 16px rgba(59, 130, 246, 0.3)'
      }}
      onClick={toggleTheme}
    >
      {/* Day Scene - Clouds */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${isDark ? 'opacity-0' : 'opacity-100'}`}>
        {/* Moving clouds */}
        <div className="absolute top-1 left-1">
          <div className="relative">
            <div className="w-2 h-1 bg-white rounded-full opacity-80 animate-pulse"></div>
            <div className="absolute -top-0.5 left-0.5 w-1 h-0.5 bg-white rounded-full opacity-60"></div>
            <div className="absolute top-0.5 left-1.5 w-1 h-0.5 bg-white rounded-full opacity-70"></div>
          </div>
        </div>
        
        <div className="absolute top-2 right-2 animate-bounce" style={{animationDelay: '1s', animationDuration: '3s'}}>
          <div className="relative">
            <div className="w-1.5 h-1 bg-white rounded-full opacity-70"></div>
            <div className="absolute -top-0.5 left-0.5 w-1 h-0.5 bg-white rounded-full opacity-50"></div>
          </div>
        </div>

        <div className="absolute top-0.5 right-0.5 animate-pulse" style={{animationDelay: '2s'}}>
          <div className="w-1 h-0.5 bg-white rounded-full opacity-60"></div>
        </div>
      </div>

      {/* Night Scene - Stars */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${isDark ? 'opacity-100' : 'opacity-0'}`}>
        {/* Twinkling stars */}
        <div className="absolute top-1 left-2">
          <div className="w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{animationDelay: '0s'}}></div>
        </div>
        <div className="absolute top-2.5 left-3">
          <div className="w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="absolute top-0.5 right-3">
          <div className="w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
        </div>
        <div className="absolute top-2 right-1.5">
          <div className="w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
        </div>
        <div className="absolute top-0.5 left-4">
          <div className="w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Plus-shaped stars */}
        <div className="absolute top-1.5 right-2.5" style={{animationDelay: '1s'}}>
          <div className="animate-pulse">
            <div className="absolute w-1 h-0.5 bg-white opacity-80 transform rotate-0"></div>
            <div className="absolute w-1 h-0.5 bg-white opacity-80 transform rotate-90"></div>
          </div>
        </div>
        <div className="absolute top-0.5 left-2.5" style={{animationDelay: '2s'}}>
          <div className="animate-pulse">
            <div className="absolute w-1 h-0.5 bg-white opacity-60 transform rotate-0"></div>
            <div className="absolute w-1 h-0.5 bg-white opacity-60 transform rotate-90"></div>
          </div>
        </div>
      </div>
      
      {/* Sliding toggle circle */}
      <div
        className={`
          absolute top-0.5 w-5 h-5 sm:w-7 sm:h-7 bg-white rounded-full shadow-lg
          transition-all duration-700 ease-in-out flex items-center justify-center
          ${isDark ? 'transform translate-x-6 sm:translate-x-8' : 'transform translate-x-0.5'}
        `}
        style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Sun */}
        <div className={`absolute transition-all duration-500 ${isDark ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
          <div className="relative flex items-center justify-center">
            {/* Sun glow layers */}
            <div className="absolute w-5 h-5 bg-yellow-300 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute w-4 h-4 bg-yellow-400 rounded-full opacity-40 animate-ping"></div>
            <div className="absolute w-3 h-3 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full animate-pulse" style={{animationDuration: '2s'}}></div>
            {/* Sun core */}
            <div className="relative w-2.5 h-2.5 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-lg"></div>
          </div>
        </div>

        {/* Moon */}
        <div className={`absolute transition-all duration-500 ${isDark ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <div className="relative flex items-center justify-center">
            {/* Moon glow */}
            <div className="absolute w-5 h-5 bg-blue-100 rounded-full opacity-10 animate-pulse" style={{animationDuration: '3s'}}></div>
            <div className="absolute w-4 h-4 bg-gray-100 rounded-full opacity-20 animate-ping" style={{animationDuration: '4s'}}></div>
            {/* Moon body */}
            <div className="relative w-3 h-3 bg-gradient-to-br from-gray-100 to-gray-300 rounded-full animate-pulse" style={{animationDuration: '2.5s'}}>
              {/* Moon craters */}
              <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-gray-400 rounded-full opacity-40"></div>
              <div className="absolute top-1.5 left-1.5 w-0.5 h-0.5 bg-gray-400 rounded-full opacity-60"></div>
              <div className="absolute top-1 right-0.5 w-0.5 h-0.5 bg-gray-400 rounded-full opacity-50"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}