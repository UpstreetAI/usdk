'use client';

import { Land } from '@/components/land';
// import { useSearchParams } from 'next/navigation';

export default function LandPage(props: {
  params: {
    id: string,
    id2: string,
  },
}) {
  const { id, id2 } = props.params;
  const loadUrl = new URL(location.href);
  const query = loadUrl.searchParams;
  const edit = query.get('edit') !== null;
  
  return (
    <Land
      id={[id, id2].join('/')}
      edit={edit}
    />
  );
}
