"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CHUNK_RETRY_KEY = "adezo-chunk-retry";

function isChunkLoadError(error: Error): boolean {
  const message = error?.message?.toLowerCase() ?? "";
  return (
    message.includes("loading chunk") ||
    message.includes("chunkloaderror") ||
    message.includes("_next/static/chunks")
  );
}

async function hardRecoverFromChunkError(): Promise<void> {
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }

    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  } catch {
    // ignore cache cleanup issues
  }

  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set("__chunk_retry", Date.now().toString());
  window.location.replace(currentUrl.toString());
}

function getReadableDashboardError(error: Error): string {
  if (isChunkLoadError(error)) {
    return "Wykryto nieaktualny pakiet aplikacji. Odświeżam zasoby i ponawiam ładowanie.";
  }

  if (!error.message) {
    return "Failed to load dashboard data. Check your Supabase connection.";
  }

  if (error.message.startsWith("{") && error.message.includes("code")) {
    return "Supabase returned a database error while loading dashboard data.";
  }

  return error.message;
}

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);

    if (!isChunkLoadError(error)) {
      return;
    }

    const hasRetried = sessionStorage.getItem(CHUNK_RETRY_KEY) === "1";
    if (!hasRetried) {
      sessionStorage.setItem(CHUNK_RETRY_KEY, "1");
      void hardRecoverFromChunkError();
    } else {
      sessionStorage.removeItem(CHUNK_RETRY_KEY);
    }
  }, [error]);

  const handleRetry = () => {
    if (isChunkLoadError(error)) {
      sessionStorage.removeItem(CHUNK_RETRY_KEY);
      void hardRecoverFromChunkError();
      return;
    }

    reset();
  };

  return (
    <Card className="max-w-lg mx-auto mt-12 border-danger/20">
      <CardHeader>
        <CardTitle className="text-danger">Something went wrong</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {getReadableDashboardError(error)}
        </p>
        <Button onClick={handleRetry} variant="gold">
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
