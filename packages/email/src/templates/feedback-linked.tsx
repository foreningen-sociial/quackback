import { Button, Heading, Section, Text } from '@react-email/components'
import { EmailLayout, NotificationFooter } from './email-layout'
import { typography, button, colors } from './shared-styles'

interface FeedbackLinkedEmailProps {
  recipientName?: string
  postTitle: string
  postUrl: string
  workspaceName: string
  unsubscribeUrl: string
  preferencesUrl?: string
  attributedByName?: string
  logoUrl?: string
}

export function FeedbackLinkedEmail({
  recipientName,
  postTitle,
  postUrl,
  workspaceName,
  unsubscribeUrl,
  preferencesUrl,
  attributedByName,
  logoUrl,
}: FeedbackLinkedEmailProps) {
  const greeting = recipientName ? `Tak ${recipientName}!` : 'Tak!'
  const attribution = attributedByName
    ? ` ${attributedByName} fra ${workspaceName}-teamet har knyttet dit forslag til et opslag.`
    : ` Dit forslag er blevet knyttet til et opslag hos ${workspaceName}.`

  return (
    <EmailLayout
      preview={`Dit forslag er blevet knyttet til "${postTitle}"`}
      logoUrl={logoUrl}
      logoAlt={workspaceName}
    >
      {/* Content */}
      <Heading style={typography.h1}>Dit forslag bliver nu fulgt!</Heading>
      <Text style={typography.text}>
        {greeting}
        {attribution} Du vil modtage opdateringer, når status ændres, eller der kommer nye
        kommentarer.
      </Text>

      {/* Post Title */}
      <Section
        style={{
          backgroundColor: colors.surfaceMuted,
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '24px',
        }}
      >
        <Text style={{ ...typography.text, marginTop: '0', marginBottom: '0', fontWeight: '600' }}>
          {postTitle}
        </Text>
      </Section>

      {/* CTA Button */}
      <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
        <Button style={button.primary} href={postUrl}>
          Se forslag
        </Button>
      </Section>

      {/* Footer */}
      <NotificationFooter
        reason="Du modtager denne e-mail, fordi dit forslag blev knyttet til dette opslag."
        unsubscribeUrl={unsubscribeUrl}
        preferencesUrl={preferencesUrl}
      />
    </EmailLayout>
  )
}
