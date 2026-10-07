import { Body, Head, Html, Preview, Text } from '@react-email/components'

export interface ConversationClosedEmailProps {
  workspaceName: string
  variant: 'closed' | 'auto_closed'
  viewUrl?: string
  csatPrompt?: string
  ratingUrls?: readonly [string, string, string, string, string]
}

const CSAT_FACES = ['😞', '🙁', '😐', '🙂', '😄'] as const

const page: React.CSSProperties = {
  backgroundColor: '#ffffff',
  color: '#1d2939',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: '15px',
  lineHeight: '1.65',
  margin: 0,
  padding: '24px 8px 32px',
}

const muted: React.CSSProperties = {
  color: '#667085',
  fontSize: '13px',
  lineHeight: '1.55',
}

export function ConversationClosedEmail({
  workspaceName,
  variant,
  viewUrl,
  csatPrompt,
  ratingUrls,
}: ConversationClosedEmailProps) {
  const intro =
    variant === 'auto_closed'
      ? 'Denne samtale blev lukket, fordi vi ikke har hørt fra dig.'
      : `${workspaceName} markerede denne samtale som løst.`
  const followUp =
    variant === 'auto_closed'
      ? 'Mangler du mere hjælp? Svar blot på denne e-mail, så genåbnes samtalen.'
      : 'Ikke løst endnu? Svar blot på denne e-mail, så genåbnes samtalen.'

  return (
    <Html>
      <Head />
      <Preview>{intro}</Preview>
      <Body style={page}>
        <Text
          style={{ margin: '0 0 13px', color: '#1d2939', fontSize: '15px', lineHeight: '1.65' }}
        >
          {intro}
        </Text>
        {ratingUrls ? (
          <>
            <Text style={{ margin: '20px 0 8px', color: '#1d2939', fontSize: '15px' }}>
              {csatPrompt || 'Hvordan klarede vi os?'}
            </Text>
            <Text style={{ margin: '0 0 16px', fontSize: '28px', letterSpacing: '8px' }}>
              {CSAT_FACES.map((face, i) => (
                <a key={face} href={ratingUrls[i]} style={{ textDecoration: 'none' }}>
                  {face}
                </a>
              ))}
            </Text>
          </>
        ) : null}
        <Text style={muted}>{followUp}</Text>
        {viewUrl ? (
          <Text style={muted}>
            <a href={viewUrl} style={{ color: '#667085' }}>
              Se den online
            </a>
          </Text>
        ) : null}
      </Body>
    </Html>
  )
}
