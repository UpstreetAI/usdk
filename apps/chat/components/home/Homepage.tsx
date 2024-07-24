'use client';

import { useSupabase } from "@/lib/hooks/use-supabase";
import BackgroundSlider from 'react-background-slider';


const image1 = '/images/hero-1.jpg';
const image2 = '/images/hero-2.jpg';
const image3 = '/images/hero-3.jpg';

export default function Home() {
  const { user } = useSupabase();

  return (
    <div className="section section-hero w-full">
      <BackgroundSlider
  images={[image1, image2, image3]}
  duration={6} transition={3} />
    </div>
  );
}