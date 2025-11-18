'use client'

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { format } from 'date-fns'
import {
  RefreshCw,
  Clock,
  Bell,
  Trophy,
  Zap,
  LogOut
} from 'lucide-react'

interface HeaderProps {
  selectedSite: string
  onSiteChange: (site: string) => void
  lastUpdated: Date
  isRefreshing: boolean
  onRefresh: () => void
}

// Site/location selector removed per requirements

export default function Header({
  selectedSite,
  onSiteChange,
  lastUpdated,
  isRefreshing,
  onRefresh
}: HeaderProps) {
  const { logout, user } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)

  const initials = String(user?.name || 'A')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()


  return (
    <header className="bg-white shadow-lg border-b border-secondary-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-secondary-900">
                  Sales Dashboard
                </h1>
                <p className="text-sm text-secondary-600">
                  Real-time Performance Tracking
                </p>
              </div>
            </div>
          </div>

          {/* Center - Live Indicator */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2 px-3 py-2 bg-success-50 rounded-lg border border-success-200">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-success-700">LIVE</span>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-4">
            {/* Last Updated */}
            <div className="hidden sm:flex items-center space-x-2 text-sm text-secondary-600">
              <Clock className="h-4 w-4" />
              <span suppressHydrationWarning>Updated {format(lastUpdated, 'HH:mm:ss')}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-3 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-primary-200"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline font-medium">
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors duration-200"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger-500 rounded-full" />
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-secondary-200 z-50">
                  <div className="p-4 border-b border-secondary-200">
                    <h3 className="font-semibold text-secondary-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-4 hover:bg-secondary-50 border-b border-secondary-100">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                          <Zap className="h-4 w-4 text-success-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-secondary-900">
                            Sarah Johnson moved to #1!
                          </p>
                          <p className="text-xs text-secondary-600 mt-1">
                            2 minutes ago
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-secondary-50 border-b border-secondary-100">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-secondary-900">
                            New daily record set!
                          </p>
                          <p className="text-xs text-secondary-600 mt-1">
                            5 minutes ago
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 text-center">
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Logged-in Agent */}
            {/* Compact Modernized Agent Profile */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2
                bg-white/80 hover:bg-white
                backdrop-blur-sm rounded-xl
                border border-secondary-200/50 hover:border-secondary-300/70
                shadow-sm hover:shadow-md
                transition-all duration-300 ease-out
                cursor-default min-w-0">

              {/* Compact Avatar with Status */}
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 
                    flex items-center justify-center
                    ring-2 ring-white shadow-sm
                    transition-transform duration-300">
                  <span className="text-white text-[11px] font-bold">
                    {initials}
                  </span>
                </div>
                {/* Smaller Pulsing Status Indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500 ring-2 ring-white"></span>
                </span>
              </div>

              {/* User Info */}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-secondary-900 truncate">
                  {user?.name || 'Agent'}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] font-medium text-success-600">Online</span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="group flex items-center gap-2 px-4 py-2.5
             bg-danger-50 hover:bg-danger-100 
             text-danger-700 hover:text-danger-800 
             rounded-xl border border-danger-200 hover:border-danger-300
             shadow-sm hover:shadow-md 
             transition-all duration-300 ease-out
             hover:-translate-y-0.5 active:scale-95
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-500/40"
            >
              <LogOut className="h-4 w-4 transition-transform duration-300 
                     group-hover:scale-110 group-hover:rotate-12" />
              <span className="hidden sm:inline font-semibold text-sm">
                Logout
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* Mobile site/location removed */}

      {/* Click outside handlers */}
      {(showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false)
          }}
        />
      )}
    </header>
  )
}
