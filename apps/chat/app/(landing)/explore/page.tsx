'use client'

import { AgentProps } from '@/components/agent-profile'
import Icon from '@/components/ui/icon'
import { getLatestAgents } from '@/lib/agents'
import { redirectToLoginTool } from '@/lib/redirectToLoginTool'
import { getAgentPreviewImageUrl } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

type Slide = {
  image: string
  text: string
  href: string
}

const slides: Slide[] = [
  {
    image:
      'https://www.videogameschronicle.com/files/2022/12/fortnite-chapter-4.webp',
    text: 'New: Build custom AI agents with Upstreet SDK!',
    href: 'https://github.com/UpstreetAI/sdk'
  },
  {
    image:
      'https://gameranx.com/wp-content/uploads/2023/01/Fortnite-Falcon-Scout.jpg',
    text: 'Chat with agents online',
    href: '#matchmaking'
  },
  {
    image:
      'https://i0.wp.com/explosionnetwork.com/wp-content/uploads/2023/09/39888-fortnite-chapter-4-thumbnail-news.jpg?resize=1280%2C640&ssl=1',
    text: 'Agent-to-agent conversations',
    href: 'https://docs.upstreet.ai/docs/category/blueprints'
  }
  // {
  //   image:
  //     'https://gameranx.com/wp-content/uploads/2023/01/Fortnite-Falcon-Scout.jpg',
  //   text: 'Slide 4'
  // }
]

const Slide = ({
  slide,
  index,
  slideIndex
}: {
  slide: Slide
  index: number
  slideIndex: number
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const isCurrentSlide = index === slideIndex

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
          backgroundSize: isHovered ? '160%' : isCurrentSlide ? '130%' : '100%'
        }}
      >
        <h1 className="absolute bottom-16 text-2xl tracking-wide shadow-md">
          {slide.text}
        </h1>
      </div>
    </div>
  )
}

