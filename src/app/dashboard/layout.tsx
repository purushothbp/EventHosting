import Header from '@/components/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-col">
      <main className="flex-1 items-center justify-center">{children}</main>
    </div>
  );
}
