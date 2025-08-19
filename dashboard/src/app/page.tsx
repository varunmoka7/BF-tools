"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to companies page as the main directory
    router.replace('/companies');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-lg text-muted-foreground">Redirecting to company directory...</div>
    </div>
  );
}