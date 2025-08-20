'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

interface EmailFilterSettings {
  enabledDomains: string[]
  customKeywords: string[]
  blockedSenders: string[]
  minimumConfidence: number
  enableFiltering: boolean
}

export function EmailFilterSettings() {
  const [settings, setSettings] = useState<EmailFilterSettings>({
    enabledDomains: [],
    customKeywords: [],
    blockedSenders: [],
    minimumConfidence: 0.5,
    enableFiltering: true
  })
  
  const [newDomain, setNewDomain] = useState('')
  const [newKeyword, setNewKeyword] = useState('')
  const [newBlockedSender, setNewBlockedSender] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/email/filter-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to load filter settings:', error)
    }
  }

  const saveSettings = async () => {
    try {
      const response = await fetch('/api/email/filter-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        // Show success message
        console.log('Settings saved successfully')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const addDomain = () => {
    if (newDomain && !settings.enabledDomains.includes(newDomain)) {
      setSettings(prev => ({
        ...prev,
        enabledDomains: [...prev.enabledDomains, newDomain]
      }))
      setNewDomain('')
    }
  }

  const removeDomain = (domain: string) => {
    setSettings(prev => ({
      ...prev,
      enabledDomains: prev.enabledDomains.filter(d => d !== domain)
    }))
  }

  const addKeyword = () => {
    if (newKeyword && !settings.customKeywords.includes(newKeyword)) {
      setSettings(prev => ({
        ...prev,
        customKeywords: [...prev.customKeywords, newKeyword]
      }))
      setNewKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setSettings(prev => ({
      ...prev,
      customKeywords: prev.customKeywords.filter(k => k !== keyword)
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Filter Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable Filtering Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-filtering">Enable Email Filtering</Label>
            <Switch
              id="enable-filtering"
              checked={settings.enableFiltering}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, enableFiltering: checked }))
              }
            />
          </div>

          {/* Minimum Confidence */}
          <div className="space-y-2">
            <Label>Minimum Confidence Score: {settings.minimumConfidence}</Label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.minimumConfidence}
              onChange={(e) => 
                setSettings(prev => ({ 
                  ...prev, 
                  minimumConfidence: parseFloat(e.target.value) 
                }))
              }
              className="w-full"
            />
          </div>

          {/* Trusted Domains */}
          <div className="space-y-2">
            <Label>Trusted Financial Domains</Label>
            <div className="flex space-x-2">
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="e.g., chase.com"
                onKeyPress={(e) => e.key === 'Enter' && addDomain()}
              />
              <Button onClick={addDomain} size="sm">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.enabledDomains.map((domain) => (
                <Badge key={domain} variant="secondary" className="cursor-pointer">
                  {domain}
                  <button 
                    onClick={() => removeDomain(domain)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Custom Keywords */}
          <div className="space-y-2">
            <Label>Custom Financial Keywords</Label>
            <div className="flex space-x-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="e.g., investment, dividend"
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              />
              <Button onClick={addKeyword} size="sm">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.customKeywords.map((keyword) => (
                <Badge key={keyword} variant="outline" className="cursor-pointer">
                  {keyword}
                  <button 
                    onClick={() => removeKeyword(keyword)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={saveSettings} className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}