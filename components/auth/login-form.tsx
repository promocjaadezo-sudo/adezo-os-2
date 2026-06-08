"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function mapLoginErrorMessage(errorMessage: string): string {
  const normalized = errorMessage.toLowerCase();

  if (normalized.includes("placeholder") && normalized.includes("supabase url")) {
    return "URL Supabase jest placeholderem. Ustaw prawdziwy NEXT_PUBLIC_SUPABASE_URL z panelu Supabase.";
  }

  if (normalized.includes("next_public_supabase_url")) {
    return "Brak konfiguracji URL Supabase (NEXT_PUBLIC_SUPABASE_URL).";
  }

  if (normalized.includes("next_public_supabase_anon_key")) {
    return "Brak konfiguracji klucza Supabase (NEXT_PUBLIC_SUPABASE_ANON_KEY).";
  }

  if (
    normalized.includes("networkerror") ||
    normalized.includes("failed to fetch") ||
    normalized.includes("fetch failed")
  ) {
    return "Problem sieci podczas logowania do Supabase. Sprawdź połączenie i ustawienia projektu.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "Nieprawidłowy email lub hasło.";
  }

  return errorMessage;
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(mapLoginErrorMessage(authError.message));
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Sign in failed";
      setError(mapLoginErrorMessage(message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-gold-subtle shadow-luxury-lg">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gold/10 border border-gold/20 mb-2">
          <span className="text-gold font-display font-bold text-2xl">A</span>
        </div>
        <CardTitle className="font-display text-2xl">ADEZO OS 2.0</CardTitle>
        <CardDescription>Premium system operacyjny sprzedaży</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="ceo@adezo.pl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" variant="gold" disabled={loading}>
            {loading ? "Logowanie..." : "Zaloguj się"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
