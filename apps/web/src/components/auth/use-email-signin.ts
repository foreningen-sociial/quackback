import { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { authClient } from '@/lib/client/auth-client'
import { AUTH_BLOCK_MESSAGES, AUTH_BLOCK_MESSAGE_IDS } from '@/lib/shared/auth-block-messages'

interface UseEmailSigninOptions {
  /** Where the magic link should land after a successful click. */
  callbackUrl: string
  /** Called after a successful OTP verification. */
  onSuccess: () => void | Promise<void>
}

interface UseEmailSigninResult {
  loading: boolean
  error: string
  code: string
  setCode: (code: string) => void
  /** Trigger the sign-in email send (POST /api/auth/portal-signin).
   *  `callbackUrlOverride` redirects THIS email's magic link somewhere
   *  other than the hook default (link-conflict recovery lands on
   *  /auth/link-sso); the override sticks for subsequent resends. */
  requestEmail: (
    email: string,
    callbackUrlOverride?: string
  ) => Promise<{ ok: boolean; error?: string }>
  /** Verify a 6-digit code; calls onSuccess on success. Idempotent if already loading. */
  verify: (email: string, otp: string) => Promise<void>
  /** Re-send the email; share the request flow. */
  resend: (email: string) => Promise<void>
  resendCooldown: number
  /** Reset error + code state (and any callback override) — call when leaving the code step. */
  reset: () => void
}

/**
 * Drives the combined magic-link + OTP sign-in flow. The inline dialog
 * (PortalAuthFormInline) consumes this so the request/verify/resend
 * logic stays in one place.
 */
export function useEmailSignin({
  callbackUrl,
  onSuccess,
}: UseEmailSigninOptions): UseEmailSigninResult {
  const intl = useIntl()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [code, setCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  // Sticky per-flow override so `resend` re-sends the same kind of email
  // (e.g. a link-conflict recovery link keeps pointing at /auth/link-sso).
  const callbackOverrideRef = useRef<string | null>(null)

  const failedToSendMessage = intl.formatMessage({
    id: 'portal.auth.emailSignin.failedToSend',
    defaultMessage: 'Failed to send sign-in email',
  })
  const invalidOrExpiredCodeMessage = intl.formatMessage({
    id: 'portal.auth.emailSignin.invalidOrExpiredCode',
    defaultMessage: 'Invalid or expired code',
  })

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const requestEmail = async (
    email: string,
    callbackUrlOverride?: string
  ): Promise<{ ok: boolean; error?: string }> => {
    setError('')
    setLoading(true)
    if (callbackUrlOverride !== undefined) callbackOverrideRef.current = callbackUrlOverride
    try {
      const res = await fetch('/api/auth/portal-signin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, callbackURL: callbackOverrideRef.current ?? callbackUrl }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; code?: string }
        const messageId = body.code
          ? AUTH_BLOCK_MESSAGE_IDS[body.code as keyof typeof AUTH_BLOCK_MESSAGE_IDS]
          : undefined
        const localized = messageId
          ? intl.formatMessage({
              id: messageId,
              defaultMessage: AUTH_BLOCK_MESSAGES[body.code as keyof typeof AUTH_BLOCK_MESSAGES],
            })
          : undefined
        throw new Error(localized || body.error || failedToSendMessage)
      }
      setResendCooldown(60)
      return { ok: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : failedToSendMessage
      setError(message)
      return { ok: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const verify = async (email: string, otp: string): Promise<void> => {
    if (loading) return
    if (otp.length !== 6) return
    setError('')
    setLoading(true)
    try {
      const result = await authClient.signIn.emailOtp({ email, otp })
      if (result.error) {
        throw new Error(result.error.message || invalidOrExpiredCodeMessage)
      }
      await onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : invalidOrExpiredCodeMessage)
    } finally {
      // Success has to clear this too. A host that stays mounted after sign-in
      // (the onboarding account step) would otherwise spin forever, and the
      // `if (loading) return` guard above would swallow every retry.
      setLoading(false)
    }
  }

  const resend = async (email: string): Promise<void> => {
    if (resendCooldown > 0 || loading) return
    setCode('')
    await requestEmail(email)
  }

  const reset = () => {
    setError('')
    setCode('')
    callbackOverrideRef.current = null
  }

  return {
    loading,
    error,
    code,
    setCode,
    requestEmail,
    verify,
    resend,
    resendCooldown,
    reset,
  }
}
