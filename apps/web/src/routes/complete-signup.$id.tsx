import { createFileRoute, isRedirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useIntl, FormattedMessage } from 'react-intl'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import {
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  BoltIcon,
  MapIcon,
} from '@heroicons/react/24/outline'
import { Spinner } from '@/components/shared/spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PortalIntlProvider } from '@/components/portal-intl-provider'
import { loadPortalIntl } from '@/lib/server/functions/locale'
import {
  acceptInvitationFn,
  getInvitationDetailsFn,
  getInviteBrandingFn,
  setPasswordFn,
} from '@/lib/server/functions/invitations'

const ERROR_MESSAGE_IDS: Record<string, { id: string; defaultMessage: string }> = {
  INVALID_TOKEN: {
    id: 'portal.auth.completeSignup.error.invalidToken',
    defaultMessage:
      'This invitation link is invalid. It may have already been used. Please ask your administrator to resend the invitation.',
  },
  EXPIRED_TOKEN: {
    id: 'portal.auth.completeSignup.error.expiredToken',
    defaultMessage:
      'This invitation link has expired. Please ask your administrator to resend the invitation.',
  },
  failed_to_create_user: {
    id: 'portal.auth.completeSignup.error.failedToCreateUser',
    defaultMessage:
      "We couldn't create your account. Please try again or contact your administrator.",
  },
  new_user_signup_disabled: {
    id: 'portal.auth.completeSignup.error.signupDisabled',
    defaultMessage:
      'New account creation is currently disabled. Please contact your administrator.',
  },
  failed_to_create_session: {
    id: 'portal.auth.completeSignup.error.failedToCreateSession',
    defaultMessage: "We couldn't sign you in. Please try again.",
  },
}

const FEATURES = [
  {
    icon: ChatBubbleLeftRightIcon,
    id: 'portal.auth.verifyMagicLink.feature.feedback',
    defaultMessage: 'Feedback & voting',
  },
  {
    icon: SparklesIcon,
    id: 'portal.auth.verifyMagicLink.feature.aiInsights',
    defaultMessage: 'AI-powered insights',
  },
  {
    icon: BoltIcon,
    id: 'portal.auth.verifyMagicLink.feature.integrations',
    defaultMessage: '24 integrations',
  },
  {
    icon: MapIcon,
    id: 'portal.auth.verifyMagicLink.feature.roadmap',
    defaultMessage: 'Roadmap & changelog',
  },
] as const

export interface InviteBranding {
  workspaceName: string
  logoUrl: string | null
  inviterName: string | null
}

const DEFAULT_BRANDING: InviteBranding = {
  workspaceName: 'Quackback',
  logoUrl: null,
  inviterName: null,
}

export const Route = createFileRoute('/complete-signup/$id')({
  validateSearch: (search: Record<string, unknown>) => ({
    error: (search.error as string) || undefined,
  }),
  loader: async ({ params, context }) => {
    const { id } = params
    const { session } = context

    const [branding, portalIntl] = await Promise.all([
      getInviteBrandingFn({ data: id }).catch(() => DEFAULT_BRANDING),
      loadPortalIntl(),
    ])

    if (!session?.user) {
      return { state: 'not-authenticated' as const, branding, portalIntl }
    }

    try {
      const data = await getInvitationDetailsFn({ data: id })
      return { state: 'welcome' as const, ...data, branding, portalIntl }
    } catch (err) {
      if (isRedirect(err)) throw err
      const message = err instanceof Error ? err.message : 'Failed to load invitation'
      return { state: 'error' as const, error: message, branding, portalIntl }
    }
  },
  component: AcceptInvitationRoute,
})

function AcceptInvitationRoute() {
  const { portalIntl } = Route.useLoaderData()
  return (
    <PortalIntlProvider locale={portalIntl.locale} messages={portalIntl.messages}>
      <AcceptInvitationPage />
    </PortalIntlProvider>
  )
}

