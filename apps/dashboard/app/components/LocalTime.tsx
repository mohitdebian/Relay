'use client';
import { useState, useEffect } from 'react';

export default function LocalTime({ time, removeSeconds }: { time: string, removeSeconds?: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  if (!mounted) {
    // Basic fallback to prevent layout shift
    return <span style={{ opacity: 0 }}>00:00 AM</span>;
  }
  
  return (
    <>
      {new Date(time).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        ...(removeSeconds ? {} : { second: '2-digit' })
      })}
    </>
  );
}
