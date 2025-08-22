'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function FloatingBackButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50 lg:hidden">
      <Link
        href="/companies"
        className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Back to Companies"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>
    </div>
  );
}
