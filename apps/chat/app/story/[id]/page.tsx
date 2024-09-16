import React from 'react';
import { Story } from '@/components/story';
import { waitForUser } from '@/utils/supabase/server';

export default async function StoryPage(props: {
  params: {
    id: string
  },
}) {
  const user = await waitForUser();
  if (!user) {
    return null;
  }

  const { id } = props.params;

  return (
    <Story
      id={id}
      user={user}
    />
  );
};
