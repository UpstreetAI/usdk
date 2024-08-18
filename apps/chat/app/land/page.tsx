import { redirect } from 'next/navigation';

export default function LandPageDefault() {
  const guid = crypto.randomUUID();
  redirect(`/land/${guid}?edit`);
  // return null;
}