function AcceptInvitationPage() {
  const data = Route.useLoaderData()
  const { error: errorCode } = Route.useSearch()
  const { id } = Route.useParams()
  const { branding } = data
  const intl = useIntl()

  // If the loader succeeded (state='welcome'), a stale ?error= from a previous
  // redirect attempt (e.g. Outlook Safe Links) should not override the valid invitation.
  if (errorCode && data.state !== 'welcome') {
    const known = ERROR_MESSAGE_IDS[errorCode]
    const message = known
      ? intl.formatMessage({ id: known.id, defaultMessage: known.defaultMessage })
      : intl.formatMessage({
          id: 'portal.auth.completeSignup.error.generic',
          defaultMessage:
            'Something went wrong with the invitation link. Please ask your administrator to resend the invitation.',
        })
    return (
      <PageShell>
        <ErrorContent error={message} invitationId={id} errorKind="token" branding={branding} />
      </PageShell>
    )
  }

  if (data.state === 'not-authenticated') {
    return (
      <PageShell>
        <NotAuthenticatedContent invitationId={id} branding={branding} />
        <FeatureHighlights />
      </PageShell>
    )
  }

  if (data.state === 'error') {
    return (
      <PageShell>
        <ErrorContent error={data.error} invitationId={id} branding={branding} />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <WelcomeContent
        invite={data.invite}
        passwordEnabled={data.passwordEnabled}
        branding={branding}
      />
      <FeatureHighlights />
    </PageShell>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background overflow-hidden px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 25% 15%, var(--primary), transparent),
            radial-gradient(ellipse 50% 80% at 80% 85%, var(--primary), transparent)
          `,
        }}
      />
      <div className="relative w-full max-w-md py-12">
        <div className="mb-8 flex items-center justify-center gap-2">
          <img src="/logo.png" alt="" className="h-6 w-6 rounded" />
          <span className="text-sm font-medium text-muted-foreground">Quackback</span>
        </div>
        {children}
      </div>
    </div>
  )
}

function WorkspaceIdentity({ branding }: { branding: InviteBranding }) {
  return (
    <div className="flex items-center justify-center gap-2.5">
      {branding.logoUrl ? (
        <img
          src={branding.logoUrl}
          alt={branding.workspaceName}
          className="h-8 w-8 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
          {branding.workspaceName.charAt(0).toUpperCase()}
        </div>
      )}
      <span className="text-lg font-semibold">{branding.workspaceName}</span>
    </div>
  )
}

function FeatureHighlights() {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {FEATURES.map(({ icon: Icon, id, defaultMessage }) => (
        <div
          key={id}
          className="flex items-center gap-1.5 rounded-full border border-border/30 bg-card/50 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm"
        >
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <FormattedMessage id={id} defaultMessage={defaultMessage} />
        </div>
      ))}
    </div>
  )
}

function NotAuthenticatedContent({
  invitationId,
  branding,
}: {
  invitationId: string
  branding: InviteBranding
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/80 p-8 text-center backdrop-blur-sm"
      style={{
        boxShadow:
          '0 0 80px -20px oklch(0.886 0.176 86 / 0.12), 0 20px 40px -12px rgb(0 0 0 / 0.08)',
      }}
    >
      <WorkspaceIdentity branding={branding} />
      <div className="mt-6 mb-6 h-px bg-border/50" />
      <h1 className="text-2xl font-bold tracking-tight">
        <FormattedMessage
          id="portal.auth.verifyMagicLink.invitedTitle"
          defaultMessage="You're invited!"
        />
      </h1>
      <p className="mt-2 text-muted-foreground">
        {branding.inviterName ? (
          <FormattedMessage
            id="portal.auth.completeSignup.invitedByJoinTeam"
            defaultMessage="{inviterName} invited you to join the team. Sign in to get started."
            values={{ inviterName: branding.inviterName }}
          />
        ) : (
          <FormattedMessage
            id="portal.auth.completeSignup.joinTeam"
            defaultMessage="Sign in to accept your invitation and get started with your team."
          />
        )}
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <a href={`/auth/login?callbackUrl=/complete-signup/${invitationId}`}>
          <Button className="w-full h-11">
            <FormattedMessage id="portal.auth.signIn" defaultMessage="Sign in" />
          </Button>
        </a>
        <a
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <FormattedMessage id="portal.auth.verifyMagicLink.goToHome" defaultMessage="Go to Home" />
        </a>
      </div>
    </div>
  )
}

function WelcomeContent({
  invite,
  passwordEnabled,
  branding,
}: {
  invite: {
    name: string | null
    email: string
    workspaceName: string
    inviterName: string | null
  }
  passwordEnabled: boolean
  branding: InviteBranding
}) {
  const { id } = Route.useParams()
  const intl = useIntl()
  const [name, setName] = useState(invite.name ?? '')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await accept(false)
  }

  async function accept(skipPassword: boolean) {
    const trimmedName = name.trim()

    if (trimmedName.length < 2) {
      setError(
        intl.formatMessage({
          id: 'portal.auth.completeSignup.nameTooShort',
          defaultMessage: 'Please enter your name (at least 2 characters)',
        })
      )
      return
    }
    if (!skipPassword && password && password.length < 8) {
      setError(
        intl.formatMessage({
          id: 'portal.auth.completeSignup.passwordTooShort',
          defaultMessage: 'Password must be at least 8 characters',
        })
      )
      return
    }

    setError('')
    setIsLoading(true)

    try {
      await acceptInvitationFn({ data: { invitationId: id, name: trimmedName } })

      if (!skipPassword && password.length >= 8) {
        await setPasswordFn({ data: { newPassword: password } }).catch(() => {})
      }

      window.location.href = '/admin'
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : intl.formatMessage({
              id: 'portal.auth.completeSignup.acceptFailedGeneric',
              defaultMessage: 'Failed to accept invitation',
            })
      if (message.includes('already been accepted')) {
        window.location.href = '/admin'
        return
      }
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/80 backdrop-blur-sm"
      style={{
        boxShadow:
          '0 0 80px -20px oklch(0.886 0.176 86 / 0.12), 0 20px 40px -12px rgb(0 0 0 / 0.08)',
      }}
    >
      <div className="p-8">
        <WorkspaceIdentity branding={branding} />
        <div className="mt-6 mb-6 h-px bg-border/50" />
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            <FormattedMessage id="portal.auth.completeSignup.welcome" defaultMessage="Welcome!" />
          </h1>
          <p className="mt-2 text-muted-foreground">
            {invite.inviterName ? (
              <FormattedMessage
                id="portal.auth.completeSignup.invitedBy"
                defaultMessage="Invited by {inviterName}"
                values={{ inviterName: invite.inviterName }}
              />
            ) : (
              <FormattedMessage
                id="portal.auth.completeSignup.completeSetup"
                defaultMessage="Complete your account setup to get started"
              />
            )}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email is fixed by the invite; a hidden username field lets
              password managers save the credential against it (and pairs
              with the password input for the a11y heuristic). */}
          <input type="hidden" name="email" value={invite.email} autoComplete="username" readOnly />

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              <FormattedMessage
                id="portal.auth.completeSignup.yourName"
                defaultMessage="Your name"
              />
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Jane Doe"
              autoComplete="name"
              autoFocus
              disabled={isLoading}
              className="h-11"
            />
          </div>

          {passwordEnabled && (
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                <FormattedMessage
                  id="portal.auth.completeSignup.setPassword"
                  defaultMessage="Set a password"
                />{' '}
                <span className="text-muted-foreground font-normal">
                  <FormattedMessage
                    id="portal.auth.completeSignup.optional"
                    defaultMessage="(optional)"
                  />
                </span>
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={intl.formatMessage({
                  id: 'portal.auth.completeSignup.passwordPlaceholder',
                  defaultMessage: 'At least 8 characters',
                })}
                autoComplete="new-password"
                disabled={isLoading}
                className="h-11"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || name.trim().length < 2}
            className="w-full h-11"
          >
            {isLoading ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <FormattedMessage
                id="portal.auth.completeSignup.getStarted"
                defaultMessage="Get started"
              />
            )}
          </Button>

          {passwordEnabled && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => accept(true)}
              disabled={isLoading}
              className="w-full text-muted-foreground"
            >
              <FormattedMessage
                id="portal.auth.completeSignup.skipPassword"
                defaultMessage="Skip password setup"
              />
            </Button>
          )}
        </form>
      </div>
    </div>
  )
}

type ErrorKind = 'token' | 'already-accepted' | 'generic'

function getErrorKind(error: string): ErrorKind {
  if (error.includes('already been accepted')) return 'already-accepted'
  if (error.includes('sign in') || error.includes('session has expired')) return 'token'
  return 'generic'
}

function ErrorContent({
  error,
  invitationId,
  errorKind,
  branding,
}: {
  error: string
  invitationId: string
  errorKind?: ErrorKind
  branding: InviteBranding
}) {
  const [retrying, setRetrying] = useState(false)
  const kind = errorKind ?? getErrorKind(error)

  return (
    <div
      className="overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/80 p-8 text-center backdrop-blur-sm"
      style={{
        boxShadow: '0 20px 40px -12px rgb(0 0 0 / 0.08)',
      }}
    >
      <WorkspaceIdentity branding={branding} />
      <div className="mt-6 mb-6 h-px bg-border/50" />
      {retrying ? (
        <div>
          <Spinner size="xl" className="border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">
            <FormattedMessage
              id="portal.auth.completeSignup.retrying"
              defaultMessage="Retrying..."
            />
          </p>
        </div>
      ) : (
        <div>
          <div className="text-destructive text-xl font-medium tracking-tight">
            <FormattedMessage
              id="portal.auth.completeSignup.unableToAccept"
              defaultMessage="Unable to accept invitation"
            />
          </div>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <div className="mt-6 flex flex-col gap-3">
            {kind === 'already-accepted' ? (
              <a href="/admin">
                <Button className="w-full h-11">
                  <FormattedMessage
                    id="portal.auth.completeSignup.goToDashboard"
                    defaultMessage="Go to Dashboard"
                  />
                </Button>
              </a>
            ) : kind === 'token' ? (
              <a href={`/auth/login?callbackUrl=/complete-signup/${invitationId}`}>
                <Button className="w-full h-11">
                  <FormattedMessage id="portal.auth.signIn" defaultMessage="Sign in" />
                </Button>
              </a>
            ) : (
              <Button
                className="h-11"
                onClick={() => {
                  setRetrying(true)
                  window.location.reload()
                }}
              >
                <FormattedMessage
                  id="portal.auth.completeSignup.tryAgain"
                  defaultMessage="Try Again"
                />
              </Button>
            )}
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <FormattedMessage
                id="portal.auth.verifyMagicLink.goToHome"
                defaultMessage="Go to Home"
              />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
