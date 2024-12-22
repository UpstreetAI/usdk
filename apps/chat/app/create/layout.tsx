import { DevRedirect } from "@/components/development";

interface BuilderLayoutProps {
  children: React.ReactNode
}

export default async function BuilderLayout({ children }: BuilderLayoutProps) {
  return (
    <>
      <DevRedirect />
      {children}
    </>
  );
}