import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CertificateVerifyPage({ params }: PageProps) {
  const { id } = await params;
  const res = await fetch(`${process.env.NEXTAUTH_URL || ''}/api/certificates/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return notFound();
  }

  const data = await res.json();
  if (!data.valid) {
    return notFound();
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-10">
      <h1 className="text-2xl font-bold">Certificate Verification</h1>
      <div className="rounded-lg border bg-white/80 p-6 shadow">
        <div className="flex flex-col gap-2">
          <div className="text-sm text-muted-foreground">Certificate ID</div>
          <div className="font-mono text-lg">{data.certificateId}</div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground">Participant</div>
            <div className="font-semibold">{data.participantName}</div>
            <div className="text-sm text-muted-foreground break-all">{data.participantEmail}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Event</div>
            <div className="font-semibold">{data.eventTitle}</div>
            {data.eventDate && (
              <div className="text-sm text-muted-foreground">
                {new Date(data.eventDate).toLocaleDateString()}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Organization</div>
            <div className="font-semibold">{data.organizationName || 'Grook'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Issued</div>
            <div className="font-semibold">
              {data.issuedAt ? new Date(data.issuedAt).toLocaleString() : '—'}
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-emerald-700 border border-emerald-200">
          Status: Valid
        </div>
      </div>
    </div>
  );
}
