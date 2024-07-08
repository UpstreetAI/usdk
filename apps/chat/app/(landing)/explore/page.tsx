"use client";

import Icon from '@/components/ui/icon';
import React, { useEffect, useState } from 'react';

const slides = [
  {
    image: "https://www.videogameschronicle.com/files/2022/12/fortnite-chapter-4.webp",
    text: "New: Talk to agents with voice!",
  },
  {
    image: "https://gameranx.com/wp-content/uploads/2023/01/Fortnite-Falcon-Scout.jpg",
    text: "Play Adventure Mode with friends",
  },
  {
    image: "https://i0.wp.com/explosionnetwork.com/wp-content/uploads/2023/09/39888-fortnite-chapter-4-thumbnail-news.jpg?resize=1280%2C640&ssl=1",
    text: "Customize your avatar",
  },
  {
    image: "https://gameranx.com/wp-content/uploads/2023/01/Fortnite-Falcon-Scout.jpg",
    text: "Slide 4",
  },
];

const Slide = ({ slide, index, slideIndex }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isCurrentSlide = index === slideIndex;

  return (
    <div
      className={`absolute top-0 left-0 inset-0 transition-opacity duration-500 ease-in-out h-full w-full ${
        isCurrentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
      }`}
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-full h-full rounded-3xl p-6 mb-6 flex items-end bg-cover bg-center bg-no-repeat text-white font-bold shadow-md cursor-pointer hover:shadow-lg transition-all duration-300"
        style={{
          backgroundImage: `linear-gradient(0deg, black, transparent), url(${slide.image})`,
          backgroundSize: isHovered ? '160%' : isCurrentSlide ? '130%' : '100%',
        }}
      >
        <h1 className="absolute bottom-16 text-2xl tracking-wide shadow-md">
          {slide.text}
        </h1>
      </div>
    </div>
  );
};

const Carousel = () => {
  const [slideIndex, setSlideIndex] = useState(0);

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>();

  useEffect(() => {
    const changeTime = 3000;
    const interval = setInterval(() => {
      setSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, changeTime);

    setIntervalId(interval)

    return () => {
      clearInterval(interval);
      clearInterval(intervalId);
    }
  }, []);

  const handleDotClick = (index) => {
    setSlideIndex(index);
    clearInterval(intervalId); // Clear the interval when dot is clicked
    const changeTime = 3000;
    const interval = setInterval(() => {
      setSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, changeTime);
    setIntervalId(interval)
  };

  return (
    <div className="relative w-full max-w-[500px] h-64">
      {slides.map((slide, index) => (
        <Slide slide={slide} slideIndex={slideIndex} index={index} key={index} />
      ))}
      <div className="absolute bottom-8 left-6 flex space-x-2 z-10">
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-4 h-4 rounded-full bg-white opacity-60 cursor-pointer transition-all duration-150 ease-in-out ${
              index === slideIndex ? 'w-8 opacity-100' : ''
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

const Button = () => {
  return (
    <button className="bg-[#FF38AE] relative font-black flex h-fit px-12 py-8 items-center justify-center text-center border-none font-sans text-2xl rounded-[calc(2rem*0.6)] p-[calc(2rem*0.5)] m-0 leading-none text-white shadow-[inset_0_0_0_0_rgba(248,249,255,0.5),inset_0_0_0_0_rgba(248,249,255,0.3),0_0_0_rgba(248,249,255,0.2)] transition-all ease-[0.2s] hover:shadow-[inset_0_0_0_calc(2rem*0.2)_rgba(248,249,255,0.5),inset_0_0_calc(2rem*0.2)_calc(2rem*0.5)_rgba(248,249,255,0.3),0_0_calc(2rem*0.2)_rgba(248,249,255,0.2)] group">
      CHAT NOW
      <Icon name='arrowRight' className='flex group-hover:translate-x-1 ml-2 transition-all' />

      <span className="absolute h-full w-full overflow-hidden flex rounded-[calc(2rem*0.6)] z-0">
        <span className="absolute h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all ease-[1s] duration-300 group-hover:duration-800"></span>
      </span>
      {/* <span className="absolute top-0 left-0 h-[110%] w-[105%] rounded-[calc(2rem*0.8)] border border-transparent group-hover:border-[rgb(210,255,227,0.8)] opacity-0 group-hover:opacity-50 transition-all duration-200 animate-borders"></span> */}
    </button>
  )
}

const Page = () => {
  return (
    <div className='h-fit w-full flex justify-center items-center flex-col overflow-visible'>

    {/* Banner */}

    <div className="relative -mt-16 top-16 left-0 z-60 overflow-visible !aspect-[2] w-screen h-auto flex select-none" 
    style={{
      // background: 'radial-gradient(108.15% 725.07% at 100% 0%, rgba(21, 21, 21, 0.42) 0%, #151515 100%), #FF38AE',
      backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.73)), 
      url("/images/chatbackground.png")`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center',
    }}  
    >
      {/* <div className='absolute top-0 left-0 w-full h-full'> */}

      <div className='h-full w-full flex md:justify-center md:items-start items-end flex-col pt-20 md:pt-0 px-10 md:px-40 gap-2'>
        <div className='flex justify-center items-start flex-col -gap-2'>
          <span className="text-4xl font-bold">Chat with</span>
          <span className="text-9xl font-['Impact'] -mt-3">LUCY</span>
        </div>

          <span className="text-xl pb-3">Your guide to the Upstreet world.</span>

        <Button />
      </div>
      <img className='absolute z-60 bottom-0 right-28 h-[110%] object-contain drop-shadow-lg object-bottom pointer-events-none' src="/images/avatar.png" />
      {/* </div> */}
    </div>

  <section className='w-full py-3 px-12'>
    <span className='uppercase text-3xl font-black italic py-14'>From Upstreet</span>
    <div className='h-fit w-full'>
      <Carousel />
    </div>
    </section>

    </div>
  );
};

export default Page;
