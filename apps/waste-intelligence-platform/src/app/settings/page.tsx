'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Unlock,
  Monitor,
  Sun,
  Moon,
  Languages,
  Clock
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
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

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

  const GlassToggle = ({ 
    enabled, 
    onToggle, 
    label, 
    description 
  }: { 
    enabled: boolean
    onToggle: () => void
    label: string
    description: string 
  }) => (
    <div className="bg-muted/20 p-6 border border-border rounded-lg hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-foreground font-semibold mb-1">{label}</h4>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <button
          onClick={onToggle}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
            enabled 
              ? 'bg-primary shadow-lg' 
              : 'bg-muted border border-border'
          }`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-md ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>
    </div>
  )

  const GlassInput = ({ 
    label, 
    type = 'text', 
    value, 
    onChange, 
    icon: Icon,
    ...props 
  }: { 
    label: string
    type?: string
    value: string
    onChange: (value: string) => void
    icon?: any
    [key: string]: any 
  }) => (
    <div className="space-y-2">
      <label className="text-foreground text-sm font-medium flex items-center space-x-2">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        {...props}
      />
    </div>
  )

  const GlassSelect = ({ 
    label, 
    value, 
    onChange, 
    options, 
    icon: Icon 
  }: { 
    label: string
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
    icon?: any 
  }) => (
    <div className="space-y-2">
      <label className="text-foreground text-sm font-medium flex items-center space-x-2">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-background text-foreground">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <div className="min-h-screen bg-background relative">

      {/* Hero Section */}
      <div className="relative">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="bg-card p-8 mb-8 border border-border max-w-4xl mx-auto rounded-lg">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <Settings className="h-12 w-12 text-foreground" />
                <h1 className="text-5xl font-bold text-foreground">
                  Settings
                </h1>
              </div>
              <p className="text-xl text-foreground mb-6 max-w-3xl mx-auto">
                Customize your workspace, manage preferences, and configure system settings for optimal performance
              </p>
              <div className="flex items-center justify-center space-x-4 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Auto Save</span>
                </div>
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span>Secure</span>
                </div>
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span>Personalized</span>
                </div>
              </div>
            </div>

            {saved && (
              <div className="bg-emerald-500/20 p-4 max-w-md mx-auto mb-8 border border-emerald-400/30 rounded-lg">
                <div className="flex items-center justify-center space-x-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Changes saved successfully!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        <div className="container mx-auto px-4 pb-12">
          <Tabs defaultValue="general" className="space-y-8">
            <TabsList className="bg-card p-2 w-full max-w-2xl mx-auto border border-border h-auto">
              <TabsTrigger 
                value="general" 
                className="flex-1 py-4 px-6 text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-muted/50 rounded-xl"
              >
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">General</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="flex-1 py-4 px-6 text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-muted/50 rounded-xl"
              >
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span className="hidden sm:inline">Data & Privacy</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="display" 
                className="flex-1 py-4 px-6 text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-muted/50 rounded-xl"
              >
                <div className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span className="hidden sm:inline">Display</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="advanced" 
                className="flex-1 py-4 px-6 text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-muted/50 rounded-xl"
              >
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span className="hidden sm:inline">Advanced</span>
                </div>
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-8">
              {/* Profile Section */}
              <div className="bg-card p-8 border border-border rounded-lg hover:shadow-lg transition-all duration-200">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-3">
                  <User className="h-6 w-6" />
                  <span>Profile Information</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassInput
                    label="Full Name"
                    value={profile.name}
                    onChange={(value) => setProfile({ ...profile, name: value })}
                    icon={User}
                    placeholder="Enter your full name"
                  />
                  <GlassInput
                    label="Email Address"
                    type="email"
                    value={profile.email}
                    onChange={(value) => setProfile({ ...profile, email: value })}
                    icon={Mail}
                    placeholder="Enter your email"
                  />
                  <GlassInput
                    label="Phone Number"
                    type="tel"
                    value={profile.phone}
                    onChange={(value) => setProfile({ ...profile, phone: value })}
                    icon={Phone}
                    placeholder="Enter your phone number"
                  />
                  <GlassInput
                    label="Company"
                    value={profile.company}
                    onChange={(value) => setProfile({ ...profile, company: value })}
                    icon={Building}
                    placeholder="Enter your company name"
                  />
                  <GlassSelect
                    label="Role"
                    value={profile.role}
                    onChange={(value) => setProfile({ ...profile, role: value })}
                    icon={Key}
                    options={[
                      { value: 'Admin', label: 'Administrator' },
                      { value: 'Manager', label: 'Manager' },
                      { value: 'Analyst', label: 'Analyst' },
                      { value: 'Viewer', label: 'Viewer' }
                    ]}
                  />
                  <GlassSelect
                    label="Timezone"
                    value={profile.timezone}
                    onChange={(value) => setProfile({ ...profile, timezone: value })}
                    icon={Clock}
                    options={[
                      { value: 'America/New_York', label: 'Eastern Time (UTC-5)' },
                      { value: 'America/Chicago', label: 'Central Time (UTC-6)' },
                      { value: 'America/Denver', label: 'Mountain Time (UTC-7)' },
                      { value: 'America/Los_Angeles', label: 'Pacific Time (UTC-8)' },
                      { value: 'Europe/London', label: 'London (UTC+0)' },
                      { value: 'Europe/Paris', label: 'Paris (UTC+1)' }
                    ]}
                  />
                </div>
                <div className="flex justify-end mt-8">
                  <Button 
                    onClick={() => handleSave('profile')} 
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Notifications Section */}
              <div className="bg-card p-8 border border-border rounded-lg hover:shadow-lg transition-all duration-200">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-3">
                  <Bell className="h-6 w-6" />
                  <span>Notifications</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassToggle
                    enabled={notifications.emailReports}
                    onToggle={() => setNotifications({ ...notifications, emailReports: !notifications.emailReports })}
                    label="Email Reports"
                    description="Receive scheduled reports via email"
                  />
                  <GlassToggle
                    enabled={notifications.systemAlerts}
                    onToggle={() => setNotifications({ ...notifications, systemAlerts: !notifications.systemAlerts })}
                    label="System Alerts"
                    description="Get notified about system issues"
                  />
                  <GlassToggle
                    enabled={notifications.complianceAlerts}
                    onToggle={() => setNotifications({ ...notifications, complianceAlerts: !notifications.complianceAlerts })}
                    label="Compliance Alerts"
                    description="Alerts when thresholds are exceeded"
                  />
                  <GlassToggle
                    enabled={notifications.weeklyDigest}
                    onToggle={() => setNotifications({ ...notifications, weeklyDigest: !notifications.weeklyDigest })}
                    label="Weekly Digest"
                    description="Summary of weekly activities"
                  />
                  <GlassToggle
                    enabled={notifications.smsNotifications}
                    onToggle={() => setNotifications({ ...notifications, smsNotifications: !notifications.smsNotifications })}
                    label="SMS Notifications"
                    description="Receive critical alerts via SMS"
                  />
                  <GlassToggle
                    enabled={notifications.pushNotifications}
                    onToggle={() => setNotifications({ ...notifications, pushNotifications: !notifications.pushNotifications })}
                    label="Push Notifications"
                    description="Browser push notifications"
                  />
                </div>
                <div className="flex justify-end mt-8">
                  <Button 
                    onClick={() => handleSave('notifications')} 
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Data & Privacy Settings */}
            <TabsContent value="privacy" className="space-y-8">
              {/* Security Section */}
              <div className="bg-card p-8 border border-border rounded-lg hover:shadow-lg transition-all duration-200">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-3">
                  <Shield className="h-6 w-6" />
                  <span>Account Security</span>
                </h2>
                
                <div className="bg-muted/20 p-6 mb-6 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-foreground font-semibold mb-1">Two-Factor Authentication</h4>
                      <p className="text-muted-foreground text-sm">Add an extra layer of security to your account</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={security.twoFactorEnabled ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-400/30" : "bg-red-500/20 text-red-600 dark:text-red-300 border border-red-400/30"}>
                        {security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <Button
                        variant="outline"
                        onClick={() => setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled })}
                        className="border-border text-foreground hover:bg-muted"
                      >
                        {security.twoFactorEnabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassToggle
                    enabled={security.loginHistory}
                    onToggle={() => setSecurity({ ...security, loginHistory: !security.loginHistory })}
                    label="Login History Tracking"
                    description="Keep track of login attempts and locations"
                  />
                  <GlassToggle
                    enabled={security.apiAccess}
                    onToggle={() => setSecurity({ ...security, apiAccess: !security.apiAccess })}
                    label="API Access"
                    description="Allow third-party applications access"
                  />
                </div>

                <div className="mt-6">
                  <GlassInput
                    label="Session Timeout (minutes)"
                    type="number"
                    value={security.sessionTimeout.toString()}
                    onChange={(value) => setSecurity({ ...security, sessionTimeout: parseInt(value) || 30 })}
                    icon={Clock}
                  />
                </div>

                <div className="flex justify-end mt-8">
                  <Button 
                    onClick={() => handleSave('security')} 
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Data Management Section */}
              <div className="bg-card p-8 border border-border rounded-lg hover:shadow-lg transition-all duration-200">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-3">
                  <Database className="h-6 w-6" />
                  <span>Data Management</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-muted/20 p-6 border border-border rounded-lg">
                    <h3 className="text-foreground font-semibold mb-4 flex items-center space-x-2">
                      <Download className="h-5 w-5 text-blue-500" />
                      <span>Export Data</span>
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">Download your data in various formats</p>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted">
                        Export as CSV
                      </Button>
                      <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted">
                        Export as JSON
                      </Button>
                      <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted">
                        Export as PDF
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-muted/20 p-6 border border-border rounded-lg">
                    <h3 className="text-foreground font-semibold mb-4 flex items-center space-x-2">
                      <Upload className="h-5 w-5 text-green-500" />
                      <span>Import Data</span>
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">Import data from external sources</p>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted">
                        Import CSV
                      </Button>
                      <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted">
                        Import JSON
                      </Button>
                      <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted">
                        Bulk Import
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Display Settings */}
            <TabsContent value="display" className="space-y-8">
              <div className="bg-card p-8 border border-border rounded-lg hover:shadow-lg transition-all duration-200">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-3">
                  <Palette className="h-6 w-6" />
                  <span>Display Preferences</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassSelect
                    label="Theme"
                    value={preferences.theme}
                    onChange={(value) => setPreferences({ ...preferences, theme: value as 'light' | 'dark' | 'system' })}
                    icon={preferences.theme === 'light' ? Sun : preferences.theme === 'dark' ? Moon : Monitor}
                    options={[
                      { value: 'light', label: 'Light Theme' },
                      { value: 'dark', label: 'Dark Theme' },
                      { value: 'system', label: 'System Default' }
                    ]}
                  />
                  <GlassSelect
                    label="Language"
                    value={profile.language}
                    onChange={(value) => setProfile({ ...profile, language: value })}
                    icon={Languages}
                    options={[
                      { value: 'en-US', label: 'English (US)' },
                      { value: 'en-GB', label: 'English (UK)' },
                      { value: 'es-ES', label: 'Spanish' },
                      { value: 'fr-FR', label: 'French' },
                      { value: 'de-DE', label: 'German' }
                    ]}
                  />
                  <GlassSelect
                    label="Date Format"
                    value={preferences.dateFormat}
                    onChange={(value) => setPreferences({ ...preferences, dateFormat: value })}
                    icon={Clock}
                    options={[
                      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
                    ]}
                  />
                  <GlassSelect
                    label="Default Dashboard"
                    value={preferences.defaultDashboard}
                    onChange={(value) => setPreferences({ ...preferences, defaultDashboard: value })}
                    icon={Monitor}
                    options={[
                      { value: 'overview', label: 'Overview Dashboard' },
                      { value: 'companies', label: 'Companies Directory' },
                      { value: 'map', label: 'Global Map' }
                    ]}
                  />
                  <GlassSelect
                    label="Items Per Page"
                    value={preferences.itemsPerPage.toString()}
                    onChange={(value) => setPreferences({ ...preferences, itemsPerPage: parseInt(value) })}
                    icon={Info}
                    options={[
                      { value: '10', label: '10 items' },
                      { value: '25', label: '25 items' },
                      { value: '50', label: '50 items' },
                      { value: '100', label: '100 items' }
                    ]}
                  />
                  <GlassSelect
                    label="Number Format"
                    value={preferences.numberFormat}
                    onChange={(value) => setPreferences({ ...preferences, numberFormat: value })}
                    icon={Globe}
                    options={[
                      { value: 'US', label: 'US (1,234.56)' },
                      { value: 'EU', label: 'EU (1.234,56)' },
                      { value: 'IN', label: 'IN (1,23,456.78)' }
                    ]}
                  />
                </div>
                <div className="flex justify-end mt-8">
                  <Button 
                    onClick={() => handleSave('preferences')} 
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="advanced" className="space-y-8">
              {/* System Information */}
              <div className="bg-card p-8 border border-border rounded-lg hover:shadow-lg transition-all duration-200">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-3">
                  <Info className="h-6 w-6" />
                  <span>System Information</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="bg-muted/20 p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Platform Version:</span>
                        <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-400/30">v1.2.3</Badge>
                      </div>
                    </div>
                    <div className="bg-muted/20 p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Database Version:</span>
                        <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-400/30">PostgreSQL 14.2</Badge>
                      </div>
                    </div>
                    <div className="bg-muted/20 p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">API Status:</span>
                        <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-400/30">Online</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-muted/20 p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Storage Used:</span>
                        <span className="text-foreground font-medium">2.4 GB / 10 GB</span>
                      </div>
                    </div>
                    <div className="bg-muted/20 p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Active Users:</span>
                        <span className="text-foreground font-medium">127</span>
                      </div>
                    </div>
                    <div className="bg-muted/20 p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Uptime:</span>
                        <span className="text-foreground font-medium">99.9%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 dark:bg-red-950 p-8 border border-red-200 dark:border-red-800 rounded-lg hover:shadow-lg transition-all duration-200">
                <h2 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-6 flex items-center space-x-3">
                  <AlertTriangle className="h-6 w-6" />
                  <span>Danger Zone</span>
                </h2>
                <div className="space-y-6">
                  <div className="bg-red-50 dark:bg-red-950 p-6 border border-red-200 dark:border-red-800 rounded-lg">
                    <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Delete Account</h3>
                    <p className="text-red-700 dark:text-red-300 text-sm mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button 
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                  
                  <div className="bg-orange-50 dark:bg-orange-950 p-6 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <h3 className="text-orange-800 dark:text-orange-200 font-semibold mb-2">Clear All Data</h3>
                    <p className="text-orange-700 dark:text-orange-300 text-sm mb-4">
                      Remove all data from your account while keeping the account active.
                    </p>
                    <Button 
                      variant="outline"
                      className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Clear Data
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}