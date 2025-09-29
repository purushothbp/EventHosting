'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Activity,
  Menu,
  LayoutDashboard,
  User,
  LogOut,
  Home,
  Building,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const navLinks = [
  { href: '/', label: 'Events', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function Header() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex px-2 md:px-4 h-14 sm:h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-headline text-base sm:text-lg">
              Nexus Events
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between px-0 md:px-2 md:justify-end">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0 w-64 sm:w-80">
                <Link href="/" className="mr-6 flex items-center space-x-2 mb-6">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <span className="font-bold font-headline text-base sm:text-lg">Nexus Events</span>
                </Link>
                <div className="flex flex-col space-y-2 sm:space-y-3 pt-4 sm:pt-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center space-x-2 sm:space-x-3 rounded-md p-2 sm:p-3 text-foreground/70 transition-colors hover:text-foreground"
                    >
                      <link.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-sm sm:text-base">{link.label}</span>
                    </Link>
                  ))}
                  <Link
                      href="/dashboard/branding"
                      className="flex items-center space-x-2 sm:space-x-3 rounded-md p-2 sm:p-3 text-foreground/70 transition-colors hover:text-foreground"
                    >
                      <Building className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-sm sm:text-base">Branding</span>
                    </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                  <AvatarImage
                    src={userAvatar?.imageUrl}
                    alt="User avatar"
                    data-ai-hint={userAvatar?.imageHint}
                  />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Alex Doe</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    alex.doe@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/branding">
                  <Building className="mr-2 h-4 w-4" />
                  <span>Branding</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
