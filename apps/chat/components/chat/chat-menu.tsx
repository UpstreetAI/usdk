import { useSidebar } from '@/lib/client/hooks/use-sidebar';
import { isValidUrl } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { IconButton } from 'ucom';

export interface Player {
  getPlayerSpec: () => {
    name: string;
    previewUrl: string;
  };
}

export interface ChatMenuProps {
  players: Player[];
  roomName?: string;
}

export function ChatMenu({ players, roomName }: ChatMenuProps) {
  const { toggleRightSidebar, isLeftSidebarOpen, isRightSidebarOpen } = useSidebar();

  const pathname = usePathname();
  if (pathname.startsWith('/new')) {
    return null;
  }

  return (
    <div
      className={`fixed z-[100] bg-gray-300 left-0 w-full ease-in-out duration-300 animate-in border-b ${isLeftSidebarOpen ? 'lg:pl-[250px] xl:pl-[300px]' : ''
        } ${isRightSidebarOpen ? 'lg:pr-[250px] xl:pr-[300px]' : ''}`}
    >

      <div className='absolute z-[100] left-3 md:left-4 top-1/2 transform -translate-y-1/2 mt-1'>
        <IconButton href={document.referrer || "/"} icon={'BackArrow'}  />
      </div>

      <div className="space-y-4 px-2 md:px-0 sm:max-w-2xl mx-auto relative flex">
        <div className="flex flex-row p-1 md:p-4 border-b border-gray-300 w-full">
          <div className="flex w-full items-center mb-4 md:mb-0">
            <div className="hidden md:flex mr-4 size-12 min-w-12 md:size-12 md:min-w-12 bg-gray-100 p-1 overflow-hidden items-center justify-center border-2 border-gray-900">
              <div
                className="w-full h-full bg-cover bg-top"
                style={{
                  backgroundImage: 'url(/images/backgrounds/rooms/default-bg.jpg)',
                  backgroundColor: '#ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#fff',
                }}
              />
            </div>
            <h2 className="text-lg md:text-2xl font-semibold flex mt-4 md:mt-0 ml-14 md:ml-0">{roomName ? roomName : '156 Starlight Street'}</h2>
          </div>

          <div className="flex items-center">
            <div className="flex -space-x-4 md:mr-4">
              {players?.map((player) => {
                const { name, previewUrl } = player.getPlayerSpec();
                return (
                  <div
                    key={name}
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
            <div className="text-lg hidden md:block font-medium whitespace-nowrap">{players?.length} member{players.length > 1 && "s"}</div>
            <div className="flex items-center space-x-4 ml-2">
              <IconButton icon={'Menu'} variant='ghost' onClick={toggleRightSidebar} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
