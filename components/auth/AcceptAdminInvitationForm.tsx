'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Text } from '@/components/ui/Text'
import { createClientSupabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AcceptAdminInvitationFormProps {
  invitation: {
    id: string
    token: string
    email: string
    workspace_id: string
  }
  workspaceName?: string
  workspaceLogo?: string | null
}

export function AcceptAdminInvitationForm({ invitation, workspaceName, workspaceLogo }: AcceptAdminInvitationFormProps) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClientSupabase()

      // First, try to sign in with the provided credentials (in case user already exists)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: invitation.email,
        password,
      })

      let user
      if (signInData?.user) {
        // User already exists - sign in successful
        user = signInData.user
      } else if (signInError && signInError.message.includes('Invalid login credentials')) {
        // User doesn't exist or wrong password - try to sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: invitation.email,
          password,
          options: {
            data: {
              name,
              role: 'administrator',
            },
          },
        })

        if (signUpError) {
          // If signup fails because user already exists, show helpful error
          if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
            setError('An account with this email already exists. Please log in with your existing password, or use the "Log in" link below to access your account.')
            setIsLoading(false)
            return
          }
          setError(signUpError.message)
          setIsLoading(false)
          return
        }

        if (!signUpData?.user) {
          setError('Account creation failed. Please try again.')
          setIsLoading(false)
          return
        }

        user = signUpData.user
      } else {
        // Other sign in error
        setError(signInError?.message || 'Failed to sign in. Please try again.')
        setIsLoading(false)
        return
      }

      if (!user) {
        setError('Failed to authenticate. Please try again.')
        setIsLoading(false)
        return
      }

      // Get current profile to check if user already has a role
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Update or create profile with administrator role
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: name || profile?.name || user.user_metadata?.name || user.email?.split('@')[0],
          role: 'administrator',
        }, {
          onConflict: 'id',
        })

      // Add user to workspace as a member
      if (invitation.workspace_id) {
        await supabase
          .from('workspace_members')
          .upsert({
            workspace_id: invitation.workspace_id,
            user_id: user.id,
            role: 'collaborator',
          }, {
            onConflict: 'workspace_id,user_id',
          })
      }

      // Mark invitation as accepted
      await supabase
        .from('invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id)

      // Redirect to admin overview
      router.push('/overview')
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 items-center relative shrink-0 w-full">
        {workspaceLogo && (
          <div className="flex items-center justify-center mb-2 shrink-0">
            <div className="rounded-lg overflow-hidden shrink-0 flex-shrink-0" style={{ width: '64px', height: '64px' }}>
              <img
                src={workspaceLogo}
                alt={workspaceName ? `${workspaceName} logo` : 'Workspace logo'}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}
        <div className="flex flex-col gap-1 items-center relative shrink-0 w-full">
          <Text variant="title-large" className="text-center w-full" style={{ color: 'var(--neutral-800)' }}>
            {workspaceName ? `Du har blivit inbjuden som administratör för ${workspaceName}.` : 'Du har blivit inbjuden som administratör.'}
          </Text>
        </div>
      </div>

      {error && (
        <div className="bg-[var(--negative-50)] border border-[var(--negative-500)] text-[var(--negative-900)] px-4 py-3 rounded-lg text-body-small w-full">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1 items-start relative shrink-0 w-full">
        <Label htmlFor="name">Namn</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
          inputSize="large"
          className="w-full"
        />
      </div>

      <div className="flex flex-col gap-1 items-start relative shrink-0 w-full">
        <Label htmlFor="password">Lösenord</Label>
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          minLength={6}
          inputSize="large"
          className="w-full"
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center justify-center shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
              style={{ width: '16px', height: '16px', color: 'var(--neutral-500)' }}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M2 2l20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              )}
            </button>
          }
        />
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
          variant="primary"
          size="large"
        >
          {isLoading ? 'Bearbetar...' : 'Acceptera inbjudan'}
        </Button>
      </form>
      
      <div className="flex flex-wrap items-start justify-center relative shrink-0 w-full">
        <Text
          variant="body-small"
          style={{ color: 'var(--neutral-500)', letterSpacing: '0.25px' }}
          className="text-center"
        >
          Har du redan ett konto?{' '}
          <Link
            href="/login"
            className="text-label-small font-semibold whitespace-nowrap text-[var(--neutral-900)] hover:text-[var(--neutral-600)] transition-colors"
          >
            Logga in här.
          </Link>
        </Text>
      </div>
    </>
  )
}

