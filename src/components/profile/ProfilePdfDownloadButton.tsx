'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { ResumePDF } from '@/components/ResumePDF';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type ResumeProfile = React.ComponentProps<typeof ResumePDF>['profile'];

interface ProfilePdfDownloadButtonProps {
  profile: ResumeProfile;
}

export function ProfilePdfDownloadButton({ profile }: ProfilePdfDownloadButtonProps) {
  return (
    <PDFDownloadLink
      document={<ResumePDF profile={profile} />}
      fileName={`${profile.name?.toLowerCase().replace(/\s+/g, '-') || 'profile'}-resume.pdf`}
    >
      {({ loading }) => (
        <Button
          type="button"
          variant="secondary"
          className="inline-flex items-center gap-2 bg-white/10 text-white hover:bg-white/20"
          disabled={loading}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Preparing PDF...' : 'Download PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
