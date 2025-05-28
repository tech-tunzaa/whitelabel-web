'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from './skeleton';

// Dynamically import the MapPicker with SSR disabled
const DynamicMapPicker = dynamic(
  () => import('./map-picker').then((mod) => mod.MapPicker),
  { 
    ssr: false,
    loading: () => <Skeleton className="w-full h-[300px] rounded-md" />
  }
);

export { DynamicMapPicker };
