import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthView } from "@/components/pantry/AuthView";
import { Dashboard } from "@/components/pantry/Dashboard";
import { loadUser, saveUser, type User } from "@/lib/pantry";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EcoPantry — Track food, cut waste, cook smarter" },
      {
        name: "description",
        content:
          "EcoPantry tracks your groceries, flags what's expiring soon, scans receipts and turns leftovers into sustainable recipes.",
      },
      { property: "og:title", content: "EcoPantry — Track food, cut waste, cook smarter" },
      {
        property: "og:description",
        content:
          "Track your pantry, spot expiring food in time, and get AI recipes that use it up before it's wasted.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(loadUser());
    setReady(true);
  }, []);

  if (!ready) return <div className="min-h-screen bg-background" />;

  if (!user) {
    return (
      <AuthView
        onAuth={(u) => {
          saveUser(u);
          setUser(u);
        }}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      onSignOut={() => {
        saveUser(null);
        setUser(null);
      }}
    />
  );
}
