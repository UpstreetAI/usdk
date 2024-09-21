import { DevRedirect } from "@/components/development";

interface ChatLayoutProps {
  children: React.ReactNode
}

export default async function NewLayout({ children }: ChatLayoutProps) {
  return (
    <>
      <DevRedirect />
      {children}
    </>
  );
}