const Carousel = () => {
  const [slideIndex, setSlideIndex] = useState(0)

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>()

  useEffect(() => {
    const changeTime = 3000
    const interval = setInterval(() => {
      setSlideIndex(prevIndex => (prevIndex + 1) % slides.length)
    }, changeTime)

    setIntervalId(interval)

    return () => {
      clearInterval(interval)
      clearInterval(intervalId)
    }
  }, [])

  const handleDotClick = (index: number) => {
    setSlideIndex(index)
    clearInterval(intervalId) // Clear the interval when dot is clicked
    const changeTime = 3000
    const interval = setInterval(() => {
      setSlideIndex(prevIndex => (prevIndex + 1) % slides.length)
    }, changeTime)
    setIntervalId(interval)
  }

  return (
    <div className="relative w-full max-w-[500px] h-64">
      {slides.map((slide, index) => (
        <Slide
          slide={slide}
          slideIndex={slideIndex}
          index={index}
          key={index}
        />
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
  )
}

const Card = ({
  headerContent,
  bodyContent,
  footerContent,
  children
}: {
  headerContent?: any
  bodyContent?: any
  footerContent?: any
  children?: any
}) => {
  return (
    <Link href="#">
      <div className="overflow-hidden rounded-3xl w-80 h-64 flex flex-col bg-black hover:bg-[#0e0e0e] hover:scale-105 transition-all cursor-pointer hover:shadow-[inset_0_0_0_calc(2rem*0.2)_rgba(248,249,255,0.5),inset_0_0_calc(2rem*0.2)_calc(2rem*0.5)_rgba(248,249,255,0.3),0_0_calc(2rem*0.2)_rgba(248,249,255,0.2)]">
        {children || (
          <>
            <div
              id="header"
              className="flex flex-row items-center justify-between"
            >
              {headerContent}
            </div>
            <span
              id="content"
              className="flex flex-col flex-1 line-clamp-5 px-6 text-xs opacity-80"
            >
              {bodyContent}
            </span>

            <div
              id="footer"
              className="px-6  h-fit flex flex-row justify-between items-center pb-4"
            >
              {footerContent}
            </div>
          </>
        )}
      </div>
    </Link>
  )
}

const Button = ({className="", ...props}: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => {
  return (
    <button className={"bg-[#FF38AE] relative font-black flex h-fit px-6 md:px-12 py-4 md:py-8 items-center justify-center text-center border-none font-sans text-2xl rounded-[calc(2rem*0.6)] p-[calc(2rem*0.5)] m-0 leading-none text-white shadow-[inset_0_0_0_0_rgba(248,249,255,0.5),inset_0_0_0_0_rgba(248,249,255,0.3),0_0_0_rgba(248,249,255,0.2)] transition-all ease-[0.2s] hover:shadow-[inset_0_0_0_calc(2rem*0.2)_rgba(248,249,255,0.5),inset_0_0_calc(2rem*0.2)_calc(2rem*0.5)_rgba(248,249,255,0.3),0_0_calc(2rem*0.2)_rgba(248,249,255,0.2)] group " + className}  {...props}>
      CHAT NOW
      <Icon
        name="arrowRight"
        className="flex group-hover:translate-x-1 ml-2 transition-all"
      />
      <span className="absolute h-full w-full overflow-hidden flex rounded-[calc(2rem*0.6)] z-0">
        <span className="absolute h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all ease-[1s] duration-300 group-hover:duration-800"></span>
      </span>
      {/* <span className="absolute top-0 left-0 h-[110%] w-[105%] rounded-[calc(2rem*0.8)] border border-transparent group-hover:border-[rgb(210,255,227,0.8)] opacity-0 group-hover:opacity-50 transition-all duration-200 animate-borders"></span> */}
    </button>
  )
}

const Section = ({ children, className = '', ...props }: any) => {
  return (
    <section
      className={
        'w-full py-2 md:py-8 h-full flex gap-1 md:gap-2 flex-col ' + className
      }
      {...props}
    >
      {children}
    </section>
  )
}

const ScrollableCardsList = ({ children, ...props }: any) => {
  return (
    <div className="relative">
      <div
        id="left-gradient"
        className="absolute left-0 top-0 h-full z-50 bg-gradient-to-r from-[#18181A] w-9"
      ></div>
      <div
        id="right-gradient"
        className="absolute right-0 top-0 h-full z-50 bg-gradient-to-l from-[#18181A] w-4 md:w-12"
      ></div>
      <div className="relative h-fit w-full flex flex-row gap-4 overflow-x-scroll py-4">
        {children}
      </div>
    </div>
  )
}

const Banner = () => {
  return (
    <div
      className="relative -mt-16 mb-16 top-16 left-0 z-60 overflow-visible !aspect-[2] md:!aspect-[3] w-screen h-auto flex select-none"
      style={{
        // background: 'radial-gradient(108.15% 725.07% at 100% 0%, rgba(21, 21, 21, 0.42) 0%, #151515 100%), #FF38AE',
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)), 
  url("/images/chatbackground.png")`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      }}
    >
      <div className="md:z-1 z-20 drop-shadow-lg md:drop-shadow-none h-full w-full flex md:justify-center md:items-start items-end flex-col py-10 md:pt-20 md:pt-0 px-10 md:px-40 gap-2">
        <div className="flex justify-center items-start flex-col -gap-2">
          <span className="text-4xl md:text-[2vw] font-bold">Chat with</span>
          <span className="text-7xl md:text-[10vw] font-['Impact'] -mt-3 pt-1">
            AI AGENTS
          </span>
        </div>

        <span className="text-sm md:text-xl pb-3 max-w-72 md:max-w-max text-right md:text-left">
          Welcome to Upstreet, a universe where AI and humans co-exist.
        </span>

        <Button onClick={async () => {
          // setIsLoading( true )
          // next-auth signIn() function doesn't work yet at Edge Runtime due to usage of BroadcastChannel
          await redirectToLoginTool()
        }}
        />
      </div>
      <div className="absolute h-full w-full top-0 left-0 z-10 bg-black bg-opacity-50 md:hidden block" />
      <img
        className="absolute -z-1 md:z-0 bottom-0 right-0 md:right-28 -left-8 md:left-auto transition-all h-[110%] object-contain drop-shadow-lg object-bottom pointer-events-none"
        src="/images/avatar.png"
      />
    </div>
  )
}

const Page = () => {


  const [latestAgents, setLatestAgents] = useState<AgentProps[]>()


  useEffect(() => {
    const _getLatestAgents = async () => {
      setLatestAgents(await getLatestAgents())
    }

    _getLatestAgents()
  }, [])

  return (
    <div className="h-fit w-full flex justify-center items-center flex-col overflow-hidden md:overflow-visible">
      {/* Banner */}

      <Banner />

      {/* <Section>
        <span className="uppercase pl-12 text-2xl font-black mb-2 px-2 py-1">
          From Upstreet
        </span>
        <ScrollableCardsList>
          <div className="ml-10">
            <Card />
          </div>
          <Card />
          <Card />
          <Card />
          <Card />
          <div className="mr-10">
            <Card />
          </div>
        </ScrollableCardsList>
      </Section> */}

      {
        latestAgents && (
          <Section className="pt-8">
            <div className="mx-4 md:mx-12 w-fit px-2 py-2 flex flex-row justify-center items-center rounded-lg">
              <span className="uppercase text-2xl font-black flex flex-row items-center group w-fit">
                Most Popular{' '}
              </span>
            </div>

            <ScrollableCardsList>
              {
                latestAgents?.map((agent, index) => {
                  console.log("agent", agent);
                  const playerSpec = agent.getPlayerSpec();
                  return (
                    <div className={index === 0 ? "ml-4 md:ml-10" : index === latestAgents.length - 1 ? "mr-10" : ""}>
                      <Card
                        headerContent={
                          <>
                            <Image
                              className="rounded-full object-cover m-4"
                              width={60}
                              height={60}
                              alt={'Agent Profile Image'}
                              src={getAgentPreviewImageUrl(agent.get)}
                            ></Image>
                            <div className="flex flex-col items-start w-full justify-start">
                              <h3 className="text-xl font-bold mb-1">Lucy</h3>
                              <span className="flex flex-1 flex-row items-center justify-center opacity-60 text-sm">
                                <Icon name="briefcase" className="h-4 w-4 mr-2" />{' '}
                                <span>Guide</span>
                              </span>
                              <span className="flex flex-1 flex-row items-center justify-center opacity-60 text-sm">
                                <Icon name="pin" className="h-4 w-4 mr-2" />{' '}
                                <span>Andromeda</span>
                              </span>
                            </div>
                          </>
                        }
                        bodyContent={
                          <>
                            Previously a kiosk bot at the USGR (Upstreet Galactic
                            Relations) Center, L.U.C.Y. was designed to be friendly,
                            dependable, and possess knowledge of most galactic politics.
                            If you{'’'}re ever stuck, you know who to talk to.
                          </>
                        }
                        footerContent={
                          <>
                            <span className="flex flex-row gap-1 items-center justify-center font-black opacity-30">
                              <Icon name="users" className="h-4 w-4" /> 70k
                            </span>
                            <span className="flex flex-row gap-1 items-center justify-center font-black opacity-30">
                              <Icon name="checkCircle" className="h-4 w-4" /> OFFICIAL
                            </span>
                          </>
                        }
                      />
                    </div>
                  )
                })
              }
            </ScrollableCardsList>
        </Section>
        )
      }

      <Section>
        <Link
          href="#"
          className="mx-4 md:mx-12 w-fit px-2 py-2 flex flex-row justify-center items-center hover:shadow-[inset_0_0_0_calc(2rem*0.2)_rgba(248,249,255,0.5),inset_0_0_calc(2rem*0.2)_calc(2rem*0.5)_rgba(248,249,255,0.3),0_0_calc(2rem*0.2)_rgba(248,249,255,0.2)] mb-2 rounded-lg"
        >
          <span className="uppercase text-2xl font-black flex flex-row items-center group w-fit">
            News{' '}
            <Icon
              name="arrowRight"
              className="flex group-hover:translate-x-1 ml-2 transition-all"
            />
          </span>
        </Link>

        <ScrollableCardsList>
          <div className="min-w-[400px] ml-4 md:ml-10">
            <Carousel />
          </div>
          <Card
              headerContent={
                <div className='flex flex-col justify-center items-center -px-2 w-full overflow-hidden'>
                  <Image
                    className="w-full object-cover -px-2 h-34 overflow-hidden"
                    width={200}
                    height={10}
                    alt={'News object'}
                    src={'/images/chatbackground.png'}
                  >
                  </Image>
                  <div className="flex flex-col items-start w-full justify-start px-4 pt-1">
                    <h3 className="text-xl font-black mb-1">Build your own agent</h3>
                    {/* <span className="flex flex-1 flex-row items-center justify-center opacity-60 text-sm">
                      <Icon name="briefcase" className="h-4 w-4 mr-2" />{' '}
                      <span>Guide</span>
                    </span>
                    <span className="flex flex-1 flex-row items-center justify-center opacity-60 text-sm">
                      <Icon name="pin" className="h-4 w-4 mr-2" />{' '}
                      <span>Andromeda</span>
                    </span> */}
                  </div>
                </div>
              }
              bodyContent={
                <div className='-mx-2'>
                  Develop and deploy an AI agent in minutes. Use millions of libraries to make it do anything you want.
                </div>
              }
            />
        </ScrollableCardsList>
      </Section>
    </div>
  )
}

export default Page
