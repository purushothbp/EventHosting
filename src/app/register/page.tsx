'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  otp?: string;
};

type Step = 'register' | 'verify' | 'success';

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('register');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If we have a field-specific error, highlight that field
        if (data.field) {
          // You can add field-specific error handling here if needed
          // For now, we'll just show the error message
          throw new Error(data.message);
        }
        throw new Error(data.message || 'Something went wrong');
      }

      // Move to OTP verification step if registration was successful
      if (data.success) {
        setStep('verify');
        toast({
          title: 'Verification',
          description: data.message || 'Verification OTP sent to your email',
        });
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Show user-friendly error messages
      const errorMessage = error.message || 'Failed to register. Please try again.';
      
      toast({
        title: 'Registration Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // If it's a duplicate email error, suggest logging in
      if (errorMessage.includes('already exists') || errorMessage.includes('already registered')) {
        toast({
          title: 'Account Exists',
          description: 'Would you like to log in instead?',
          action: (
            <Link href="/login" className="text-white underline">
              Go to Login
            </Link>
          ),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.otp) {
      toast({
        title: 'Error',
        description: 'Please enter the OTP',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setStep('success');
      toast({
        title: 'Success',
        description: 'Email verified successfully! Redirecting to login...',
      });

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify OTP',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderRegisterForm = () => (
    <div className="space-y-6">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
      
      <form className="mt-8 space-y-6" onSubmit={handleRegister}>
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="mt-1"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="mt-1"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="mt-1"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength={8}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Send Verification OTP'}
          </Button>
        </div>
      </form>
    </div>
  );

  const renderVerificationForm = () => (
    <div className="space-y-6">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a verification code to {formData.email}
        </p>
      </div>
      
      <form className="mt-8 space-y-6" onSubmit={handleVerify}>
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              className="mt-1 text-center text-xl tracking-widest"
              value={formData.otp}
              onChange={handleChange}
              disabled={loading}
              autoFocus
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep('register')}
            disabled={loading}
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Account'}
          </Button>
        </div>
      </form>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <svg
          className="h-6 w-6 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900">
        Account Verified!
      </h2>
      <p className="text-gray-600">
        Your account has been successfully verified. Redirecting to login...
      </p>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {step === 'register' && renderRegisterForm()}
        {step === 'verify' && renderVerificationForm()}
        {step === 'success' && renderSuccess()}
      </div>
    </div>
  );
}