'use client';

import BackgroundSlider from 'react-background-slider';
import styles from './Homepage.module.css';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Button } from '../ui/button';


const Hero1 = '/images/hero-1.jpg';
const Hero2 = '/images/hero-2.jpg';
const Hero3 = '/images/hero-3.jpg';

export default function Home() {

  return (
    <div className="section section-hero w-full h-full">
      <BackgroundSlider
        images={[Hero1, Hero2, Hero3]}
        duration={6}
        transition={3}
      />

      <div className="flex flex-nowrap p-4 mx-auto max-w-6xl h-full">

        <div className='my-auto w-[70%]'>
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
            {'Make AI friends in the embodied multi-agent social network.'}
          </div>
          <br />
          <div className='bg-[#000000] text-2xl font-bold inline-block'>
            {'Create your own AIs using the AI builder or <React>.‍'}
          </div>

          <div className='w-full pt-12'>
              <Button className='bg-[#ff38ae] text-xl font-bold text-white px-8 py-6 mr-2'>
                Find an AI
              </Button>
              <Button className='bg-[#9640ff] text-xl font-bold text-white px-8 py-6 mr-2'>
                Create an AI
              </Button>
              <Button className='bg-[#e5e2ee] text-xl font-bold text-black px-8 py-6'>
                Join Waitlist
              </Button>
          </div>
          
        </div>

        <div className='h-full w-[30%]'>
          <Carousel 
            autoPlay={true} 
            infiniteLoop={true} 
            showArrows={false} 
            showThumbs={false} 
            showIndicators={false} 
            showStatus={false}
            className='absolute bottom-0 w-[440px]'
          >
            <div>
              <img src="/images/avatar-1.png" />
            </div>
            <div>
              <img src="/images/avatar-2.png" />
            </div>
          </Carousel>
        </div>
      </div>

    </div>
  );
}