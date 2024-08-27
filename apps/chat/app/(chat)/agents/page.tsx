import { Agents } from '@/components/agents';

export default function AgentsPage() {
  return (
    <div className="relative w-full mx-auto max-w-4xl px-4 py-8">
      <Agents loadmore />
    </div>
  );
}
