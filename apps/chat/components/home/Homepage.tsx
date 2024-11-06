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
    <div className="w-full h-screen z-1 absolute top-0 left-0 pt-20 bg-cover bg-center" style={{ backgroundImage: "url('/images/backgrounds/background.jpg')" }}>

      <div className="fixed left-0 bottom-0 w-full h-2/3 bg-gradient-to-t from-black/80 to-transparent z-[-1]"></div>

      <div className="p-4 mx-auto max-w-7xl h-full relative text-center flex flex-col justify-center">

        <div className='my-auto w-full pr-24'>
          <div className='text-lg md:text-4xl font-bold text-stroke inline-block mt-8 mb-4'>
            USDK: Open Source Framework for Building AI Agents
          </div>
        </div>
        
        <div className='w-full flex justify-center py-4 gap-4'>
          {agents.length > 0 && (
            <Button size='large' className='min-w-40' onClick={async e => {
              e.preventDefault();
              e.stopPropagation();
              await agentJoinRandom(agents);
            }}>Random Chat</Button>
          )}
          <Button size='large' className='min-w-40' href="/agents">Browse Agents</Button>
        </div>

        {/* <div className='absolute bottom-40 h-[60%] overflow-y-scroll md:h-auto md:w-[100%] flex items-start'>
          <Agents search={false} loadmore={false} range={3} row={false} />
        </div> */}
      </div>
    </div>
  );
}
