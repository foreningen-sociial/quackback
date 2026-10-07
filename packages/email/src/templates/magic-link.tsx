import { Button, Heading, Hr, Section, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography, button, utils } from './shared-styles'

interface MagicLinkEmailProps {
  signInUrl: string
  code: string
  logoUrl?: string
}

/**
 * Sign-in email containing both a one-click magic link and a 6-digit code.
 *
 * The link is the lower-friction path on desktop; the code is the
 * cross-device fallback (start on desktop, open email on phone — type
 * the code on the device that started the flow). Either consumes the
 * verification record on the server, so the user can pick whichever is
 * convenient.
 */
export function MagicLinkEmail({ signInUrl, code, logoUrl }: MagicLinkEmailProps) {
  return (
    <EmailLayout preview="Dit loginlink" logoUrl={logoUrl}>
      <Heading style={{ ...typography.h1, textAlign: 'center' }}>Log ind på Quackback</Heading>
      <Text style={{ ...typography.text, textAlign: 'center' }}>
        Klik på knappen nedenfor for at gennemføre login.
      </Text>

      <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
        <Button style={button.primary} href={signInUrl}>
          Log ind
        </Button>
      </Section>

      <Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />

      <Text style={{ ...typography.text, textAlign: 'center' }}>
        Eller indtast denne kode på login-skærmen:
      </Text>

      <Section style={utils.codeBox}>
        <Text style={utils.code}>{code}</Text>
      </Section>

      <Text style={{ ...typography.textSmall, textAlign: 'center' }}>
        Linket og koden udløber om 10 minutter.
      </Text>

      <TransactionalFooter>
        Hvis du ikke har anmodet om dette, kan du roligt ignorere denne e-mail.
      </TransactionalFooter>
    </EmailLayout>
  )
}
