'use client';

import { redirect } from 'next/navigation';

export default function StoryPageDefault() {
  const loadUrl = new URL(location.href);
  const query = loadUrl.searchParams;
  const edit = query.get('edit') !== null;

  const guid = crypto.randomUUID();
  const u = new URL(`http://localhost/story/${guid}`);
  edit && u.searchParams.set('edit', '');
  const { pathname } = u;
  redirect(pathname);
}
