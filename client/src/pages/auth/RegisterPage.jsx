import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { AuthCard } from '../../components/auth/AuthCard'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { registerSchema } from '../../lib/validation/authSchemas'
import { registerUser } from '../../lib/api/auth.api'
import { useAuthStore } from '../../store/useAuthStore'
import { showSuccessToast, showErrorToast } from '../../lib/toast'

// NOTE: no "Username" field here. The backend User model only has
// name/email/password — there's nowhere for a username to be persisted.
// "Display Name" below maps directly to the backend's `name` field.
export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async ({ name, email, password }) => {
    setIsSubmitting(true)
    try {
      const { user, accessToken } = await registerUser({ name, email, password })
      setAuth({ user, accessToken, remember: true })
      showSuccessToast(`Welcome to FocusHub, ${user.name.split(' ')[0]}`)
      navigate('/', { replace: true })
    } catch (error) {
      showErrorToast(error?.response?.data?.message || 'Could not create your account')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout tagline="Everything you need to stay in flow.">
      <AuthCard title="Create your account" subtitle="Start your FocusHub AI workspace">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Display name"
            placeholder="Ada Lovelace"
            error={errors.name?.message}
            {...register('name')}
          />
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
            placeholder="At least 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" isLoading={isSubmitting}>
            Create account
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
          >
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  )
}
