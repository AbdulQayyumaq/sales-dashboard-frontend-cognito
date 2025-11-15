'use client'

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { format } from 'date-fns'
import { 
  RefreshCw, 
  MapPin, 
  Clock, 
  Settings, 
  Bell,
  ChevronDown,
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

const SITES = [
  { code: 'phoenix', name: 'Phoenix', timezone: 'MST' },
  { code: 'denver', name: 'Denver', timezone: 'MST' },
  { code: 'atlanta', name: 'Atlanta', timezone: 'EST' },
  { code: 'chicago', name: 'Chicago', timezone: 'CST' },
]

export default function Header({ 
  selectedSite, 
  onSiteChange, 
  lastUpdated, 
  isRefreshing, 
  onRefresh 
}: HeaderProps) {
  const { logout } = useAuth()
  const [showSiteDropdown, setShowSiteDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const currentSite = SITES.find(site => site.code === selectedSite) || SITES[0]

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

          {/* Center - Site Selector */}
          <div className="flex items-center space-x-6">
            {/* Site Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSiteDropdown(!showSiteDropdown)}
                className="flex items-center space-x-2 px-4 py-2 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors duration-200 border border-secondary-200"
              >
                <MapPin className="h-4 w-4 text-secondary-600" />
                <span className="font-medium text-secondary-900">
                  {currentSite.name}
                </span>
                <span className="text-xs text-secondary-500 bg-secondary-200 px-2 py-1 rounded">
                  {currentSite.timezone}
                </span>
                <ChevronDown className={`h-4 w-4 text-secondary-600 transition-transform duration-200 ${
                  showSiteDropdown ? 'rotate-180' : ''
                }`} />
              </button>

              {showSiteDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 z-50">
                  <div className="py-2">
                    {SITES.map((site) => (
                      <button
                        key={site.code}
                        onClick={() => {
                          onSiteChange(site.code)
                          setShowSiteDropdown(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-secondary-50 transition-colors duration-200 flex items-center justify-between"
                      >
                        <span className="font-medium">{site.name}</span>
                        <span className="text-xs text-secondary-500">{site.timezone}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Live Indicator */}
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

            {/* Settings */}
            <button className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors duration-200">
              <Settings className="h-5 w-5" />
            </button>

            {/* Logout Button */}
            <button 
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 bg-danger-50 hover:bg-danger-100 text-danger-700 rounded-lg transition-colors duration-200 border border-danger-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Site Selector */}
      <div className="sm:hidden px-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-secondary-600" />
            <span className="font-medium text-secondary-900">{currentSite.name}</span>
            <span className="text-xs text-secondary-500 bg-secondary-200 px-2 py-1 rounded">
              {currentSite.timezone}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-secondary-600">
            <Clock className="h-4 w-4" />
            <span suppressHydrationWarning>{format(lastUpdated, 'HH:mm')}</span>
          </div>
        </div>
      </div>

      {/* Click outside handlers */}
      {(showSiteDropdown || showNotifications) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowSiteDropdown(false)
            setShowNotifications(false)
          }}
        />
      )}
    </header>
  )
}
