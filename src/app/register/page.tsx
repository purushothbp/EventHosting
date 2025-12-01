'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff } from 'lucide-react';

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  otp?: string;
};

type Step = 'register' | 'verify';

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
  const [showPasswords, setShowPasswords] = useState({ password: false, confirm: false });
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
      toast.error('Passwords do not match.');
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
        toast.info(data.message || 'Verification OTP sent to your email.');
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Show user-friendly error messages
      const errorMessage = error.message || 'Failed to register. Please try again.';
      
      toast.error(errorMessage, {
        title: 'Registration error',
      });
      
      // If it's a duplicate email error, suggest logging in
      if (errorMessage.includes('already exists') || errorMessage.includes('already registered')) {
        toast.info('This account already exists. You can log in instead.', {
          title: 'Account exists',
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
      toast.warning('Please enter the OTP.');
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

      const signInResult = await signIn('credentials', {
        redirect: false,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      toast.success('Account created successfully! You are now logged in.');
      router.push('/');
      router.refresh();

    } catch (error: any) {
      toast.error(error.message || 'Failed to complete registration.');
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
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPasswords.password ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="mt-1 pr-10"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, password: !prev.password }))
                }
                tabIndex={-1}
              >
                {showPasswords.password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="mt-1 pr-10"
                value={formData.confirmPassword}
                onChange={handleChange}
                minLength={8}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                }
                tabIndex={-1}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {step === 'register' && renderRegisterForm()}
        {step === 'verify' && renderVerificationForm()}
      </div>
    </div>
  );
}
