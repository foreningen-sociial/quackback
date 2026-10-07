import { Button, Column, Heading, Row, Section, Text } from '@react-email/components'
import { EmailLayout, NotificationFooter } from './email-layout'
import { typography, button, colors } from './shared-styles'

export interface PostMentionEmailProps {
  mentionerName: string
  postTitle: string
  /** Paragraph context for the mention. Empty string suppresses the quote block. */
  excerpt: string
  postUrl: string
  workspaceName: string
  unsubscribeUrl?: string
  preferencesUrl?: string
  logoUrl?: string
}

export function PostMentionEmail({
  mentionerName,
  postTitle,
  excerpt,
  postUrl,
  workspaceName,
  unsubscribeUrl,
  preferencesUrl,
  logoUrl,
}: PostMentionEmailProps) {
  const displayName = mentionerName || 'Anonym bruger'
  const hasExcerpt = excerpt.length > 0

  return (
    <EmailLayout
      preview={`${displayName} nævnte dig i "${postTitle}"`}
      logoUrl={logoUrl}
      logoAlt={workspaceName}
    >
      {/* Content */}
      <Heading style={typography.h1}>Du blev nævnt</Heading>
      <Text style={typography.text}>
        {displayName} nævnte dig i {postTitle}.
      </Text>

      {/* Post Title */}
      <Section
        style={{
          backgroundColor: colors.surfaceMuted,
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '16px',
        }}
      >
        <Text
          style={{
            ...typography.textSmall,
            marginTop: '0',
            marginBottom: '4px',
            color: colors.textMuted,
          }}
        >
          Forslag
        </Text>
        <Text style={{ ...typography.text, marginTop: '0', marginBottom: '0', fontWeight: '600' }}>
          {postTitle}
        </Text>
      </Section>

      {/* Excerpt — using Row/Column instead of border-left for Outlook compatibility */}
      {hasExcerpt ? (
        <Row style={{ marginBottom: '24px' }}>
          <Column style={{ width: '3px', backgroundColor: colors.primary, borderRadius: '2px' }} />
          <Column style={{ paddingLeft: '16px' }}>
            <Text
              style={{
                ...typography.text,
                marginTop: '0',
                marginBottom: '0',
                fontStyle: 'italic',
              }}
            >
              &quot;{excerpt}&quot;
            </Text>
          </Column>
        </Row>
      ) : null}

      {/* CTA Button */}
      <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
        <Button style={button.primary} href={postUrl}>
          Se forslag
        </Button>
      </Section>

      {/* Footer */}
      {unsubscribeUrl ? (
        <NotificationFooter
          reason={`Du modtager denne e-mail, fordi du blev nævnt hos ${workspaceName}.`}
          unsubscribeUrl={unsubscribeUrl}
          preferencesUrl={preferencesUrl}
        />
      ) : (
        <Text style={typography.footer}>
          Du modtager denne e-mail, fordi du blev nævnt hos {workspaceName}.
        </Text>
      )}
    </EmailLayout>
  )
}
