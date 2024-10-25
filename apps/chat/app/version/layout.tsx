interface VersionLayoutProps {
  children: React.ReactNode
}

export default async function VersionLayout({ children }: VersionLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}
