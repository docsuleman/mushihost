import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Zap } from 'lucide-react'

const CREDIT_PACKS = [
  { value: '10_credits', label: '10 Credits ($15)' },
  { value: '20_credits', label: '20 Credits ($25)' },
  { value: '100_credits', label: '100 Credits ($50)' },
  { value: '250_credits', label: '250 Credits ($100)' },
]

export default function AutoLoadSettings({ settings, onSave }) {
  const [enabled, setEnabled] = useState(settings?.auto_load_enabled || false)
  const [mode, setMode] = useState(settings?.auto_load_mode || 'notify')
  const [threshold, setThreshold] = useState(settings?.auto_load_threshold || 5)
  const [maxMonthly, setMaxMonthly] = useState(settings?.auto_load_max_monthly || 100)
  const [pack, setPack] = useState(settings?.auto_load_pack || '100_credits')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        auto_load_enabled: enabled,
        auto_load_mode: mode,
        auto_load_threshold: threshold,
        auto_load_max_monthly: maxMonthly,
        auto_load_pack: pack,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Auto-Load Credits
            </CardTitle>
            <CardDescription>
              Automatically top up your credits when they run low
            </CardDescription>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${enabled ? 'bg-primary' : 'bg-muted'}`}
          >
            <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </CardHeader>
      {enabled && (
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Mode</Label>
            <div className="mt-1 flex gap-2">
              <Badge
                variant={mode === 'automatic' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setMode('automatic')}
              >
                Automatic
              </Badge>
              <Badge
                variant={mode === 'notify' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setMode('notify')}
              >
                Notify Me
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {mode === 'automatic'
                ? 'Your saved payment method will be charged automatically.'
                : 'You will receive an email with a one-click payment link.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="threshold">Credit Threshold</Label>
              <Input
                id="threshold"
                type="number"
                min={1}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-muted-foreground">Top up when credits fall below this</p>
            </div>
            <div>
              <Label htmlFor="maxMonthly">Max Monthly Spend ($)</Label>
              <Input
                id="maxMonthly"
                type="number"
                min={0}
                value={maxMonthly}
                onChange={(e) => setMaxMonthly(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-muted-foreground">Monthly spending cap</p>
            </div>
          </div>

          <div>
            <Label>Credit Pack</Label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {CREDIT_PACKS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPack(p.value)}
                  className={`rounded-md border p-2 text-sm text-left cursor-pointer transition-colors ${
                    pack === p.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full cursor-pointer">
            {saving ? 'Saving...' : 'Save Auto-Load Settings'}
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
