import { Button, Heading, Link, Section, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography, button, utils } from './shared-styles'

interface InvitationEmailProps {
  invitedByName: string
  inviteeName?: string
  organizationName: string
  inviteLink: string
  logoUrl?: string
}

export function InvitationEmail({
  invitedByName,
  inviteeName,
  organizationName,
  inviteLink,
  logoUrl,
}: InvitationEmailProps) {
  return (
    <EmailLayout
      preview={`Bliv en del af ${organizationName} på Quackback`}
      logoUrl={logoUrl}
      logoAlt={organizationName}
    >
      {/* Content */}
      <Heading style={typography.h1}>
        {inviteeName ? `Hej ${inviteeName}, du er inviteret!` : 'Du er inviteret!'}
      </Heading>
      <Text style={typography.text}>
        <strong>{invitedByName}</strong> har inviteret dig til at blive en del af{' '}
        <strong>{organizationName}</strong> på Quackback.
      </Text>

      {/* CTA Button */}
      <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
        <Button style={button.primary} href={inviteLink}>
          Accepter invitation
        </Button>
      </Section>

      {/* Fallback Link */}
      <Text style={typography.textSmall}>
        Eller kopiér og indsæt dette link i din browser:{' '}
        <Link href={inviteLink} style={utils.link}>
          {inviteLink}
        </Link>
      </Text>

      {/* Footer */}
      <TransactionalFooter>
        Hvis du ikke forventede denne invitation, kan du ignorere denne e-mail.
      </TransactionalFooter>
    </EmailLayout>
  )
}
