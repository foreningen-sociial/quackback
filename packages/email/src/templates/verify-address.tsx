import { Heading, Section, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography, utils } from './shared-styles'

interface VerifyAddressEmailProps {
  code: string
  workspaceName?: string
  logoUrl?: string
}

/**
 * Proves control of an address someone is adding to, or moving, their account.
 *
 * Deliberately NOT the sign-in template. That one is headed "Sign in to
 * Quackback", and showing it to someone who just asked to change their address
 * reads as a phishing attempt — the action they took and the mail they received
 * would not match. Same code presentation, different sentence.
 *
 * There is no link. The person is already in the app, on the page that asked
 * for the address, so a code they type back keeps them in that context and
 * gives a cross-device link no chance to be intercepted.
 */
export function VerifyAddressEmail({ code, workspaceName, logoUrl }: VerifyAddressEmailProps) {
  const where = workspaceName ? ` til ${workspaceName}` : ''
  return (
    <EmailLayout preview={`Din bekræftelseskode${where}`} logoUrl={logoUrl}>
      <Heading style={{ ...typography.h1, textAlign: 'center' }}>Bekræft din e-mail</Heading>
      <Text style={{ ...typography.text, textAlign: 'center' }}>
        Indtast denne kode{where} for at bekræfte denne adresse. Den udløber om 10 minutter.
      </Text>
      <Section style={utils.codeBox}>
        <Text style={utils.code}>{code}</Text>
      </Section>
      <Text style={{ ...typography.footer, textAlign: 'center' }}>
        Hvis du ikke har bedt om dette, kan du ignorere det — intet ændres uden koden.
      </Text>
      <TransactionalFooter>
        Du modtager denne e-mail, fordi nogen har indtastet denne adresse på en konto. Den vil ikke
        blive brugt til noget, før den er bekræftet.
      </TransactionalFooter>
    </EmailLayout>
  )
}
