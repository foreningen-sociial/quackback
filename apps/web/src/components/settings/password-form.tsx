import { useState } from 'react'
import { toast } from 'sonner'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import { FormattedMessage, useIntl } from 'react-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormError } from '@/components/shared/form-error'
import { authClient } from '@/lib/client/auth-client'
import { setPasswordFn } from '@/lib/server/functions/invitations'

interface PasswordFormProps {
  /** Whether the user already has a `credential` account row. Drives
   *  the Set vs Change shape. Resolved server-side via fetchUserProfile
   *  so we don't fan out to authClient.listAccounts() on the client. */
  hasPassword: boolean
  /** Called after a successful set/change so the parent page can
   *  re-query (e.g. so the 2FA section appears immediately once a
   *  freshly-set password makes it meaningful). */
  onSaved?: () => void
}

export function PasswordForm({ hasPassword, onSaved }: PasswordFormProps) {
  const intl = useIntl()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError(
        intl.formatMessage({
          id: 'portal.settings.profile.password.tooShort',
          defaultMessage: 'Password must be at least 8 characters',
        })
      )
      return
    }
    if (newPassword !== confirmPassword) {
      setError(
        intl.formatMessage({
          id: 'portal.settings.profile.password.mismatch',
          defaultMessage: 'Passwords do not match',
        })
      )
      return
    }

    setLoading(true)
    try {
      if (hasPassword) {
        if (!currentPassword) {
          setError(
            intl.formatMessage({
              id: 'portal.settings.profile.password.currentRequired',
              defaultMessage: 'Current password is required',
            })
          )
          setLoading(false)
          return
        }
        const result = await authClient.changePassword({
          currentPassword,
          newPassword,
          revokeOtherSessions: false,
        })
        if (result.error) {
          throw new Error(
            result.error.message ||
              intl.formatMessage({
                id: 'portal.settings.profile.password.changeFailed',
                defaultMessage: 'Failed to change password',
              })
          )
        }
        toast.success(
          intl.formatMessage({
            id: 'portal.settings.profile.password.changed',
            defaultMessage: 'Password changed',
          })
        )
      } else {
        await setPasswordFn({ data: { newPassword } })
        toast.success(
          intl.formatMessage({
            id: 'portal.settings.profile.password.set',
            defaultMessage: 'Password set',
          })
        )
      }
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      onSaved?.()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : intl.formatMessage({
              id: 'portal.settings.profile.password.updateFailed',
              defaultMessage: 'Failed to update password',
            })
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
        <h2 className="font-medium mb-1">
          {hasPassword ? (
            <FormattedMessage
              id="portal.settings.profile.password.changeTitle"
              defaultMessage="Change password"
            />
          ) : (
            <FormattedMessage
              id="portal.settings.profile.password.setTitle"
              defaultMessage="Set password"
            />
          )}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {hasPassword ? (
            <FormattedMessage
              id="portal.settings.profile.password.changeDescription"
              defaultMessage="Update your current password"
            />
          ) : (
            <FormattedMessage
              id="portal.settings.profile.password.setDescription"
              defaultMessage="Add a password to sign in with email and password"
            />
          )}
        </p>

        <div className="space-y-4">
          {error && <FormError message={error} />}

          {hasPassword && (
            <div className="space-y-2">
              <label htmlFor="current-password" className="text-sm font-medium">
                <FormattedMessage
                  id="portal.settings.profile.password.currentLabel"
                  defaultMessage="Current password"
                />
              </label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium">
                <FormattedMessage
                  id="portal.settings.profile.password.newLabel"
                  defaultMessage="New password"
                />
              </label>
              <Input
                id="new-password"
                type="password"
                placeholder={intl.formatMessage({
                  id: 'portal.settings.profile.password.newPlaceholder',
                  defaultMessage: 'At least 8 characters',
                })}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                <FormattedMessage
                  id="portal.settings.profile.password.confirmLabel"
                  defaultMessage="Confirm password"
                />
              </label>
              <Input
                id="confirm-password"
                type="password"
                placeholder={intl.formatMessage({
                  id: 'portal.settings.profile.password.confirmPlaceholder',
                  defaultMessage: 'Re-enter your password',
                })}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                loading ||
                newPassword.length < 8 ||
                newPassword !== confirmPassword ||
                (hasPassword && !currentPassword)
              }
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                  {hasPassword ? (
                    <FormattedMessage
                      id="portal.settings.profile.password.changing"
                      defaultMessage="Changing..."
                    />
                  ) : (
                    <FormattedMessage
                      id="portal.settings.profile.password.settingInProgress"
                      defaultMessage="Setting..."
                    />
                  )}
                </>
              ) : hasPassword ? (
                <FormattedMessage
                  id="portal.settings.profile.password.changeTitle"
                  defaultMessage="Change password"
                />
              ) : (
                <FormattedMessage
                  id="portal.settings.profile.password.setTitle"
                  defaultMessage="Set password"
                />
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
