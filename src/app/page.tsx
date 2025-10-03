'use client';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImageIcon, Link } from "lucide-react";

export default function LoginPage() {
  const { toast } = useToast();
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Login successful!",
      description: "You have successfully logged in.",
    });
  };
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="w-full max-w-md p-8 space-y-8 border-2 border-border rounded-2xl bg-card">
        <h1 className="text-center text-2xl font-bold tracking-wider">Login</h1>
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className=" text-lg font-medium">
              <Label htmlFor="username" className="capitalize">username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                className="mt-1 placeholder:text-border hover:text-card-foreground hover:bg-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="capitalize">password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="mt-1 placeholder:text-border hover:text-card-foreground hover:bg-white"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full text-center text-lg font-medium">
            Sign in
          </Button>
          <Button
            variant="outline"
            className="w-12 h-12 p-2 flex items-center justify-center"
            title="Sign in with Google"
          >
            G
          </Button>

        </form>
      </div>
    </div>
  );
}
