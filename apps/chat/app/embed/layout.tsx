import { cn } from '@/lib/utils'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

interface EmbedLayoutProps {
  children: React.ReactNode
}

export default async function EmbedLayout({ children }: EmbedLayoutProps) {
  return (
    <body
      className={cn(
        'font-[Aller-Regular] antialiased',
        GeistSans.variable,
        GeistMono.variable
      )}
      style={{
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <div className="relative flex h-full w-full">
        {children}
      </div>
    </body>
  );
}
