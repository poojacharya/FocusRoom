import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { AuthCard } from '../../components/auth/AuthCard'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { resetPasswordSchema } from '../../lib/validation/authSchemas'
import { resetPassword } from '../../lib/api/auth.api'
import { showSuccessToast, showErrorToast } from '../../lib/toast'

// NOTE: POST /api/auth/reset-password does not exist on the backend yet.
// Token is read from ?token=... on this flat /reset-password route.
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const onSubmit = async ({ newPassword }) => {
    setIsSubmitting(true)
    try {
      await resetPassword({ token, newPassword })
      showSuccessToast('Password updated — please sign in')
      navigate('/login', { replace: true })
    } catch (error) {
      showErrorToast(
        error?.response?.status === 404
          ? "Password reset isn't available yet — check back soon."
          : error?.response?.data?.message || 'That reset link is invalid or has expired',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout tagline="Almost there.">
        <AuthCard title="Invalid reset link" subtitle="This link is missing or malformed">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
          >
            Request a new link
          </Link>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout tagline="Choose a new password.">
      <AuthCard title="Reset your password" subtitle="Enter a new password for your account">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="New password"
            type="password"
            placeholder="At least 8 characters"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Input
            label="Confirm new password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" isLoading={isSubmitting}>
            Reset password
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
