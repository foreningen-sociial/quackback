import { Heading, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography } from './shared-styles'

interface SignupNotAllowedEmailProps {
  workspaceName?: string
  logoUrl?: string
}

/**
 * Why no sign-in link arrived.
 *
 * The workspace refuses to open an account for this address, and the HTTP
 * response deliberately does not say so: an endpoint that answered differently
 * per address would tell any unauthenticated caller which addresses hold
 * accounts here. The inbox is the one channel that reaches only the person the
 * answer is about, so the refusal is delivered here instead.
 *
 * Carries no link and no code. There is nothing to grant, which is the point:
 * a message with no capability in it can be mailed to an address nobody has
 * proven they own.
 */
export function SignupNotAllowedEmail({ workspaceName, logoUrl }: SignupNotAllowedEmailProps) {
  const where = workspaceName ? `${workspaceName}` : 'denne arbejdsplads'
  return (
    <EmailLayout preview="Om din login-anmodning" logoUrl={logoUrl} showPoweredBy={false}>
      <Heading style={{ ...typography.h1, textAlign: 'center' }}>
        Ingen konto for denne adresse
      </Heading>
      <Text style={{ ...typography.text, textAlign: 'center' }}>
        Nogen har anmodet om et login-link til denne e-mailadresse hos {where}.
      </Text>
      <Text style={{ ...typography.text, textAlign: 'center' }}>
        Der findes ingen konto her til denne adresse, og {where} accepterer ikke nye konti. Bed en
        administrator om at invitere dig, og log derefter ind med den adresse, de inviterer.
      </Text>

      <TransactionalFooter>
        Hvis du ikke har anmodet om dette, kan du roligt ignorere denne e-mail. Der blev ikke
        oprettet nogen konto, og intet er blevet ændret.
      </TransactionalFooter>
    </EmailLayout>
  )
}
