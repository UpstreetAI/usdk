
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { AgentProfile } from '@/components/agent';
// import { createClient } from '@/utils/supabase/server';
import { makeAnonymousClient } from '@/utils/supabase/supabase-client';
import { env } from '@/lib/env'
import { AgentRow } from '@/components/agents/AgentRow';
import { isValidUrl } from '@/lib/utils';
import HeaderMaskFrame from '@/components/masks/HeaderMaskFrame';

type Params = {
  params: {
    id: string;
  };
};

export async function generateMetadata({
  params
}: Params): Promise<Metadata> {
  // const supabase = createClient();
  const supabase = makeAnonymousClient(env);
  // const {
  //   data: { user }
  // } = await supabase.auth.getUser();

  // decode the uri for usernames that have spaces in them
  // const agentName = decodeURIComponent(params.id)
  const agentId = decodeURIComponent(params.id)

  const { data: agentData } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', agentId)
    .single();

  const meta = {
    title: agentData?.name ?? 'Agent not found!',
    description: agentData?.description ?? '',
    cardImage: agentData?.preview_image ?? '',
    robots: 'follow, index',
    favicon: '/favicon.ico',
    url: `https://chat.upstreet.ai/`
  };

  return {
    title: meta.title,
    description: meta.description,
    referrer: 'origin-when-cross-origin',
    keywords: ['AI', 'SDK', 'Upstreet', 'Agents'],
    authors: [{ name: 'Upstreet', url: 'https://upstreet.ai/' }],
    creator: 'upstreetai',
    publisher: 'upstreetai',
    robots: meta.robots,
    icons: { icon: meta.favicon },
    metadataBase: new URL(meta.url),
    openGraph: {
      url: meta.url,
      title: meta.title,
      description: meta.description,
      images: [meta.cardImage],
      type: 'website',
      siteName: meta.title
    },
    twitter: {
      card: 'summary_large_image',
      site: '@upstreetai',
      creator: '@upstreetai',
      title: meta.title,
      description: meta.description,
      images: [meta.cardImage]
    }
  }
}

export default async function AccountProfilePage({ params }: Params) {
  const supabase = makeAnonymousClient(env);
  const accountId = decodeURIComponent(params.id);

  console.log('agentId', accountId);

  const { data: agentData } = await supabase
    .from('accounts')
    .select(`*, agents: assets ( * )`)
    .eq('id', accountId)
    .single();

  if (!agentData?.id) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 text-center">
        Account Not Found
      </div>
    );
  }
  return (
    <div className="w-full mx-auto">

      <HeaderMaskFrame>
        <div className="w-full bg-blue-500 h-52" />
      </HeaderMaskFrame>

      <div className="w-full max-w-6xl mx-auto pt-20 relative">
        <div className="flex">
          <div className="mr-4 mb-4 size-32 min-w-12 bg-gray-200 p-4 overflow-hidden rounded-[8px] flex items-center justify-center">
            {isValidUrl(agentData.preview_url) ? (
              <Image src={agentData?.preview_url} alt="Profile picture" width={160} height={160} />
            ) : (
              <div className="uppercase text-lg font-bold">{agentData.name.charAt(0)}</div>
            )}
          </div>

          <div>
            <h2 className="text-[28px] uppercase font-bold">{agentData.name}</h2>
            <h3 className="text-sm mb-6">{agentData.id}</h3>

          </div>

        </div>

        <h1>Account Public Profile: {agentData.name}</h1>
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
          {agentData.agents.map((agent: { id: string; name: string }) => <AgentRow key={agent.id} agent={agent} author={agentData.name} />)}
        </div>

      </div>

    </div>
  );
}
