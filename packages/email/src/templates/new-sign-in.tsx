import { Heading, Hr, Link, Section, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography, utils } from './shared-styles'

interface NewSignInEmailProps {
  workspaceName?: string
  occurredAt: string
  ipAddress?: string | null
  userAgent?: string | null
  location?: string | null
  settingsUrl?: string | null
  /** When true, skip the password CTA — the profile page hides PasswordForm. */
  ssoEnforced?: boolean
  logoUrl?: string
}

/**
 * "New device" sign-in notification — sent when an additional signed
 * device cookie is seen for the recipient's account. Browser/OS, IP
 * and location are shown as context; they are not the device identity.
 * The user is already signed in by the time this lands; the alert is
 * purely informational with a recovery path if it wasn't them.
 */
export function NewSignInEmail({
  workspaceName,
  occurredAt,
  ipAddress,
  userAgent,
  location,
  settingsUrl,
  ssoEnforced,
  logoUrl,
}: NewSignInEmailProps) {
  return (
    <EmailLayout preview="Der blev registreret et nyt login på din konto" logoUrl={logoUrl}>
      <Heading style={typography.h1}>Nyt login på din konto</Heading>
      <Text style={typography.text}>
        {workspaceName
          ? `Nogen har lige logget ind på din ${workspaceName}-konto fra en enhed, vi ikke har set før.`
          : 'Nogen har lige logget ind på din konto fra en enhed, vi ikke har set før.'}
      </Text>

      <Section style={utils.codeBox}>
        <Text style={typography.text}>
          <strong>Hvornår:</strong> {occurredAt}
        </Text>
        {ipAddress ? (
          <Text style={typography.text}>
            <strong>IP:</strong> {ipAddress}
          </Text>
        ) : null}
        {location ? (
          <Text style={typography.text}>
            <strong>Placering:</strong> {location}
          </Text>
        ) : null}
        {userAgent ? (
          <Text style={typography.text}>
            <strong>Enhed:</strong> {userAgent}
          </Text>
        ) : null}
      </Section>

      <Hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />

      <Text style={typography.text}>
        {ssoEnforced ? (
          'Hvis det var dig, behøver du ikke gøre noget. Hvis det ikke var dig, så skift din adgangskode hos din identitetsudbyder, og bed en administrator om at logge andre sessioner ud.'
        ) : (
          <>
            Hvis det var dig, behøver du ikke gøre noget. Hvis det ikke var dig,{' '}
            {settingsUrl ? (
              <>
                <Link href={settingsUrl} style={utils.link}>
                  angiv eller skift din adgangskode
                </Link>{' '}
                fra dine profilindstillinger — dette logger andre sessioner ud.
              </>
            ) : (
              'angiv eller skift din adgangskode fra dine profilindstillinger — dette logger andre sessioner ud.'
            )}
          </>
        )}
      </Text>

      <TransactionalFooter>
        Du modtager denne e-mail, fordi der blev registreret et nyt login på din konto. Disse
        beskeder er obligatoriske og kan ikke slås fra.
      </TransactionalFooter>
    </EmailLayout>
  )
}
