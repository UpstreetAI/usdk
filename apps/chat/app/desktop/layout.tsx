interface DesktopLayoutProps {
  children: React.ReactNode
}

export default async function DesktopLayout({ children }: DesktopLayoutProps) {
  return (
    <div className="relative flex h-full w-full">
      {children}
    </div>
  );
}
