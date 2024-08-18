import { redirect } from 'next/navigation';

export default function MapPageDefault() {
  const guid = crypto.randomUUID();
  redirect(`/map/${guid}?edit`);
  // return null;
}
