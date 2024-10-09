import { useSidebar } from '@/lib/client/hooks/use-sidebar';
import { isValidUrl } from '@/lib/utils';

export interface ChatMenu {
  players: any
}

export function ChatMenu({ players }: ChatMenu) {
  
  const { toggleRightSidebar, isLeftSidebarOpen, isRightSidebarOpen } = useSidebar();

  return (
    <div className={`absolute top-0 left-0 w-full ease-in-out duration-300 animate-in border-b ${isLeftSidebarOpen ? "lg:pl-[250px] xl:pl-[300px]" : ""} ${isRightSidebarOpen ? "lg:pr-[250px] xl:pr-[300px]" : ""}`}>
      <div className="space-y-4 px-4 py-2 sm:max-w-2xl mx-auto md:py-2 relative flex">
        <div className="flex p-4 border-b border-gray-300 w-full">

          <div className="flex w-full">

          {players.length && players.map(player => {
          const playerSpec = player.getPlayerSpec();
          const name = playerSpec.name;
          const { previewUrl } = playerSpec;

          return (
          <div
                  className="size-12 bg-cover bg-top border border-gray-900"
                  style={{
                    backgroundImage: isValidUrl(previewUrl) ? `url(${previewUrl})` : 'none',
                    backgroundColor: isValidUrl(previewUrl) ? 'transparent' : '#ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#fff',
                  }}
                >
                  {!isValidUrl(previewUrl) && name.charAt(0)}
                </div>
          )})}

            <h2 className="text-2xl font-semibold">ROOM NAME</h2>
          </div>

          <div className="flex items-center">
            <div className="flex -space-x-4 mr-4">
              {players && players.map((player) => {
                const playerSpec = player.getPlayerSpec();
                const name = playerSpec.name;
                const { previewUrl } = playerSpec;
                return (
                  <div
                  className="size-10 bg-cover bg-top rounded-full border-2 border-white"
                  style={{
                    backgroundImage: isValidUrl(previewUrl) ? `url(${previewUrl})` : 'none',
                    backgroundColor: isValidUrl(previewUrl) ? 'transparent' : '#ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#fff',
                  }}
                >
                  {!isValidUrl(previewUrl) && name.charAt(0)}
                </div>
                );
              })}
            </div>
            <div className="text-lg font-medium whitespace-nowrap">{players.length} members</div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200" onClick={toggleRightSidebar}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm6 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm6 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
