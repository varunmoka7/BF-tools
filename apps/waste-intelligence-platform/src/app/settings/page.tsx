'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Palette,
  Globe,
  Download,
  Upload,
  Key,
  Mail,
  Phone,
  Building,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Info,
  Trash2,
  Plus,
  Edit,
  Lock,
  Unlock
} from 'lucide-react'

interface UserProfile {
  name: string
  email: string
  phone: string
  company: string
  department: string
  role: string
  timezone: string
  language: string
}

interface NotificationSettings {
  emailReports: boolean
  systemAlerts: boolean
  complianceAlerts: boolean
  weeklyDigest: boolean
  smsNotifications: boolean
  pushNotifications: boolean
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  sessionTimeout: number
  passwordLastChanged: Date
  loginHistory: boolean
  apiAccess: boolean
}

interface SystemPreferences {
  theme: 'light' | 'dark' | 'system'
  dateFormat: string
  numberFormat: string
  defaultDashboard: string
  itemsPerPage: number
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'preferences' | 'system'>('profile')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [profile, setProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@wastepro.com',
    phone: '+1-555-0123',
    company: 'WastePro Solutions',
    department: 'Operations',
    role: 'Manager',
    timezone: 'America/New_York',
    language: 'en-US'
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailReports: true,
    systemAlerts: true,
    complianceAlerts: true,
    weeklyDigest: true,
    smsNotifications: false,
    pushNotifications: true
  })

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordLastChanged: new Date('2024-01-01'),
    loginHistory: true,
    apiAccess: false
  })

  const [preferences, setPreferences] = useState<SystemPreferences>({
    theme: 'light',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'US',
    defaultDashboard: 'overview',
    itemsPerPage: 25
  })

  const handleSave = async (section: string) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaved(true)
    setLoading(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'preferences', name: 'Preferences', icon: Palette },
    { id: 'system', name: 'System', icon: Database }
  ]

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Analyst">Analyst</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={profile.timezone}
                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
              >
                <option value="America/New_York">Eastern Time (UTC-5)</option>
                <option value="America/Chicago">Central Time (UTC-6)</option>
                <option value="America/Denver">Mountain Time (UTC-7)</option>
                <option value="America/Los_Angeles">Pacific Time (UTC-8)</option>
                <option value="Europe/London">London (UTC+0)</option>
                <option value="Europe/Paris">Paris (UTC+1)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={profile.language}
                onChange={(e) => setProfile({ ...profile, language: e.target.value })}
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={() => handleSave('profile')} 
              disabled={loading}
              className="flex items-center space-x-2"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save Changes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'emailReports', label: 'Email Reports', description: 'Receive scheduled reports via email' },
            { key: 'systemAlerts', label: 'System Alerts', description: 'Get notified about system issues and updates' },
            { key: 'complianceAlerts', label: 'Compliance Alerts', description: 'Alerts when compliance thresholds are exceeded' },
            { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Summary of weekly activities and metrics' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">{item.label}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof NotificationSettings] })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications[item.key as keyof NotificationSettings] ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications[item.key as keyof NotificationSettings] ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mobile & Push Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive critical alerts via SMS' },
            { key: 'pushNotifications', label: 'Push Notifications', description: 'Browser push notifications for real-time updates' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">{item.label}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof NotificationSettings] })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications[item.key as keyof NotificationSettings] ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications[item.key as keyof NotificationSettings] ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
          
          <div className="flex justify-end">
            <Button 
              onClick={() => handleSave('notifications')} 
              disabled={loading}
              className="flex items-center space-x-2"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save Changes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <div className="flex items-center space-x-2">
              {security.twoFactorEnabled ? (
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">Disabled</Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled })}
              >
                {security.twoFactorEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
              <input
                type="number"
                min="5"
                max="120"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={security.sessionTimeout}
                onChange={(e) => setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Last Changed</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  value={security.passwordLastChanged.toLocaleDateString()}
                />
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { key: 'loginHistory', label: 'Login History Tracking', description: 'Keep track of login attempts and locations' },
              { key: 'apiAccess', label: 'API Access', description: 'Allow third-party applications to access your data' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{item.label}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <button
                  onClick={() => setSecurity({ ...security, [item.key]: !security[item.key as keyof SecuritySettings] })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    security[item.key as keyof SecuritySettings] ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    security[item.key as keyof SecuritySettings] ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={() => handleSave('security')} 
              disabled={loading}
              className="flex items-center space-x-2"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save Changes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPreferences = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Display Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={preferences.theme}
                onChange={(e) => setPreferences({ ...preferences, theme: e.target.value as 'light' | 'dark' | 'system' })}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={preferences.dateFormat}
                onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number Format</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={preferences.numberFormat}
                onChange={(e) => setPreferences({ ...preferences, numberFormat: e.target.value })}
              >
                <option value="US">US (1,234.56)</option>
                <option value="EU">EU (1.234,56)</option>
                <option value="IN">IN (1,23,456.78)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Dashboard</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={preferences.defaultDashboard}
                onChange={(e) => setPreferences({ ...preferences, defaultDashboard: e.target.value })}
              >
                <option value="overview">Overview</option>
                <option value="analytics">Analytics</option>
                <option value="companies">Companies</option>
                <option value="map">Global Map</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Items Per Page</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={preferences.itemsPerPage}
                onChange={(e) => setPreferences({ ...preferences, itemsPerPage: parseInt(e.target.value) })}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={() => handleSave('preferences')} 
              disabled={loading}
              className="flex items-center space-x-2"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save Changes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center space-x-2">
                <Download className="h-5 w-5 text-blue-600" />
                <span>Export Data</span>
              </h3>
              <p className="text-sm text-gray-600 mb-3">Download your data in various formats</p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  Export as CSV
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Export as JSON
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Export as PDF
                </Button>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center space-x-2">
                <Upload className="h-5 w-5 text-green-600" />
                <span>Import Data</span>
              </h3>
              <p className="text-sm text-gray-600 mb-3">Import data from external sources</p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  Import CSV
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Import JSON
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Bulk Import
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Platform Version:</span>
                <span className="text-sm font-medium">v1.2.3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Updated:</span>
                <span className="text-sm font-medium">Jan 15, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Database Version:</span>
                <span className="text-sm font-medium">PostgreSQL 14.2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">API Status:</span>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Storage Used:</span>
                <span className="text-sm font-medium">2.4 GB / 10 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Users:</span>
                <span className="text-sm font-medium">127</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Uptime:</span>
                <span className="text-sm font-medium">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Support:</span>
                <Button variant="link" size="sm" className="h-auto p-0">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">Delete Account</h3>
              <p className="text-sm text-red-700 mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                Delete Account
              </Button>
            </div>
            
            <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
              <h3 className="font-medium text-orange-800 mb-2">Clear All Data</h3>
              <p className="text-sm text-orange-700 mb-3">
                Remove all data from your account while keeping the account active.
              </p>
              <Button variant="outline" className="text-orange-600 border-orange-300 hover:bg-orange-50">
                Clear Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">
              Manage your account preferences and system configuration
            </p>
          </div>
        </div>
        {saved && (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Changes saved successfully</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600 bg-green-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Settings Content */}
      <div>
        {activeTab === 'profile' && renderProfileSettings()}
        {activeTab === 'notifications' && renderNotificationSettings()}
        {activeTab === 'security' && renderSecuritySettings()}
        {activeTab === 'preferences' && renderPreferences()}
        {activeTab === 'system' && renderSystemSettings()}
      </div>
    </div>
  )
}