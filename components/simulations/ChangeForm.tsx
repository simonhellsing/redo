'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { ChangeType, SimulationChange } from '@/lib/simulations/types'

interface ChangeFormProps {
  onAddChange: (change: SimulationChange) => void
  onCancel: () => void
}

const changeTypeLabels: Record<ChangeType, string> = {
  revenue: 'Ny intäkt (månatlig)',
  cost_reduction: 'Kostnadssänkning (månatlig)',
  one_time_cost: 'Engångskostnad',
  one_time_revenue: 'Engångsintäkt',
}

export function ChangeForm({ onAddChange, onCancel }: ChangeFormProps) {
  const [type, setType] = useState<ChangeType>('revenue')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount === 0) {
      return
    }

    const change: SimulationChange = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      description: description || changeTypeLabels[type],
      amount: type === 'cost_reduction' || type === 'one_time_cost'
        ? -Math.abs(numAmount)
        : Math.abs(numAmount),
      startDate: new Date(startDate),
      isRecurring: type === 'revenue' || type === 'cost_reduction',
    }

    onAddChange(change)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">Typ av förändring</Label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as ChangeType)}
          className="w-full mt-1 px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          {Object.entries(changeTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="description">Beskrivning</Label>
        <Input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={changeTypeLabels[type]}
        />
      </div>

      <div>
        <Label htmlFor="amount">
          Belopp (kr{type === 'revenue' || type === 'cost_reduction' ? '/månad' : ''})
        </Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="25000"
          min="0"
        />
      </div>

      <div>
        <Label htmlFor="startDate">Startdatum</Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary">
          Lägg till
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Avbryt
        </Button>
      </div>
    </form>
  )
}

