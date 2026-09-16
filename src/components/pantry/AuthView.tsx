import { useState } from "react";
import { Leaf, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User } from "@/lib/pantry";

export function AuthView({ onAuth }: { onAuth: (user: User) => void }) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function valid(mail: string, pass: string) {
    if (!/^\S+@\S+\.\S+$/.test(mail)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (pass.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return false;
    }
    return true;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="leaf-gradient mx-auto grid h-14 w-14 place-items-center rounded-2xl shadow-[var(--shadow-lift)]">
            <Leaf className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">EcoPantry</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track what's in your kitchen, cook it before it spoils, waste nothing.
          </p>
        </div>

        <div className="surface-card p-5 sm:p-7">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-5">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!valid(loginEmail, loginPassword)) return;
                  onAuth({
                    name: loginEmail.trim().split("@")[0] ?? "friend",
                    email: loginEmail.trim(),
                  });
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    className="h-11"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    className="h-11"
                    placeholder="••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="h-11 w-full">
                  <LogIn className="h-4 w-4" /> Log in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-5">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!name.trim()) {
                    toast.error("Please tell us your name.");
                    return;
                  }
                  if (!valid(email, password)) return;
                  onAuth({ name: name.trim(), email: email.trim() });
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Name</Label>
                  <Input
                    id="signup-name"
                    className="h-11"
                    placeholder="Alex Green"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    className="h-11"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    className="h-11"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="h-11 w-full">
                  <UserPlus className="h-4 w-4" /> Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Your pantry is saved on this device, so you'll still be signed in next visit.
        </p>
      </div>
    </main>
  );
}
