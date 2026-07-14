import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { AuthCard } from '../../components/auth/AuthCard'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { forgotPasswordSchema } from '../../lib/validation/authSchemas'
import { requestPasswordReset } from '../../lib/api/auth.api'
import { showErrorToast } from '../../lib/toast'
import { ArrowLeftIcon, MailIcon } from '../../components/ui/icons'

// NOTE: POST /api/auth/forgot-password does not exist on the backend yet.
// This page is fully built and wired to that path so it's ready the moment
// that endpoint lands — until then, submitting will surface a clear error
// rather than a silent/misleading success.
export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async ({ email }) => {
    setIsSubmitting(true)
    try {
      await requestPasswordReset({ email })
      setIsSent(true)
    } catch (error) {
      showErrorToast(
        error?.response?.status === 404
          ? "Password reset isn't available yet — check back soon."
          : error?.response?.data?.message || 'Something went wrong. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout tagline="We'll help you get back in.">
      <AuthCard
        title={isSent ? 'Check your inbox' : 'Forgot your password?'}
        subtitle={
          isSent
            ? `If an account exists for ${getValues('email')}, we've sent a reset link.`
            : "Enter your email and we'll send you a reset link"
        }
      >
        {isSent ? (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/10">
              <MailIcon className="h-6 w-6" />
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Button type="submit" isLoading={isSubmitting}>
                Send reset link
              </Button>
            </form>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to sign in
            </Link>
          </>
        )}
      </AuthCard>
    </AuthLayout>
  )
}
