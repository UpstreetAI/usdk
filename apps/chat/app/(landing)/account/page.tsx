import { Account } from '@/components/account'


interface Props {
  params: {
    id: string
  }
}


export default function IndexPage({params}: Props) {
  return (
    <Account params={params}/>
  );
}
