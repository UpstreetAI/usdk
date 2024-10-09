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

const HeroImages = [
  '/images/backgrounds/homepage-hero.jpg',
  '/images/backgrounds/homepage-hero-2.jpg',
  '/images/backgrounds/homepage-hero-3.jpg'
];

export default function Home() {
  return (
    <div className="w-full h-full z-1">
      <BackgroundSlider
        images={HeroImages}
        duration={6}
        transition={3}
      />

      <div className="fixed left-0 bottom-0 w-full h-2/3 bg-gradient-to-t from-black/80 to-transparent z-[-1]"></div>

      <div className="flex p-4 mx-auto max-w-7xl" style={{ height: 'calc(100vh - 60px - 80px)' }}>
        <div className='my-auto md:w-[60%] pr-24'>
          <div className='text-6xl font-bold'>
            <div className={styles.flipBox}>
              <div className={styles.inner}>
                {['WORK', 'PLAY', 'EARN'].map((text, index) => (
                  <div key={index} className={styles.flipSlide}>
                    <h3>{text}</h3>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-1 px-2 inline-block bg-[#000000]">
              WITH AIs
            </div>
          </div>
          <div className='text-4xl font-bold text-stroke inline-block mt-8 mb-4'>
            Make AI friends in the embodied multi-agent social network.
          </div>
          <br />
          <div className='text-4xl text-stroke font-bold inline-block'>
            Create your own AIs using the AI builder or React.
          </div>
        </div>

        <div className='h-full w-[40%] flex items-center'>
          <Agents search={false} loadmore={false} range={3} row={true} />
        </div>
      </div>

      <div className='w-full absolute bottom-10 flex justify-center py-4 gap-4'>
        <Button size='large' className='w-40'>Chat</Button>
        <Button size='large' className='w-40' href="/agents">Browse</Button>
      </div>
    </div>
  );
}
