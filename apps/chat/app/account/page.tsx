import { Account } from '@/components/account'

interface Props {
  params: {
    id: string
  }
}

export default function IndexPage({params}: Props) {
  return (
    <div className="relative flex min-h-full bg-zinc-900">
      <Account params={params}/>
    </div>
  );
}
