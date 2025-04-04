"use client";
import { Routes } from "@/utils/constants";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@analogia/ui-v4/button";
import { type User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function Main() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    void fetchUser().catch((error) => {
      console.error('Failed to fetch user:', error);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    redirect(Routes.LOGIN);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      {/* Top bar */}
      <div className="absolute top-0 left-0 flex h-12 w-full items-center justify-end p-2">
        <Button variant="outline" onClick={() => redirect(Routes.PROJECTS)}>
          Projects
        </Button>
        {user ? (
          <div className="flex items-center gap-2">
            <p>{user.user_metadata.name}</p>
            <Button onClick={handleSignOut}>Sign Out</Button>
          </div>
        ) : (
          <Button onClick={() => redirect(Routes.LOGIN)}>Sign In</Button>
        )}
      </div>
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">Analogia</h1>
        <p className="text-lg">Cursor for Designers</p>
        <div className="flex flex-col gap-2">
          <label htmlFor="prompt-input">Enter your prompt</label>
          <textarea 
            id="prompt-input"
            className="h-32 w-96 rounded-md border-2 border-gray-300 p-4"
            placeholder="Type your prompt here..."
            title="Prompt input area"
          />
        </div>
      </div>
    </main>
  );
}
