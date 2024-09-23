
import { type Metadata } from 'next';
import { makeAnonymousClient } from '@/utils/supabase/supabase-client';
import { env } from '@/lib/env'
import { AgentRow } from '@/components/agents/list/AgentRow';
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

  const { data: accountData } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', agentId)
    .single();

  const meta = {
    title: accountData?.name ?? 'Agent not found!',
    description: accountData?.description ?? '',
    cardImage: accountData?.preview_image ?? '',
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

  const { data: accountData } = await supabase
    .from('accounts')
    .select(`*, agents: assets ( * )`)
    .eq('id', accountId)
    .single();

    const fullUrl = `${window.location.origin}/accounts/${accountId}`;

  if (!accountData?.id) {
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
        <div
          className="w-full h-52 absolute top-0 left-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: accountData.agents.length > 0
              ? `url(${accountData.agents[Math.floor(Math.random() * accountData.agents.length)].images[0].url})`
              : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </HeaderMaskFrame>

      <div className="w-full max-w-6xl mx-auto pt-24 relative">
        <div className="flex">
          <div className="mr-4 size-40 min-w-12 bg-gray-100 p-4 overflow-hidden flex items-center justify-center border-2 border-gray-900">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: isValidUrl(accountData.preview_url)
                  ? `url(${accountData.preview_url})`
                  : 'none',
                backgroundColor: isValidUrl(accountData.preview_url) ? 'transparent' : '#ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#fff',
              }}
            >
              {!isValidUrl(accountData.preview_url) && accountData.name.charAt(0)}
            </div>
          </div>

          <div>
            <h2 className="text-4xl uppercase text-stroke font-bold">{accountData.name}</h2>
            <a href={`/accounts/${accountData.id}`} className="text-primary hover:underline">
              {accountData.name}
              </a>

          </div>

        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-8`}>
          {accountData.agents.map((agent: { id: string; name: string }) => <AgentRow key={agent.id} agent={agent} author={accountData.name} />)}
        </div>

      </div>

    </div>
  );
}
