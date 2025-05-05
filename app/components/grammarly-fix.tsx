'use client';

import { useEffect } from 'react';

export function GrammarlyFix() {
  useEffect(() => {
    // Remove Grammarly attributes after hydration
    const body = document.body;
    if (body) {
      body.removeAttribute('data-new-gr-c-s-check-loaded');
      body.removeAttribute('data-gr-ext-installed');
    }
  }, []);

  return null;
} 