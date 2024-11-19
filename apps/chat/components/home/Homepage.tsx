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
    <div className="w-full h-screen z-1 absolute top-0 left-0 pt-20 bg-cover bg-center" style={{ backgroundImage: "url('/images/backgrounds/background-main.jpg')" }}>

      {/* <BackgroundSlider
        images={HeroImages}
        duration={0}
        transition={0}
      /> */}

      <div className="mx-auto max-w-8xl relative text-center flex flex-col justify-center h-full px-4">
        <div className="relative flex flex-col md:flex-row items-center h-full md:pt-20 box-border mx-auto">

          <div className='w-full text-center md:text-left md:mr-16 mt-8'>
            <div className='text-3xl md:text-6xl inline-block mb-4 md:mb-16 uppercase text-zinc-950'>
              <span className='font-bold'>USDK:</span> open source<br />
              <span className='font-bold'>framework</span><br />
              to create <span className='font-bold'>AI agents</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start font-bold">
              <Button
                variant="secondary"
                size='large'
                href='https://docs.upstreet.ai/'
                target='_blank'
                className='min-w-[200px]'
              >
                SDK
              </Button>
              <Button
                variant="accent"
                size='large'
                href='/usdk-discord'
                target='_blank'
              >
                Create Agent in Discord
              </Button>
            </div>
            <div className="mt-8 flex gap-4 justify-center md:justify-start">
              {/* <Link href="https://youtube.com/" target="_blank" className="hover:opacity-80">
                <Image
                  src="/images/socials/youtube.png"
                  alt="Youtube"
                  width={40}
                  height={40}
                />
              </Link> */}
              <Link href="/usdk-discord" target="_blank" className="hover:opacity-80">
                <Image
                  src="/images/socials/discord.png"
                  alt="Discord"
                  width={40}
                  height={40}
                />
              </Link>
              <Link href="https://x.com/upstreetai" target="_blank" className="hover:opacity-80">
                <Image
                  src="/images/socials/x.png"
                  alt="X"
                  width={40}
                  height={40}
                />
              </Link>
              <Link href="https://www.linkedin.com/company/upstreetai/" target="_blank" className="hover:opacity-80">
                <Image
                  src="/images/socials/linkedin.png"
                  alt="Linkedin"
                  width={40}
                  height={40}
                />
              </Link>
            </div>
          </div>

          <Image
            src="/images/homepage-avatar.png"
            alt="Avatar"
            width={500}
            height={500}
            className="absolute bottom-0 md:relative h-auto w-auto md:h-full max-w-[300px] md:max-w-none mx-auto md:mx-0"
          />

        </div>
      </div>
    </div>
  );
}
