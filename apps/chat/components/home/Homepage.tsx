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


const Hero1 = '/images/backgrounds/homepage-hero.jpg';
// const Hero2 = '/images/hero-2.jpg';
// const Hero3 = '/images/hero-3.jpg';

export default function Home() {

  return (
    <div>
      <div className="w-full h-full z-1">
        <BackgroundSlider
          images={[Hero1]}
          duration={6000}
          transition={10}
        />

        <div className="absolute left-0 bottom-0 w-full h-2/3 bg-gradient-to-t from-black/80 to-transparent z-[-1]"></div>

        <div className="flex p-4 mx-auto max-w-6xl h-[calc(100vh-60px)]">
          <div className='my-auto md:w-[50%] pr-24'>
            <div className='text-6xl font-bold'>
              <div className={styles.flipBox}>
                <div className={styles.inner}>
                  <div className={styles.flipSlide}>
                    <h3>WORK</h3>
                  </div>
                  <div className={styles.flipSlide}>
                    <h3>PLAY</h3>
                  </div>
                  <div className={styles.flipSlide}>
                    <h3>EARN</h3>
                  </div>
                </div>
              </div>
              <div className="p-1 px-2 inline-block bg-[#000000]">
                WITH AIs
              </div>
            </div>
            <div className='bg-[#000000] text-2xl font-bold inline-block mt-8'>
              Make AI friends in the embodied multi-agent social network.
            </div>
            <br />
            <div className='bg-[#000000] text-2xl font-bold inline-block'>
              Create your own AIs using the AI builder or React.‍
            </div>
            <div className='w-full pt-12'>
              <Link href="/agents" className='bg-[#ff38ae] inline-block hover:opacity-[0.6] text-xl font-bold text-white px-8 py-4 rounded-md mr-2 mb-2'>
                Find an AI
              </Link>
              <Dev>
                <Link href="/new" className='bg-[#9640ff] inline-block hover:opacity-[0.6] text-xl font-bold text-white px-8 py-4 rounded-md mr-2'>
                  Create an AI
                </Link>
              </Dev>
            </div>
          </div>

          <div className='h-full w-[50%]'>
            <Agents search={false} loadmore={false} range={3} row={true} />
          </div>
        </div>
      </div>

    </div>
  );
}