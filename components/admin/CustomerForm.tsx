'use client'

import { useState, useRef, useEffect } from 'react'
import React from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { UploadButton } from '@/components/ui/UploadButton'
import { IconButton } from '@/components/ui/IconButton'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { MdOutlineDelete } from 'react-icons/md'
import type { Customer } from '@/lib/types/customer'

interface CustomerFormProps {
  customer?: Customer
  workspaceId: string
  onSubmitSuccess?: () => void
  hideButtons?: boolean
  formRef?: React.RefObject<HTMLFormElement>
  onSubmittingChange?: (isSubmitting: boolean) => void
}

export function CustomerForm({ 
  customer, 
  workspaceId, 
  onSubmitSuccess,
  hideButtons = false,
  formRef,
  onSubmittingChange,
}: CustomerFormProps) {
  const [name, setName] = useState(customer?.name || '')
  const [orgnr, setOrgnr] = useState(customer?.orgnr || customer?.org_number || '')
  const [bolagsform, setBolagsform] = useState(customer?.bolagsform || '')
  const [ansvarigKonsult, setAnsvarigKonsult] = useState(customer?.ansvarig_konsult || '')
  const [kontaktperson, setKontaktperson] = useState(customer?.kontaktperson || '')
  const [epost, setEpost] = useState(customer?.epost || customer?.contact_email || '')
  const [telefon, setTelefon] = useState(customer?.telefon || '')
  const [rakningsarStart, setRakningsarStart] = useState(
    customer?.räkenskapsår_start ? customer.räkenskapsår_start.split('T')[0] : ''
  )
  const [rakningsarSlut, setRakningsarSlut] = useState(
    customer?.räkenskapsår_slut ? customer.räkenskapsår_slut.split('T')[0] : ''
  )
  const [tjanster, setTjanster] = useState(customer?.tjänster || '')
  const [fortnoxId, setFortnoxId] = useState(customer?.fortnox_id || '')
  const [status, setStatus] = useState<'Aktiv' | 'Passiv'>(customer?.status || 'Aktiv')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchedLogoUrl, setFetchedLogoUrl] = useState<string | null>(null)
  const [isFetchingLogo, setIsFetchingLogo] = useState(false)
  const [useFetchedLogo, setUseFetchedLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const isEditing = !!customer

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setLogoFile(file)
    setRemoveLogo(false)
    setUseFetchedLogo(false)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setLogoPreview(null)
    }
  }

  // Debounced logo fetching when company name changes
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Don't fetch if editing existing customer or name is empty
    if (isEditing || !name.trim()) {
      setFetchedLogoUrl(null)
      setIsFetchingLogo(false)
      setUseFetchedLogo(false)
      return
    }

    // Don't fetch if user has manually uploaded a logo
    if (logoFile) {
      return
    }

    // Debounce the API call
    setIsFetchingLogo(true)
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/brandfetch/search?query=${encodeURIComponent(name.trim())}`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.logoUrl) {
            setFetchedLogoUrl(data.logoUrl)
            // Automatically use the fetched logo
            setUseFetchedLogo(true)
          } else {
            setFetchedLogoUrl(null)
            setUseFetchedLogo(false)
          }
        } else {
          setFetchedLogoUrl(null)
          setUseFetchedLogo(false)
        }
      } catch (error) {
        console.error('Error fetching logo:', error)
        setFetchedLogoUrl(null)
        setUseFetchedLogo(false)
      } finally {
        setIsFetchingLogo(false)
      }
    }, 800) // 800ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [name, isEditing, logoFile])

  const handleDeleteLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    setFetchedLogoUrl(null)
    setUseFetchedLogo(false)
    // If editing and customer has a logo, mark it for removal
    if (isEditing && customer?.logo_url) {
      setRemoveLogo(true)
    } else {
      setRemoveLogo(false)
    }
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    onSubmittingChange?.(true)
    setError(null)

    // Validation
    if (!name.trim()) {
      setError('Företagsnamn är obligatoriskt')
      setIsSubmitting(false)
      onSubmittingChange?.(false)
      return
    }

    if (epost && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost)) {
      setError('Ogiltig e-postadress')
      setIsSubmitting(false)
      onSubmittingChange?.(false)
      return
    }

    if (rakningsarStart && isNaN(Date.parse(rakningsarStart))) {
      setError('Ogiltigt startdatum för räkenskapsår')
      setIsSubmitting(false)
      onSubmittingChange?.(false)
      return
    }

    if (rakningsarSlut && isNaN(Date.parse(rakningsarSlut))) {
      setError('Ogiltigt slutdatum för räkenskapsår')
      setIsSubmitting(false)
      onSubmittingChange?.(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('workspace_id', workspaceId)
      formData.append('name', name)
      if (orgnr) formData.append('orgnr', orgnr)
      if (bolagsform) formData.append('bolagsform', bolagsform)
      if (ansvarigKonsult) formData.append('ansvarig_konsult', ansvarigKonsult)
      if (kontaktperson) formData.append('kontaktperson', kontaktperson)
      if (epost) formData.append('epost', epost)
      if (telefon) formData.append('telefon', telefon)
      if (rakningsarStart) formData.append('rakningsar_start', rakningsarStart)
      if (rakningsarSlut) formData.append('rakningsar_slut', rakningsarSlut)
      if (tjanster) formData.append('tjanster', tjanster)
      if (fortnoxId) formData.append('fortnox_id', fortnoxId)
      formData.append('status', status)
      if (logoFile) formData.append('logo', logoFile)
      if (useFetchedLogo && fetchedLogoUrl) {
        formData.append('logo_url', fetchedLogoUrl)
      }
      if (removeLogo) formData.append('remove_logo', 'true')

      const url = isEditing 
        ? `/api/customers/${customer.id}`
        : '/api/customers/create'
      
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} customer`)
      }

      const data = await response.json()
      if (onSubmitSuccess) {
        onSubmitSuccess()
      } else {
        window.location.href = `/customers/${data.customer?.id || customer?.id}`
      }
    } catch (err: any) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} customer:`, err)
      setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} customer. Please try again.`)
    } finally {
      setIsSubmitting(false)
      onSubmittingChange?.(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Logo Upload Section */}
      <div className="flex flex-col gap-[8px] items-center">
        <div className="relative group">
          <UploadButton
            onClick={handleUploadClick}
            disabled={isSubmitting}
            backgroundImage={
              logoPreview || 
              (useFetchedLogo && fetchedLogoUrl ? fetchedLogoUrl : null) ||
              (customer?.logo_url && !removeLogo ? customer.logo_url : null)
            }
          />
          {/* Delete button overlay - shows on hover when logo exists */}
          {(logoPreview || (useFetchedLogo && fetchedLogoUrl) || (customer?.logo_url && !removeLogo)) && (
            <div className="absolute top-[8px] right-[8px] opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <IconButton
                icon={<MdOutlineDelete />}
                variant="secondary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteLogo()
                }}
                disabled={isSubmitting}
                aria-label="Delete logo"
              />
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          name="logo"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isSubmitting}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
        
        {isFetchingLogo && !logoFile && (
          <p className="text-xs text-gray-500">Searching for logo...</p>
        )}
      </div>

      <div>
        <Label htmlFor="name">Företagsnamn *</Label>
        <Input 
          id="name" 
          name="name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required 
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="orgnr">Organisationsnummer</Label>
          <Input 
            id="orgnr" 
            name="orgnr" 
            value={orgnr}
            onChange={(e) => setOrgnr(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="bolagsform">Bolagsform</Label>
          <select
            id="bolagsform"
            name="bolagsform"
            value={bolagsform}
            onChange={(e) => setBolagsform(e.target.value)}
            disabled={isSubmitting}
            className="w-full h-10 px-4 py-2 bg-white border border-gray-300 rounded-md hover:border-gray-400 focus:border-gray-400 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            <option value="">Välj bolagsform</option>
            <option value="AB">AB</option>
            <option value="EF">EF</option>
            <option value="HB">HB</option>
            <option value="Förening">Förening</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ansvarig_konsult">Ansvarig konsult</Label>
          <Input 
            id="ansvarig_konsult" 
            name="ansvarig_konsult" 
            value={ansvarigKonsult}
            onChange={(e) => setAnsvarigKonsult(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="kontaktperson">Kontaktperson</Label>
          <Input 
            id="kontaktperson" 
            name="kontaktperson" 
            value={kontaktperson}
            onChange={(e) => setKontaktperson(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="epost">E-post</Label>
          <Input 
            id="epost" 
            name="epost" 
            type="email"
            value={epost}
            onChange={(e) => setEpost(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="telefon">Telefon</Label>
          <Input 
            id="telefon" 
            name="telefon" 
            type="tel"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rakningsar_start">Räkenskapsår start</Label>
          <Input 
            id="rakningsar_start" 
            name="rakningsar_start" 
            type="date"
            value={rakningsarStart}
            onChange={(e) => setRakningsarStart(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="rakningsar_slut">Räkenskapsår slut</Label>
          <Input 
            id="rakningsar_slut" 
            name="rakningsar_slut" 
            type="date"
            value={rakningsarSlut}
            onChange={(e) => setRakningsarSlut(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="tjanster">Tjänster</Label>
        <Textarea 
          id="tjanster" 
          name="tjanster" 
          value={tjanster}
          onChange={(e) => setTjanster(e.target.value)}
          disabled={isSubmitting}
          placeholder="t.ex. Bokföring, bokslut"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fortnox_id">Fortnox ID</Label>
          <Input 
            id="fortnox_id" 
            name="fortnox_id" 
            value={fortnoxId}
            onChange={(e) => setFortnoxId(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'Aktiv' | 'Passiv')}
            disabled={isSubmitting}
            className="w-full h-10 px-4 py-2 bg-white border border-gray-300 rounded-md hover:border-gray-400 focus:border-gray-400 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            <option value="Aktiv">Aktiv</option>
            <option value="Passiv">Passiv</option>
          </select>
        </div>
      </div>

      {!hideButtons ? (
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Customer' : 'Create Customer')}
          </Button>
          <a href={isEditing ? `/customers/${customer.id}` : '/customers'}>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </a>
        </div>
      ) : (
        <button type="submit" style={{ display: 'none' }} aria-hidden="true" />
      )}
    </form>
  )
}

