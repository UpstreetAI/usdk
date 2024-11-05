'use client';

import BackgroundSlider from 'react-background-slider';
import styles from './Homepage.module.css';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { newChat } from "@/lib/chat/actions";
import Image from 'next/image';
import Link from 'next/link';
import { Agents } from '../agents';
import Dev from '../development';
import { Button } from 'ucom';
import { useMultiplayerActions } from '../ui/multiplayer-actions';
import { useSupabase } from '@/lib/hooks/use-supabase';
import { useEffect, useState } from 'react';

const HeroImages = [
  '/images/backgrounds/homepage-hero.jpg',
  '/images/backgrounds/homepage-hero-2.jpg',
  '/images/backgrounds/homepage-hero-3.jpg'
];

export default function Home() {

  const { agentJoinRandom } = useMultiplayerActions();
  const { supabase } = useSupabase();
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('assets')
          .select('*, author: accounts ( id, name )')
          .eq('origin', 'sdk')
          .limit(30);
        
        if (error) {
          console.log(error);
        } else {
          setAgents(data);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [supabase]);

  return (
    <div className="w-full h-screen z-1 absolute top-0 left-0 pt-20">
      <BackgroundSlider
        images={HeroImages}
        duration={6}
        transition={3}
      />

      <div className="fixed left-0 bottom-0 w-full h-2/3 bg-gradient-to-t from-black/80 to-transparent z-[-1]"></div>

      <div className="md:flex p-4 mx-auto max-w-7xl h-full md:pb-40 relative">

        {/* <div className='my-auto md:w-[60%] pr-24'>
          <div className='text-4xl md:text-6xl font-bold'>
            <div className={styles.flipBox}>
              <div className={styles.inner}>
                {['WORK', 'PLAY', 'EARN'].map((text, index) => (
                  <div key={index} className={styles.flipSlide}>
                    <h3>{text}</h3>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-2 py-[10px] md:py-1 inline-block bg-[#000000]">
              WITH AIs
            </div>
          </div>
          <div className='text-lg md:text-4xl font-bold text-stroke inline-block mt-8 mb-4'>
            Make AI friends in the embodied multi-agent social network.
          </div>
          <br />
          <div className='text-lg md:text-4xl text-stroke font-bold inline-block'>
            Create your own AIs using the AI builder or React.
          </div>
        </div> */}

        <div className='absolute bottom-40 h-[60%] overflow-y-scroll md:h-auto md:w-[100%] flex items-start'>
          <Agents search={false} loadmore={false} range={3} row={false} />
        </div>
      </div>

      <div className='w-full absolute bottom-10 flex justify-center py-4 gap-4'>
        { agents.length > 0 && (
          <Button size='large' className='min-w-40' onClick={async e => {
            e.preventDefault();
            e.stopPropagation();
            await agentJoinRandom(agents);
          }}>Random Chat</Button>
        )}
        <Button size='large' className='min-w-40' href="/agents">Browse Agents</Button>
      </div>
    </div>
  );
}
