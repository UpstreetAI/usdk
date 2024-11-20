interface EmbedLayoutProps {
  children: React.ReactNode
}

export default async function EmbedLayout({ children }: EmbedLayoutProps) {
  return (
    <div className="relative flex h-full w-full">
      {children}
    </div>
  );
}
