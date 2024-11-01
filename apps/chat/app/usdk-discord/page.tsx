'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DiscordRedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('https://discord.gg/TfKW36rMj7');
  }, [router]);

  return null;
};

export default DiscordRedirectPage;