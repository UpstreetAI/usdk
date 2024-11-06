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

      {/* <BackgroundSlider
        images={HeroImages}
        duration={0}
        transition={0}
      /> */}

      <div className="mx-auto max-w-8xl relative text-center flex flex-col justify-center h-full">
        <div className="relative flex flex-row items-center h-full pt-20 box-border mx-auto">

          <Image 
            src="/images/homepage-avatar.png"
            alt="Avatar"
            width={500}
            height={500}
            className="h-full w-auto"
          />

          <div className='w-full text-left pl-12 mt-8'>
            <div className='text-lg md:text-6xl inline-block mb-4 uppercase text-zinc-950'>
              <span className='font-bold'>USDK:</span> open source<br />
              <span className='font-bold'>framework</span><br />
              to create <span className='font-bold'>AI agents</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
