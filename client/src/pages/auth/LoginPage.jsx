import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { AuthCard } from '../../components/auth/AuthCard'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { loginSchema } from '../../lib/validation/authSchemas'
import { googleLoginUser, loginUser } from '../../lib/api/auth.api'
import { useAuthStore } from '../../store/useAuthStore'
import { showSuccessToast, showErrorToast } from '../../lib/toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const googleButtonRef = useRef(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: true },
  })

  const handleAuthSuccess = useCallback(
    async (user, accessToken, remember = true) => {
      setAuth({ user, accessToken, remember })
      showSuccessToast(`Welcome back, ${user.name.split(' ')[0]}`)
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    },
    [location.state, navigate, setAuth],
  )

  const onSubmit = async (values) => {
    setIsSubmitting(true)
    try {
      const { user, accessToken } = await loginUser(values)
      await handleAuthSuccess(user, accessToken, values.rememberMe)
    } catch (error) {
      showErrorToast(error?.response?.data?.message || 'Invalid email or password')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = useCallback(
    async (response) => {
      const credential = response?.credential
      if (!credential) {
        showErrorToast('Google sign-in was cancelled')
        return
      }

      setIsSubmitting(true)
      try {
        const { user, accessToken } = await googleLoginUser({ credential })
        await handleAuthSuccess(user, accessToken, true)
      } catch (error) {
        showErrorToast(error?.response?.data?.message || 'Google sign-in failed')
      } finally {
        setIsSubmitting(false)
      }
    },
    [handleAuthSuccess],
  )

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!googleClientId) return

    const ensureGoogleScript = () =>
      new Promise((resolve, reject) => {
        const existing = document.getElementById('google-gsi-script')
        if (existing) {
          if (window.google?.accounts?.id) {
            resolve()
            return
          }
          existing.addEventListener('load', () => resolve(), { once: true })
          existing.addEventListener('error', () => reject(new Error('Google sign-in script failed to load')), { once: true })
          return
        }

        const script = document.createElement('script')
        script.id = 'google-gsi-script'
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Google sign-in script failed to load'))
        document.head.appendChild(script)
      })

    let cancelled = false

    ensureGoogleScript()
      .then(() => {
        if (cancelled || !googleButtonRef.current || !window.google?.accounts?.id) {
          return
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleLogin,
        })
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'left',
        })
      })
      .catch(() => {
        // Fail silently here: the email/password flow still works, and the
        // button will remain hidden if Google isn't configured.
      })

    return () => {
      cancelled = true
    }
  }, [handleGoogleLogin])

  return (
    <AuthLayout tagline="Focus better, together.">
      <AuthCard title="Welcome back" subtitle="Sign in to continue to FocusHub">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-white/20 dark:bg-white/5"
                {...register('rememberMe')}
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" isLoading={isSubmitting}>
            Sign in
          </Button>

          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
                <span>or</span>
                <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
              </div>
              <div ref={googleButtonRef} className="flex justify-center" />
            </div>
          )}
        </form>
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
          >
            Sign up
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  )
}
