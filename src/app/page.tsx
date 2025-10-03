'use client';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12.5C5,8.75 8.36,5.73 12.19,5.73C14.03,5.73 15.6,6.33 16.8,7.38L19.09,5.19C17.21,3.56 14.86,2.5 12.19,2.5C7.1,2.5 3.16,6.58 3.16,12.5C3.16,18.42 7.1,22.5 12.19,22.5C17.6,22.5 21.5,18.53 21.5,12.71C21.5,12.09 21.43,11.59 21.35,11.1Z"
    />
  </svg>
);


export default function LoginPage() {
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Login successful!",
      description: "You have successfully logged in.",
    });
    // In a real app, this would redirect to the dashboard
    // For now, we can use: window.location.href = '/dashboard';
  };

  const handleGoogleLogin = () => {
    toast({
      title: "Redirecting to Google...",
      description: "Please follow the instructions to sign in with Google.",
    });
    // In a real app, this would initiate the OAuth flow.
    // For example: window.location.href = '/api/auth/google';
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-card border rounded-lg shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to manage your events</p>
        </div>

        <Button variant="outline" className="w-full text-lg" onClick={handleGoogleLogin}>
          <GoogleIcon />
          Sign in with Google
        </Button>
        
        <div className="flex items-center">
            <Separator className="flex-grow"/>
            <span className="px-4 text-muted-foreground text-sm">OR</span>
            <Separator className="flex-grow"/>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <Button type="submit" className="w-full text-lg font-medium">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
