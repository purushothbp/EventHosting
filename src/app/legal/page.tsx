'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const sections = [
  {
    id: 'user-consent',
    title: 'User Consent Notice',
    content: [
      'Grook acts only as a facilitator between users and event hosts.',
      'Event content, management, logistics, permissions, and safety are solely the responsibility of the host.',
      'Users must verify event details and attend at their own discretion.',
      'Refunds are permitted only under defined conditions as per the Cancellation & Refund Policy.',
      'Grook may contact you via email, SMS, or WhatsApp regarding booking confirmations, reminders, or event updates.',
      'You are responsible for providing accurate personal details during booking.',
      'Misconduct, illegal activities, or violation of event rules may result in denied entry without refund.',
      'By booking, you consent to Grook’s Terms of Service, Privacy Policy, Refund Policy & Safety Disclaimer.',
    ],
  },
];

const hostResponsibilities = [
  'Provide accurate event details including date, time, location, pricing, capacity limits, and event requirements.',
  'Ensure a safe experience for attendees and maintain discipline at the venue.',
  'Respond promptly to participant queries and maintain clear communication.',
  'Manage logistics, permissions, and safety protocols.',
  'Avoid fraudulent activity, identity misrepresentation, or miscommunication.',
  'Maintain professional behavior with participants, partners, and Grook representatives.',
];

const platformPolicyItems = [
  {
    title: 'Nature of Service',
    text: 'Grook.in functions strictly as a facilitator and does not create, manage, execute, supervise, or assume ownership of any event hosted on the platform.',
  },
  {
    title: 'User Responsibility',
    text: 'Users must provide accurate personal details while booking events. Access can be denied if fraudulent data is detected.',
  },
  {
    title: 'Information Accuracy',
    text: 'Event content is uploaded by hosts. Grook.in is not liable for discrepancies or changes.',
  },
  {
    title: 'Platform Liability',
    text: 'Grook.in is not liable for event execution quality, schedule changes, personal loss, or host actions. The platform provides booking infrastructure only.',
  },
];

export default function LegalPage() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <header className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Official Platform Policies
        </p>
        <h1 className="text-4xl font-bold">Grook Legal & Compliance</h1>
        <p className="text-muted-foreground">
          Effective Date: 01/01/2026 · Last Updated: 08/12/2025
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card id="user-consent">
          <CardHeader>
            <CardTitle>User Booking Consent</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              {sections[0].content.map((item, index) => (
                <li key={`consent-${index}`}>{item}</li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card id="host-agreement">
          <CardHeader>
            <CardTitle>Host Agreement Policy – Grook.in</CardTitle>
            <p className="text-sm text-muted-foreground">Effective 01/01/2026</p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              By creating, listing, or managing an event on Grook.in, the Host acknowledges
              this agreement and confirms compliance with all requirements.
            </p>
            <h3 className="font-semibold text-foreground">Eligibility</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>Host must be 18+ and provide valid identification.</li>
              <li>Event details must be factual and not misleading.</li>
              <li>Host must comply with local laws, licensing, and safety norms.</li>
            </ul>
            <h3 className="font-semibold text-foreground">Responsibilities</h3>
            <ul className="list-disc space-y-1 pl-5">
              {hostResponsibilities.map((item, index) => (
                <li key={`host-${index}`}>{item}</li>
              ))}
            </ul>
            <p>
              Ticket revenue is settled within T+48 hours (excluding weekends/holidays)
              minus platform & gateway fees. Host cancellations trigger 100% refunds to attendees.
            </p>
            <p>
              Grook may suspend hosts for misrepresentation, fraud, safety negligence,
              or illegal activities. Grook acts solely as facilitator; hosts are fully
              accountable for event execution, safety, and compliance.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card id="platform-policies">
        <CardHeader>
          <CardTitle>Grook.in Policies & Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[420px] pr-4">
            <div className="space-y-6 text-sm text-muted-foreground">
              {platformPolicyItems.map((item) => (
                <section key={item.title}>
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p>{item.text}</p>
                </section>
              ))}
              <section>
                <h3 className="text-base font-semibold text-foreground">Cancellation & Refunds</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Participant-initiated cancellations are non-refundable.</li>
                  <li>Host cancellations trigger 100% refunds via the original payment method.</li>
                  <li>Rescheduled events keep tickets valid; refunds require host approval.</li>
                  <li>Refund timelines depend on bank/payment gateways.</li>
                </ul>
              </section>
              <section>
                <h3 className="text-base font-semibold text-foreground">Privacy & Data</h3>
                <p>
                  Grook collects personal details, contact info, payment metadata, and attendance records to
                  deliver bookings, reminders, and certificates. Data is shared only with the corresponding event host.
                </p>
                <p>
                  Payment data is handled by certified gateways. For support contact{' '}
                  <a className="text-primary underline" href="mailto:teamgrook@gmail.com">
                    teamgrook@gmail.com
                  </a>.
                </p>
              </section>
              <section>
                <h3 className="text-base font-semibold text-foreground">Safety & Conduct</h3>
                <p>
                  Hosts are responsible for venue safety, permissions, and emergency response. Participants must follow
                  venue rules; misconduct can result in removal without refund. Grook mediates grievances but does not
                  guarantee outcomes.
                </p>
              </section>
              <section>
                <h3 className="text-base font-semibold text-foreground">Payments & Ticketing</h3>
                <p>
                  Bookings are confirmed after successful payment and email/SMS ticket delivery. Tickets are non-transferable
                  unless explicitly allowed by the host. Platform fees are non-refundable.
                </p>
              </section>
              <section>
                <h3 className="text-base font-semibold text-foreground">Final Notice</h3>
                <p>
                  Grook.in is a technological service provider and not the organizer of any event. By using the platform,
                  you acknowledge Grook’s intermediary role and agree to all policies herein.
                </p>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
