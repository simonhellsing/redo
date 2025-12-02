'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Text } from '@/components/ui/Text'
import { createClientSupabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function SignupForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setIsLoading(false)
        return
      }

      if (data.session) {
        // Use window.location for a full page reload to ensure cookies are set
        // Redirect to workspace setup for new users
        window.location.href = '/overview/workspace-setup'
      } else {
        // If no session, might need email confirmation
        setError('Please check your email to confirm your account before logging in.')
        setIsLoading(false)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClientSupabase()
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/overview`,
        },
      })

      if (oauthError) {
        setError(oauthError.message)
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Google sign-in error:', err)
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-1 items-center relative shrink-0">
        <Text variant="title-large" className="text-center w-[360px]" style={{ color: 'var(--neutral-800)' }}>
          Skapa konto
        </Text>
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
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="bg-[var(--neutral-100)] box-border flex gap-3 items-center justify-center p-3 rounded-lg shrink-0 w-full transition-colors hover:bg-[var(--neutral-200)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer group"
      >
        <div className="flex items-center justify-center shrink-0" style={{ width: '16px', height: '16px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </div>
        <Text variant="label-small" className="whitespace-nowrap transition-colors group-hover:text-[var(--neutral-900)]" style={{ color: 'var(--neutral-600)' }}>
          Fortsätt med Google
        </Text>
      </button>

      <div className="box-border flex gap-2 h-8 items-center justify-center px-3 py-2.5 relative rounded-lg shrink-0 w-full">
        <div className="basis-0 bg-[var(--neutral-100)] grow h-px min-h-px min-w-px shrink-0" />
        <Text variant="body-small" className="font-semibold whitespace-nowrap" style={{ color: 'var(--neutral-500)' }}>
          Eller
        </Text>
        <div className="basis-0 bg-[var(--neutral-100)] grow h-px min-h-px min-w-px shrink-0" />
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
          size="large"
          className="w-full"
        />
      </div>

      <div className="flex flex-col gap-1 items-start relative shrink-0 w-full">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          size="large"
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
          size="large"
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
          {isLoading ? 'Skapar konto...' : 'Skapa konto'}
        </Button>
      </form>
    </>
  )
}

