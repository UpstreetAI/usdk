import { makeAnonymousClient } from '@/utils/supabase/supabase-client'
import { ImageResponse } from 'next/og'
import { env } from '@/lib/env'

const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL ?? 'http://localhost:3000'

const withHttps = (url:string) => !/^https?:\/\//i.test(url) ? `https://${url}` : url;

export const size = {
  width: 1200,
  height: 630
}

// Image generation
export default async function AgentOgImage({
  params
}: {
  params: { id: string }
}) {
  const agentId = params.id

  const supabase = makeAnonymousClient(env)

  const result = await supabase
    .from('assets')
    .select('*, author: accounts ( id, name )')
    .eq('id', agentId)
    .single()
  const agentData = result.data as any

  const homespaceUrl = agentData?.images.find(
    (image: any) => image.type === 'image/homespace'
  )?.url

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 32,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative'
          // backgroundImage: `url('${homespaceUrl}')`,
          // backgroundPosition: 'center',
          // backgroundSize: 'cover',
          // backgroundRepeat: 'no-repeat',
          // background: 'red',
        }}
      >
        <img
          src={homespaceUrl}
          width={1200}
          height={630}
          style={{
            width: '100%',
            position: 'absolute',
            objectFit: 'cover',
          }}
        />
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            background: '#000000',
            opacity: 0.72
          }}
        ></div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            height: '100%',
            maxWidth: '100vw',
            width: '100%'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              height: '100%',
              paddingLeft: '60px',
              paddingRight: '40px',
              maxWidth: '70%',
              paddingBottom: '40px',
            }}
          >
            <img
              src={`https://upstreet.ai/images/upstreet_logo_raster.png`}
              style={{ width: '160px', height: '120px', objectFit: 'contain' }}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                width: '100%',
                columnGap: '20px'
              }}
            >
              <span
                style={{ 
                  fontSize: 80,
                  lineHeight: 1.2,
                  fontWeight: 'black',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  WebkitLineClamp: 1, // Limits text to two lines
                  lineClamp: 1, // For Firefox support (experimental)
                  textOverflow: 'ellipsis'
                  }}
                >
                {agentData?.name}
              </span>
              <span
                style={{
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  WebkitLineClamp: 2, // Limits text to two lines
                  lineClamp: 2, // For Firefox support (experimental)
                  textOverflow: 'ellipsis'
                }}
              >
                {agentData?.description}
              </span>
              <span style={{ fontSize: 26, opacity: 0.45, paddingTop: '10px' }}>
                Created by {agentData?.author?.name}
              </span>
            </div>
            <span style={{ fontSize: 30, fontWeight: 'bold', paddingTop: '10px' }}>Talk to more Agents {'→'} </span>
          </div>
          <img
            src={agentData?.preview_url}
            style={{
              height: '100%',
              objectFit: 'cover',
              width: '420px',
              display: 'flex',
              flex: '1'
            }}
          />
        </div>
      </div>
    ),
    {
      ...size
    }
  )
}
