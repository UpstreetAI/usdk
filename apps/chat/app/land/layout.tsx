import { DevRedirect } from "@/components/development";

interface ChatLayoutProps {
  children: React.ReactNode
}

export default async function LandLayout({ children }: ChatLayoutProps) {
  return (
    <div className="relative flex min-h-full">
      <DevRedirect />
      {children}
    </div>
  );
}
