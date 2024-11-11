'use client';

import { useRouter } from 'next/navigation';
import { Button } from 'ucom';


export function AgentNotFound() {

  const router = useRouter();

  return (
    <div
      className="w-full h-[calc(100vh-48px)] bg-cover bg-center"
      style={{ backgroundImage: `url("${'/images/backgrounds/agent-not-found-bg.png'}")` }}
    >
      <div className="w-full max-w-6xl mx-auto h-full pt-20 relative">
        <div className="absolute bottom-16 left-4">
          <div>
            <h2 className="text-6xl uppercase font-bold text-stroke">Agent Not Found</h2>
            <div className="flex items-center my-2 mb-4">
              <h3 className="text-sm bg-gray-800 px-2 py-1">Please try searching for another agent.</h3>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => router.back()}>Back</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}