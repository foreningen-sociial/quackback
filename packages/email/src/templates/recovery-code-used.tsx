import { Heading, Section, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography } from './shared-styles'

interface RecoveryCodeUsedEmailProps {
  workspaceName?: string
  ipAddress?: string | null
  userAgent?: string | null
  occurredAt: string
  logoUrl?: string
}

/**
 * Security alert sent after a recovery code is consumed. Mirrors the
 * "new sign-in from unrecognised device" pattern most platforms send
 * — the recipient is the one whose code was used, so the email is
 * their canary against unauthorised access.
 */
export function RecoveryCodeUsedEmail({
  workspaceName,
  ipAddress,
  userAgent,
  occurredAt,
  logoUrl,
}: RecoveryCodeUsedEmailProps) {
  const workspaceLabel = workspaceName ? ` hos ${workspaceName}` : ''
  return (
    <EmailLayout
      preview={`En gendannelseskode blev brugt til at logge ind${workspaceLabel}`}
      logoUrl={logoUrl}
    >
      <Heading style={{ ...typography.h1, textAlign: 'center' }}>
        En gendannelseskode blev brugt
      </Heading>
      <Text style={{ ...typography.text, textAlign: 'center' }}>
        Nogen loggede ind på din konto{workspaceLabel} med en af dine gemte gendannelseskoder.
      </Text>

      <Section style={{ marginTop: '24px', marginBottom: '24px' }}>
        <Text style={typography.textSmall}>
          <strong>Hvornår:</strong> {occurredAt}
        </Text>
        {ipAddress ? (
          <Text style={typography.textSmall}>
            <strong>IP-adresse:</strong> {ipAddress}
          </Text>
        ) : null}
        {userAgent ? (
          <Text style={typography.textSmall}>
            <strong>Enhed:</strong> {userAgent}
          </Text>
        ) : null}
      </Section>

      <Text style={typography.text}>
        Hvis det var dig, behøver du ikke gøre noget. Koden er nu brugt og kan ikke genbruges.
      </Text>
      <Text style={typography.text}>
        Hvis det ikke var dig, så log ind og generér nye gendannelseskoder med det samme. Personen,
        der brugte koden, har nu en aktiv session — tilbagekald den fra dine
        sikkerhedsindstillinger.
      </Text>

      <TransactionalFooter>
        Du modtager denne e-mail, fordi en gendannelseskode på din konto lige er blevet brugt. Disse
        beskeder er obligatoriske og kan ikke slås fra.
      </TransactionalFooter>
    </EmailLayout>
  )
}
