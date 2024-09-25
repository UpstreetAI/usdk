interface ChatLayoutProps {
  children: React.ReactNode
}

export default async function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="relative flex min-h-full bg-zinc-900">
      {children}
    </div>
  );
}
