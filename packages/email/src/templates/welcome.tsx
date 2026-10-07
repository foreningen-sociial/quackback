import { Button, Column, Heading, Row, Section, Text } from '@react-email/components'
import { EmailLayout, TransactionalFooter } from './email-layout'
import { typography, button, colors } from './shared-styles'

interface WelcomeEmailProps {
  name: string
  workspaceName: string
  dashboardUrl: string
  logoUrl?: string
}

export function WelcomeEmail({ name, workspaceName, dashboardUrl, logoUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout
      preview={`Velkommen til ${workspaceName} på Quackback`}
      logoUrl={logoUrl}
      logoAlt={workspaceName}
    >
      {/* Content */}
      <Heading style={typography.h1}>Velkommen til Quackback!</Heading>
      <Text style={typography.text}>
        Hej {name}, din arbejdsplads <strong>{workspaceName}</strong> er klar. Begynd at indsamle og
        håndtere kundeforslag i dag.
      </Text>

      {/* Features List - using Row/Column instead of spans for email compatibility */}
      <Section style={{ marginBottom: '24px' }}>
        {[
          'Opret forslagskategorier',
          'Inviter dit team',
          'Del din offentlige udviklingsplan',
          'Forbind GitHub, Slack og Discord',
        ].map((feature) => (
          <Row key={feature} style={{ marginBottom: '4px' }}>
            <Column style={{ width: '28px', verticalAlign: 'top' }}>
              <Text style={checkIcon}>&#10003;</Text>
            </Column>
            <Column>
              <Text style={featureText}>{feature}</Text>
            </Column>
          </Row>
        ))}
      </Section>

      {/* CTA Button */}
      <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Button style={button.primary} href={dashboardUrl}>
          Gå til dashboard
        </Button>
      </Section>

      {/* Footer */}
      <TransactionalFooter>
        God fornøjelse med indsamlingen!
        <br />
        Quackback-teamet
      </TransactionalFooter>
    </EmailLayout>
  )
}

const checkIcon = {
  color: colors.primary,
  fontSize: '15px',
  fontWeight: '700' as const,
  lineHeight: '28px',
  marginTop: '0',
  marginBottom: '0',
}

const featureText = {
  color: colors.text,
  fontSize: '15px',
  lineHeight: '28px',
  marginTop: '0',
  marginBottom: '0',
}
