interface EmbedLayoutProps {
  children: React.ReactNode
}

export default async function EmbedLayout({ children }: EmbedLayoutProps) {
  return (
    <div className="relative flex min-h-full">
      {children}
    </div>
  );
}
