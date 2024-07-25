'use client';

import * as React from 'react';

type Props = {
  ucid?: string,
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'form-widget': Props;
    }
  }
}

export default function Waitlist() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-8 pb-16 markdown">
      <form-widget ucid='gX3p2JkNdLHrZSSivBsto3Taies' />
    </div>
  );
}
