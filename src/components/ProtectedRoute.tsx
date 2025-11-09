// src/components/ProtectedRoute.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: 'user' | 'coordinator' | 'admin' | 'super-admin';
};

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'user' 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return <Loader2 className="animate-spin" />;
  }

  // Check user role
  const roles = ['user', 'coordinator', 'admin', 'super-admin'];
  const userRoleIndex = roles.indexOf(user?.role || '');
  const requiredRoleIndex = roles.indexOf(requiredRole);

  if (userRoleIndex < requiredRoleIndex) {
    router.push('/unauthorized');
    return null;
  }

  return <>{children}</>;
}