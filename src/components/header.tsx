// src/components/header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Menu,
  LayoutDashboard,
  User,
  LogOut,
  Home,
  Building,
  LogIn,
  UserPlus,
  Loader2,
  NotebookPen,
  Bell,
} from 'lucide-react';
import { GrookLogo } from '@/components/GrookLogo';

type NavLink = {
  href: string;
  label: string;
  icon: React.ElementType;
  requiresAuth?: boolean;
  matchExact?: boolean;
  requiredRole?: string[];
};

const navLinks: NavLink[] = [
  { 
    href: '/events', 
    label: 'Events', 
    icon: Home,
    matchExact: false
  },
  {
    href: '/blog',
    label: 'Blog',
    icon: NotebookPen,
    matchExact: false,
  },
  { 
    href: '/dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    requiresAuth: true,
    matchExact: true
  },
  { 
    href: '/admin/dashboard', 
    label: 'Admin', 
    icon: Building, 
    requiresAuth: true,
    matchExact: false,
    requiredRole: ['super-admin', 'admin', 'coordinator', 'staff']
  },
  { 
    href: '/profile', 
    label: 'Profile', 
    icon: User, 
    requiresAuth: true,
    matchExact: false
  },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [upcomingRegistrations, setUpcomingRegistrations] = useState<Array<{ id: string; teamSize: number; event?: { title?: string; date?: string; location?: string } | null }>>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const { toast } = useToast();

  const isActive = (href: string, exactMatch = false) => {
    if (exactMatch) {
      return pathname === href;
    }
    return pathname === href || 
           pathname.startsWith(`${href}/`) || 
           (href !== '/' && pathname === `${href}`);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({ redirect: false });
      router.push('/login');
      router.refresh();
      toast.success('Logged out.');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredNavLinks = navLinks.filter((link) => {
    if (link.requiresAuth && status !== 'authenticated') return false;
    if (link.requiredRole && status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      return link.requiredRole.includes(userRole);
    }
    return true;
  });

  const userRole = (session?.user as any)?.role;
  const canUseOrgBranding = userRole && ['admin', 'coordinator', 'staff'].includes(userRole);
  const organizationName = canUseOrgBranding && (session?.user as any)?.organizationName
    ? (session?.user as any)?.organizationName
    : 'Grook';
  const organizationLogo = canUseOrgBranding ? (session?.user as any)?.organizationLogo : null;

  useEffect(() => {
    setLogoFailed(false);
  }, [organizationLogo, session?.user]);

  useEffect(() => {
    const loadNotifications = async () => {
      if (status !== 'authenticated') {
        setUpcomingRegistrations([]);
        return;
      }
      try {
        setLoadingNotifications(true);
        const response = await fetch('/api/registrations?scope=upcoming');
        if (!response.ok) return;
        const data = await response.json();
        setUpcomingRegistrations(data.registrations || []);
      } catch (error) {
        console.error('Failed to load registrations', error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    loadNotifications();
  }, [status]);

  if (!isMounted) {
    return <HeaderSkeleton />;
  }

  const shouldShowOrgLogo = Boolean(organizationLogo) && !logoFailed;
  const notificationCount = upcomingRegistrations.length;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 shadow-lg backdrop-blur-xl dark:bg-slate-900/80">
      <div className="container flex h-14 sm:h-16 items-center px-4 md:px-6">
        {/* Desktop Navigation */}
        <div className="mr-4 hidden md:flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-3 rounded-full border border-white/40 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur">
            {shouldShowOrgLogo ? (
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/40 bg-white/60 shadow">
                <img
                  src={organizationLogo}
                  alt={organizationName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    setLogoFailed(true);
                  }}
                />
              </span>
            ) : (
              <GrookLogo compact />
            )}
            <span className="hidden text-base font-bold uppercase tracking-[0.3em] text-slate-800 sm:inline">
              {organizationName}
            </span>
          </Link>
          <nav className="flex items-center space-x-1 text-sm font-medium">
            {filteredNavLinks.map(({ href, label, matchExact = false }) => {
              const active = isActive(href, matchExact);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'px-3 py-2 rounded-md transition-colors',
                    active
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground/80 hover:bg-accent/50',
                    'text-sm font-medium'
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <button
            onClick={() => setIsSheetOpen(true)}
            className="p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </button>
        </div>

        <div className="flex-1 flex items-center justify-end space-x-4">
          {status === 'loading' ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : status === 'authenticated' ? (
            <div className="flex items-center space-x-4">
              {status === 'authenticated' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                          {notificationCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
                    <DropdownMenuLabel>Upcoming registrations</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {loadingNotifications && (
                      <DropdownMenuItem className="text-muted-foreground text-sm">
                        Checking events...
                      </DropdownMenuItem>
                    )}
                    {!loadingNotifications && notificationCount === 0 && (
                      <DropdownMenuItem className="text-muted-foreground text-sm">
                        No upcoming events yet.
                      </DropdownMenuItem>
                    )}
                    {upcomingRegistrations.map((registration) => (
                      <DropdownMenuItem key={registration.id} className="flex flex-col items-start gap-0">
                        <p className="text-sm font-medium">{registration.event?.title || 'Event'}</p>
                        {registration.event?.date && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(registration.event.date).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {registration.teamSize > 1
                            ? `Team of ${registration.teamSize}`
                            : 'Solo registration'}
                        </p>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button
                variant="ghost"
                className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full"
                onClick={() => router.push('/profile')}
              >
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                  <AvatarImage
                    src={session.user?.image || ''}
                    alt={session.user?.name || 'User'}
                  />
                  <AvatarFallback>
                    {getUserInitials(session.user?.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/login')}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </Button>
              <Button
                size="sm"
                onClick={() => router.push('/register')}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm">
            <div className="flex h-full flex-col bg-background border-r">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <Link
                    href="/"
                    className="flex items-center space-x-2"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      {organizationLogo && !logoFailed ? (
                        <img
                          src={organizationLogo}
                          alt={organizationName}
                          className="h-8 w-8 rounded-md"
                          onError={() => setLogoFailed(true)}
                        />
                      ) : (
                        <GrookLogo compact />
                      )}
                      <span className="text-lg font-bold uppercase tracking-[0.3em]">
                        {organizationName}
                      </span>
                    </span>
                  </Link>
                  <button
                    onClick={() => setIsSheetOpen(false)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <span className="sr-only">Close menu</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <nav className="flex-1 space-y-1 p-4 bg-white">
                {filteredNavLinks.map(({ href, label, icon: Icon, matchExact = false }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsSheetOpen(false)}
                    className={cn(
                      'flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium',
                      isActive(href, matchExact)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Link>
                ))}
              </nav>
              <div className="border-t p-4">
                {status === 'authenticated' ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing out...
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsSheetOpen(false);
                        router.push('/login');
                      }}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign in
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setIsSheetOpen(false);
                        router.push('/register');
                      }}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create account
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center px-4 md:px-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </header>
  );
}
