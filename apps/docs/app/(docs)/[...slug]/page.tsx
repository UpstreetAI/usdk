import { source } from '@/lib/source';
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import defaultMdxComponents from 'fumadocs-ui/mdx';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}
      footer={{
        enabled: page.url === '/docs' ? false : true,
      }}
      // editOnGithub={{
      //   owner: 'UpstreetAI',
      //   // path: `docs-upstreet/${page.url.replace('/docs/', '')}.mdx`,
      //   path: '',
      //   repo: 'monorepo',
      // }}
      breadcrumb={{
        enabled: true,
        full: true,
        includeSeparator: true,        
      }}
      tableOfContent={{
        style: 'clerk',
      }}
      tableOfContentPopover={{
        style: 'clerk'
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={{ ...defaultMdxComponents }} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  const params = source.generateParams()
  return params.filter(param => param.slug?.length);
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();
  
  const title = `${page?.data?.title} - Upstreet Documentation`;
  const description = page.data.description;

  const ogImage = {
    type: "image/png",
    width: 1200,
    height: 630,
    url: `/opengraph/${params.slug?.join("/") ?? ''}`,
  }

  return {
    title,
    description,
    openGraph: {
      images: [
        ogImage
      ],
    },
    twitter: {
      card: "summary_large_image", 
      images: [
        ogImage
      ],
    }
  };
}
