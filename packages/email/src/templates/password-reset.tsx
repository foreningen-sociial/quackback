import { Button, Heading, Link, Section, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography, button, utils } from './shared-styles'

interface PasswordResetEmailProps {
  resetLink: string
  logoUrl?: string
}

export function PasswordResetEmail({ resetLink, logoUrl }: PasswordResetEmailProps) {
  return (
    <EmailLayout preview="Nulstil din Quackback-adgangskode" logoUrl={logoUrl}>
      {/* Content */}
      <Heading style={{ ...typography.h1, textAlign: 'center' }}>Nulstil din adgangskode</Heading>
      <Text style={{ ...typography.text, textAlign: 'center' }}>
        Klik på knappen nedenfor for at angive en ny adgangskode. Dette link udløber om 24 timer.
      </Text>

      {/* CTA Button */}
      <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
        <Button style={button.primary} href={resetLink}>
          Nulstil adgangskode
        </Button>
      </Section>

      {/* Fallback Link */}
      <Text style={typography.textSmall}>
        Eller kopiér og indsæt dette link i din browser:{' '}
        <Link href={resetLink} style={utils.link}>
          {resetLink}
        </Link>
      </Text>

      {/* Footer */}
      <TransactionalFooter>
        Hvis du ikke har anmodet om at nulstille din adgangskode, kan du roligt ignorere denne
        e-mail.
      </TransactionalFooter>
    </EmailLayout>
  )
}
