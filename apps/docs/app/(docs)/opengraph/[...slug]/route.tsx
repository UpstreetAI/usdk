import { source } from '@/lib/source'
import { ImageResponse } from 'next/og'
 
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL ?? 'http://localhost:3000'

const size = {
    width: 1200,
    height: 630,
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
  const slug = (await params).slug;
  console.log("slug", slug);

  const page = source.getPage(slug as unknown as string[]);
    console.log("page", page?.data.title);

  const title = page?.data.title ?? "Upstreet Agents SDK";
  const description = page?.data.description ?? "Documentation & Examples";

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          fontFamily: '"Aller", sans-serif'
        }}
      >
        <img alt="background image" src={`${baseUrl}/images/general/upstreet-docs-opengraph-image-bg-only.png`} height={630} width={1200} style={{
            objectFit: 'cover',
            height: '100%',
            width: '100%'
        }} />
        <span style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '10px 90px',
            color: 'white',
            fontSize: 90,
            fontWeight: 'bold'
        }}>
            {title}
            <span style={{
                fontSize: 32,
                fontWeight: 'normal',
                opacity: 0.6
            }}>
                {description}
            </span>
        </span>
      </div>
    ),
    {
      ...size,
    }
  )
}