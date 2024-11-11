'use client';

import React from 'react';
import { IconButton } from 'ucom';
import { useRouter } from 'next/navigation';

export function BackButton({className = ''}) {
  const router = useRouter();

  return (
    <div className={`${className}`}>
      <IconButton 
        onClick={() => router.back()} 
        icon={'BackArrow'} 
      />
    </div>
  );
};