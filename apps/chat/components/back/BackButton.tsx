'use client';

import React from 'react';
import { IconButton } from 'ucom';
import { useRouter } from 'next/navigation';

export function BackButton() {
  const router = useRouter();

  return (
    <div className='absolute z-[100] left-8 top-8'>
      <IconButton 
        onClick={() => router.back()} 
        icon={'BackArrow'} 
      />
    </div>
  );
};