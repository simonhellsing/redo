'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Text } from '@/components/ui/Text'
import { createClientSupabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AcceptInvitationFormProps {
  invitation: {
    id: string
    token: string
    email: string
    customer_id: string
    workspace_id?: string
  }
  customerName?: string
  workspaceName?: string
  workspaceLogo?: string | null
}

export function AcceptInvitationForm({ invitation, customerName, workspaceName, workspaceLogo }: AcceptInvitationFormProps) {
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
              role: 'customer',
              customer_id: invitation.customer_id,
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

      // Get current profile to check if user is already an administrator
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Get customer to validate
      const { data: customer } = await supabase
        .from('customers')
        .select('workspace_id')
        .eq('id', invitation.customer_id)
        .single()

      if (!customer) {
        setError('Customer not found')
        setIsLoading(false)
        return
      }

      // Always use invitation.workspace_id as the source of truth
      // This ensures the user is added to the workspace they were invited to
      // If invitation.workspace_id is not set, fall back to customer.workspace_id but log a warning
      const workspaceId = invitation.workspace_id || customer.workspace_id
      
      if (!workspaceId) {
        setError('Workspace not found for this invitation')
        setIsLoading(false)
        return
      }

      // Validate that invitation workspace_id matches customer workspace_id if both exist
      // If they don't match, use invitation.workspace_id (the source of truth for the invitation)
      if (invitation.workspace_id && customer.workspace_id && invitation.workspace_id !== customer.workspace_id) {
        console.warn('Workspace mismatch detected: invitation workspace_id does not match customer workspace_id. Using invitation workspace_id.', {
          invitation_workspace_id: invitation.workspace_id,
          customer_workspace_id: customer.workspace_id,
          invitation_id: invitation.id,
          customer_id: invitation.customer_id,
        })
      }
      
      // Always prioritize invitation.workspace_id if it exists
      const finalWorkspaceId = invitation.workspace_id || customer.workspace_id

      // If user is already an administrator, don't overwrite their role
      // Instead, just link them to the customer while keeping their admin role
      if (profile && profile.role === 'administrator') {
        // Link user to customer without changing their role
        if (invitation.customer_id && finalWorkspaceId) {
          await supabase
            .from('customer_users')
            .upsert({
              user_id: user.id,
              customer_id: invitation.customer_id,
              workspace_id: finalWorkspaceId,
            }, {
              onConflict: 'workspace_id,customer_id,user_id',
            })
        }

        // Mark invitation as accepted
        await supabase
          .from('invitations')
          .update({ accepted_at: new Date().toISOString() })
          .eq('id', invitation.id)

        // Redirect to admin overview since they're an admin
        router.push('/overview')
        router.refresh()
        return
      }

      // For new customer users or existing customer users, update their profile
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: name || profile?.name || user.user_metadata?.name || user.email?.split('@')[0],
          role: 'customer',
        }, {
          onConflict: 'id',
        })

      // Link user to customer in customer_users table
      if (invitation.customer_id && finalWorkspaceId) {
        await supabase
          .from('customer_users')
          .upsert({
            user_id: user.id,
            customer_id: invitation.customer_id,
            workspace_id: finalWorkspaceId,
          }, {
            onConflict: 'workspace_id,customer_id,user_id',
          })
      }

      // Mark invitation as accepted
      await supabase
        .from('invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id)

      router.push('/my-reports')
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
            {workspaceName ? `Du har blivit inbjuden till en rapport från ${workspaceName}.` : 'Du har blivit inbjuden till en rapport.'}
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
      
      <div className="flex flex-wrap gap-1.5 items-start justify-center relative shrink-0 w-full">
        <Text variant="body-small" style={{ color: 'var(--neutral-500)', letterSpacing: '0.25px' }}>
          Har du redan ett konto?
        </Text>
        <Link href="/login">
          <Text variant="body-small" className="font-semibold whitespace-nowrap" style={{ color: 'var(--neutral-600)' }}>
            Logga in här.
          </Text>
        </Link>
      </div>
    </>
  )
}

