'use client';

import { Land } from '@/components/land'
// import { useSearchParams } from 'next/navigation'

const loadUrl = new URL(location.href);
const query = loadUrl.searchParams;

export default function LandPage({
  id,
}: {
  id: string,
}) {
  const edit = query.get('edit') !== null;
  
  return (
    <Land
      id={id}
      edit={edit}
    />
  );
}
