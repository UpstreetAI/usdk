'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

function IconUpstreetChat({
  className,
  inverted,
  ...props
}: React.ComponentProps<'svg'> & { inverted?: boolean }) {
  const id = React.useId()

  return (
    <svg
      viewBox="0 0 1981 672"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-4', className)}
      {...props}
    >
      <path d="M453.8,216.4h-73.1c-38.1,38.1-75.3,75.2-112.3,112.1h43.5l33.2,33.2c-0.8,14.4-0.5,29.4-0.6,44.6c1.7,0,2.1-1.1,2.7-1.7
	c35.9-35.8,71.8-71.8,107.7-107.6c1.7-1.7,2.3-3.4,2.3-5.7v-68.9C457.2,219.8,456.5,217.8,453.8,216.4L453.8,216.4z"/>
<path d="M311.6,359.3L311.6,359.3h-74.3c-33.2,33.1-66,65.8-99.1,98.8c0.3,14.4-0.3,29.1-0.5,43.1c11.8,11.8,23.1,23.1,34.8,34.8
	c14.2-0.4,28.9-0.8,43.2-0.6c33.1-33.2,65.8-66,98.7-99V362c-0.8-1.2-1.6-2.1-2.7-2.6L311.6,359.3z"/>
<path d="M59-0.2L-0.5,59.4v118.9l61,61h174.1L41.9,431.9v158.4l18.5,18.6l2.6,2.5L81.5,630h158.4l192.7-192.8v174.1l61,61h119
	l59.5-59.5V2.3l-2.6-2.5C669.5-0.2,59-0.2,59-0.2z M592.1,647.2L592.1,647.2c0-0.1-79.9-0.1-79.9-0.1c-18.1-18.1-35.9-35.8-54-54
	c-0.6-57.5,0.4-115.4,0.4-173.7c4-3.8,8.2-7.7,12.3-11.5c-6.9-6.8-13.6-13.3-19.9-19.7c-73.4,73.2-146.8,146.6-219.7,219.5
	c-44.3,0.6-87.8-0.3-130.8-0.2c-11.7-11.7-22.9-23-34.5-34.5V443.5c73.6-73.6,146.8-147,220-220.2c-6.6-6.6-13.1-13.1-19.9-19.9
	c-3.6,3.9-7.5,8.2-10.4,11.6H80.4c-17.7-17.8-35.4-35.4-53.5-53.6v-81l54.9-54.9h563.4c1.4,0.4,2,1.3,2.3,1.8
	c1.4,188.2,0,376.2,0.8,563.6c-18.9,18.9-37.3,37.3-56.2,56.1V647.2z"/>
<path d="M587.4,105.9L587.4,105.9c0-4.5-0.1-8.9,0-13.3c0-2.7-0.6-4.9-3.2-6.2H122c-10,10-19.8,19.8-30.1,30.1
	c-0.8,5.4-0.4,11.5-0.3,16.7c8.9,8.8,17.1,17.1,25.9,25.7c73.9-1.3,148.4,0,222.9,0.1c9.4,9.4,18.6,18.5,27.6,27.7
	c2.1,2.1,4.2,3,7.3,2.9h72.5c1.7,0,3.4-0.2,4.6,0.6c10.3,10.3,20.7,20.7,31.5,31.5c-0.6,26.7,0.7,54,0.5,81.8
	c10.2,10.2,20.4,20.3,30.5,30.4v222.8c8.5,8.5,16.9,16.8,25.6,25.5h15c1.3,0,2.6-0.3,3.6-1.3c9.4-9.5,18.8-18.9,28.4-28.5v-4.2
	c0-22.5-0.1-45.1-0.1-67.6c0-66,0.1-132,0.1-198s0-117.9-0.1-176.9V105.9z"/>
<path d="M754.5,326.9c5.8,8.2,14.6,14.8,26.4,19.9c11.8,5.1,25.3,7.6,40.7,7.6s26-2.1,36.2-6.4s18.5-10.6,24.7-18.9
	c6.3-8.3,10-16.4,11.3-24.3s1.9-21.6,1.9-41.1V91.4h-67v189.8c0,12.8-0.6,21-1.8,24.4s-4,5.2-8.2,5.2s-6.2-1.6-7.4-4.7
	s-1.8-10.3-1.8-21.6V91.4h-67v152.4c0,29.1,0.5,48.1,1.6,57.2S748.6,318.7,754.5,326.9L754.5,326.9z"/>
<path d="M988.7,245.2h18c14.6,0,26.5-2,35.6-6c9.1-4,15.3-9.8,18.7-17.3c3.4-7.5,5.1-19.5,5.1-36v-22.4c0-16.1-0.9-28-2.6-35.7
	c-1.8-7.7-5.1-14.2-10-19.6s-12.3-9.5-22.1-12.4c-9.8-2.9-23.8-4.3-42.1-4.3h-67.5v257.6h67V245.4L988.7,245.2z M988.7,135.5
	c8.7,0,14.4,1.3,17.2,4s4.1,8.4,4.1,17.2v21.2c0,9.5-1.2,15.8-3.6,18.9c-2.4,3-6.7,4.5-12.8,4.5s-3,0-4.9-0.2V135.5L988.7,135.5z"/>
<path d="M1098.5,212.8c5.4,5,16.4,13,33.1,24c16.6,10.9,27.1,18.7,31.3,23.4c4.1,4.7,6.2,14.6,6.2,29.7s-1.1,12.1-3.3,15.6
	c-2.2,3.5-5.5,5.3-9.9,5.3s-7.6-1.4-9.3-4.1c-1.7-2.8-2.6-9-2.6-18.6v-31.3h-62.2v16.9c0,19.3,2,34.2,5.9,44.7s12.2,19.1,24.9,25.9
	c12.7,6.8,28,10.2,45.9,10.2s30.6-2.9,43-8.8c12.3-5.9,20.6-13.2,24.9-21.9c4.3-8.7,6.4-22.2,6.4-40.6s-3.9-43.5-11.6-54.9
	c-7.7-11.3-26.5-25.9-56.3-43.6c-10.4-6.1-16.7-11.4-18.9-15.7c-2.3-4.4-3.5-10.8-3.5-19.4s1-11.7,3.1-15s5.1-4.9,9.1-4.9
	s6.4,1.2,8,3.7c1.6,2.4,2.4,8.1,2.4,17v19.1h62.2v-10.2c0-20.5-2-35-6-43.5s-12.1-15.6-24.3-21.2c-12.2-5.6-27.1-8.4-44.5-8.4
	s-29.5,2.6-40.7,7.7s-19.4,12.3-24.4,21.4s-7.6,23.5-7.6,43.3s1.8,24.9,5.3,33.7c3.6,8.8,8,15.7,13.4,20.7V212.8z"/>
<polygon points="1281.9,349 1348.9,349 1348.9,143 1388.6,143 1388.6,91.4 1242.3,91.4 1242.3,143 1281.9,143 "/>
<path d="M1546,202.1c5-6.9,7.5-20.4,7.5-40.4s-3.5-37.9-10.6-48c-7.1-10-16.2-16.3-27.4-18.7c-11.2-2.4-32.6-3.7-64.2-3.7h-47.4
	v257.6h67V232.8c9.2,0,14.9,1.6,17.1,4.9c2.2,3.3,3.3,11.8,3.3,25.6v85.6h62.2V281c0-20.8-0.6-33.5-1.7-38.1s-4-9.7-8.5-15.2
	c-4.6-5.5-13.5-9.9-26.7-13.2C1531.2,213.1,1541,209,1546,202.1L1546,202.1z M1491.2,169.5c0,11.3-1.5,18.1-4.5,20.1
	c-3,2.1-8.3,3.1-15.8,3.1v-57.3c7.7,0,13.1,1.3,16,3.8s4.4,7.9,4.4,16.1L1491.2,169.5L1491.2,169.5z"/>
<polygon points="1646.4,240.8 1688.2,240.8 1688.2,191.8 1646.4,191.8 1646.4,143 1691.1,143 1691.1,91.4 1579.4,91.4 1579.4,349 
	1695.5,349 1695.5,297.4 1646.4,297.4 "/>
<polygon points="1830.9,297.4 1781.7,297.4 1781.7,240.8 1823.6,240.8 1823.6,191.8 1781.7,191.8 1781.7,143 1826.4,143 
	1826.4,91.4 1714.8,91.4 1714.8,349 1830.9,349 "/>
<polygon points="1834.4,91.4 1834.4,143 1874,143 1874,349 1941,349 1941,143 1980.8,143 1980.8,91.4 "/>
<path d="M1367.6,417.7c-42,0-78.5,1.9-114.7-0.6c-25.6-1.8-41.8,12.4-58,31.4c28.2-3.9,56-4.9,89.6-1.9
	c-53.3,44.4-102.1,85-151,125.6c30.2-1.6,59.6-2.3,81.8-27.1c8.5-9.5,16.7-10.5,25.7-0.5c22.1,24.6,51.4,26.2,81.7,27
	c-22.6-18.9-45.1-37.8-69.6-58.2c38.2-32,74.1-62,114.3-95.8L1367.6,417.7z"/>
<path d="M916.3,518.6c-1-14.7,1.7-30.7-2.4-44c-3.3-10.6-18.4,0-27.6-7.6c13.1-22.9,25.8-45.2,38.9-67.9H742.7
	c20.3,10.8,26,35.2,45.8,28.9c26.8-8.6,53.1-2.2,86.6-4.6c-23.6,27.9-29.7,56-31.1,86c-0.2,4.8-4.6,10.1,1.7,13.1
	c5.3,2.5,8.5-2.3,11.1-6.8c6.1-10.1,12.2-20.1,20.8-34.3c3.2,52.4,3.2,52.7,18.2,52.7C905.4,534.1,917.5,537.9,916.3,518.6
	L916.3,518.6z"/>
<path d="M834.1,437.4c-9.9,1.1-24.2-8.3-26.3,14.4c-3.4,36.5-8,72.9-13,109.2c-2.4,17.2,3.6,22.5,17.5,19.5
	c14.3,3.2,18.9-3.6,20.1-19.5c2.7-34.8,7.5-69.4,11.6-104.1c1.2-9.6,4.3-21-10-19.4L834.1,437.4z"/>
<path d="M1062.6,490.1c-31.4-6.1-54.6-2.7-74.9,17.8c-9.2,9.3-20.5,15.9-30.8,23.7c0.4-16.4,0.7-32.9,1-49.3
	c0.3-15.9-10.6-12-18.2-11.8c-7.3,0.2-18.5-5.2-18.6,11c-0.1,21.8,0,43.6,0,65.8c11.2-1.7,16.2-11,24.7-9.2l0,0
	c-8.7,16.1-28,19.5-37.3,37C972.9,576.1,1011,524.7,1062.6,490.1L1062.6,490.1z"/>
<path d="M1155.2,418.6L1155.2,418.6h-169c19.9,19.4,31.9,36.6,60.1,28.1c27.1-8.1,57.3-2.9,86.2-3.5c-0.4,1.8-0.7,3.6-1.1,5.4l0,0
	c-51.9,42.2-103.9,84.4-155.8,126.6c25.3-5,51.9-1.7,72.7-18.8c40.9-33.4,153.2-128.2,163.3-137.9
	C1190.4,418.5,1172.8,418.5,1155.2,418.6L1155.2,418.6z"/>
<g>
	<path d="M1385.6,410H1517v24h-102.7c19.5,53.8,50,89.6,102.7,112.6v25.1C1448.7,549.4,1393.3,481.5,1385.6,410z"/>
	<path d="M1647.5,572.2V481h-83.7v91.2h-24.2V410h24.2v48.6h83.7V410h23.7v162.2H1647.5z"/>
	<path d="M1802,572V481c0,0-69,0-71.2,0c-12.4,31.9-12.4,57.5-12.4,90.9h-24.4v-24.4c0-40,12-79.8,33.9-113.3h-33.2v-24h131.9V572
		H1802z M1757.7,434.2c-5.9,7.7-11.5,15.6-16.3,24.2h60.6v-24.2H1757.7z"/>
	<path d="M1926.4,434.2V572h-24V434.2h-54.1v-24h131.9v24H1926.4z"/>
</g>
    </svg>
  );
}

function IconNextChat({
  className,
  inverted,
  ...props
}: React.ComponentProps<'svg'> & { inverted?: boolean }) {
  const id = React.useId()

  return (
    <svg
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-4', className)}
      {...props}
    >
      <defs>
        <linearGradient
          id={`gradient-${id}-1`}
          x1="10.6889"
          y1="10.3556"
          x2="13.8445"
          y2="14.2667"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={inverted ? 'white' : 'black'} />
          <stop
            offset={1}
            stopColor={inverted ? 'white' : 'black'}
            stopOpacity={0}
          />
        </linearGradient>
        <linearGradient
          id={`gradient-${id}-2`}
          x1="11.7555"
          y1="4.8"
          x2="11.7376"
          y2="9.50002"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={inverted ? 'white' : 'black'} />
          <stop
            offset={1}
            stopColor={inverted ? 'white' : 'black'}
            stopOpacity={0}
          />
        </linearGradient>
      </defs>
      <path
        d="M1 16L2.58314 11.2506C1.83084 9.74642 1.63835 8.02363 2.04013 6.39052C2.4419 4.75741 3.41171 3.32057 4.776 2.33712C6.1403 1.35367 7.81003 0.887808 9.4864 1.02289C11.1628 1.15798 12.7364 1.8852 13.9256 3.07442C15.1148 4.26363 15.842 5.83723 15.9771 7.5136C16.1122 9.18997 15.6463 10.8597 14.6629 12.224C13.6794 13.5883 12.2426 14.5581 10.6095 14.9599C8.97637 15.3616 7.25358 15.1692 5.74942 14.4169L1 16Z"
        fill={inverted ? 'black' : 'white'}
        stroke={inverted ? 'black' : 'white'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <mask
        id="mask0_91_2047"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x={1}
        y={0}
        width={16}
        height={16}
      >
        <circle cx={9} cy={8} r={8} fill={inverted ? 'black' : 'white'} />
      </mask>
      <g mask="url(#mask0_91_2047)">
        <circle cx={9} cy={8} r={8} fill={inverted ? 'black' : 'white'} />
        <path
          d="M14.2896 14.0018L7.146 4.8H5.80005V11.1973H6.87681V6.16743L13.4444 14.6529C13.7407 14.4545 14.0231 14.2369 14.2896 14.0018Z"
          fill={`url(#gradient-${id}-1)`}
        />
        <rect
          x="11.2222"
          y="4.8"
          width="1.06667"
          height="6.4"
          fill={`url(#gradient-${id}-2)`}
        />
      </g>
    </svg>
  )
}

function IconSearch({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 1200 1200"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-4', className)}
      {...props}
    >
      <title>Search icon</title>
      <path d="m746.39 887.86c-64.453 39.422-140.29 62.156-221.39 62.156-234.71 0-425.02-190.31-425.02-425.02 0-234.71 190.31-425.02 425.02-425.02s425.02 190.31 425.02 425.02c0 81.141-22.734 156.94-62.203 221.44l182.9 182.86c39.047 39.047 39.047 102.38 0 141.42-39.047 39.047-102.38 39.047-141.42 0zm3.6094-362.86c0 124.26-100.73 225-225 225s-225-100.73-225-225 100.73-225 225-225 225 100.73 225 225z"/>
    </svg>
  )
}

function IconOpenAI({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 24 24"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-4', className)}
      {...props}
    >
      <title>OpenAI icon</title>
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  )
}

function IconVercel({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      aria-label="Vercel logomark"
      role="img"
      viewBox="0 0 74 64"
      className={cn('size-4', className)}
      {...props}
    >
      <path
        d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z"
        fill="currentColor"
      ></path>
    </svg>
  )
}

function IconGitHub({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={cn('size-4', className)}
      {...props}
    >
      <title>GitHub</title>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function IconSeparator({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      fill="none"
      shapeRendering="geometricPrecision"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn('size-4', className)}
      {...props}
    >
      <path d="M16.88 3.549L7.12 20.451"></path>
    </svg>
  )
}

function IconArrowDown({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn('size-4', className)}
      {...props}
    >
      <path d="m205.66 149.66-72 72a8 8 0 0 1-11.32 0l-72-72a8 8 0 0 1 11.32-11.32L120 196.69V40a8 8 0 0 1 16 0v156.69l58.34-58.35a8 8 0 0 1 11.32 11.32Z" />
    </svg>
  )
}

function IconArrowRight({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn('size-4', className)}
      {...props}
    >
      <path d="m221.66 133.66-72 72a8 8 0 0 1-11.32-11.32L196.69 136H40a8 8 0 0 1 0-16h156.69l-58.35-58.34a8 8 0 0 1 11.32-11.32l72 72a8 8 0 0 1 0 11.32Z" />
    </svg>
  )
}

function IconUser({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn('size-4', className)}
      {...props}
    >
      <path d="M230.92 212c-15.23-26.33-38.7-45.21-66.09-54.16a72 72 0 1 0-73.66 0c-27.39 8.94-50.86 27.82-66.09 54.16a8 8 0 1 0 13.85 8c18.84-32.56 52.14-52 89.07-52s70.23 19.44 89.07 52a8 8 0 1 0 13.85-8ZM72 96a56 56 0 1 1 56 56 56.06 56.06 0 0 1-56-56Z" />
    </svg>
  )
}

function IconPlus({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn('size-4', className)}
      {...props}
    >
      <path d="M224 128a8 8 0 0 1-8 8h-80v80a8 8 0 0 1-16 0v-80H40a8 8 0 0 1 0-16h80V40a8 8 0 0 1 16 0v80h80a8 8 0 0 1 8 8Z" />
    </svg>
  )
}

function IconArrowElbow({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn('size-4', className)}
      {...props}
    >
      <path d="M200 32v144a8 8 0 0 1-8 8H67.31l34.35 34.34a8 8 0 0 1-11.32 11.32l-48-48a8 8 0 0 1 0-11.32l48-48a8 8 0 0 1 11.32 11.32L67.31 168H184V32a8 8 0 0 1 16 0Z" />
    </svg>
  )
}

function IconSpinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn('size-4 animate-spin', className)}
      {...props}
    >
      <path d="M232 128a104 104 0 0 1-208 0c0-41 23.81-78.36 60.66-95.27a8 8 0 0 1 6.68 14.54C60.15 61.59 40 93.27 40 128a88 88 0 0 0 176 0c0-34.73-20.15-66.41-51.34-80.73a8 8 0 0 1 6.68-14.54C208.19 49.64 232 87 232 128Z" />
    </svg>
  )
}

function IconMessage({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn('size-4', className)}
      {...props}
    >
      <path d="M216 48H40a16 16 0 0 0-16 16v160a15.84 15.84 0 0 0 9.25 14.5A16.05 16.05 0 0 0 40 240a15.89 15.89 0 0 0 10.25-3.78.69.69 0 0 0 .13-.11L82.5 208H216a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16ZM40 224Zm176-32H82.5a16 16 0 0 0-10.3 3.75l-.12.11L40 224V64h176Z" />
    </svg>
  )
}

function IconTrash({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn('size-4', className)}
      {...props}
    >
      <path d="M216 48h-40v-8a24 24 0 0 0-24-24h-48a24 24 0 0 0-24 24v8H40a8 8 0 0 0 0 16h8v144a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16V64h8a8 8 0 0 0 0-16ZM96 40a8 8 0 0 1 8-8h48a8 8 0 0 1 8 8v8H96Zm96 168H64V64h128Zm-80-104v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0Zm48 0v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0Z" />
    </svg>
  )
}

function IconRefresh({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn('size-4', className)}
      {...props}
    >
      <path d="M197.67 186.37a8 8 0 0 1 0 11.29C196.58 198.73 170.82 224 128 224c-37.39 0-64.53-22.4-80-39.85V208a8 8 0 0 1-16 0v-48a8 8 0 0 1 8-8h48a8 8 0 0 1 0 16H55.44C67.76 183.35 93 208 128 208c36 0 58.14-21.46 58.36-21.68a8 8 0 0 1 11.31.05ZM216 40a8 8 0 0 0-8 8v23.85C192.53 54.4 165.39 32 128 32c-42.82 0-68.58 25.27-69.66 26.34a8 8 0 0 0 11.3 11.34C69.86 69.46 92 48 128 48c35 0 60.24 24.65 72.56 40H168a8 8 0 0 0 0 16h48a8 8 0 0 0 8-8V48a8 8 0 0 0-8-8Z" />
    </svg>
  )
}

function IconStop({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn('size-4', className)}
      {...props}
    >
      <path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88 88.1 88.1 0 0 1-88 88Zm24-120h-48a8 8 0 0 0-8 8v48a8 8 0 0 0 8 8h48a8 8 0 0 0 8-8v-48a8 8 0 0 0-8-8Zm-8 48h-32v-32h32Z" />
    </svg>
  )
}

function IconSidebar({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn('size-4', className)}
      {...props}
    >
      <path d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16ZM40 56h40v144H40Zm176 144H96V56h120v144Z" />
    </svg>
  )
}

function IconMoon({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn('size-4', className)}
      {...props}
    >
      <path d="M233.54 142.23a8 8 0 0 0-8-2 88.08 88.08 0 0 1-109.8-109.8 8 8 0 0 0-10-10 104.84 104.84 0 0 0-52.91 37A104 104 0 0 0 136 224a103.09 103.09 0 0 0 62.52-20.88 104.84 104.84 0 0 0 37-52.91 8 8 0 0 0-1.98-7.98Zm-44.64 48.11A88 88 0 0 1 65.66 67.11a89 89 0 0 1 31.4-26A106 106 0 0 0 96 56a104.11 104.11 0 0 0 104 104 106 106 0 0 0 14.92-1.06 89 89 0 0 1-26.02 31.4Z" />
    </svg>
  )
}

function IconSun({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn('size-4', className)}
      {...props}
    >
      <path d="M120 40V16a8 8 0 0 1 16 0v24a8 8 0 0 1-16 0Zm72 88a64 64 0 1 1-64-64 64.07 64.07 0 0 1 64 64Zm-16 0a48 48 0 1 0-48 48 48.05 48.05 0 0 0 48-48ZM58.34 69.66a8 8 0 0 0 11.32-11.32l-16-16a8 8 0 0 0-11.32 11.32Zm0 116.68-16 16a8 8 0 0 0 11.32 11.32l16-16a8 8 0 0 0-11.32-11.32ZM192 72a8 8 0 0 0 5.66-2.34l16-16a8 8 0 0 0-11.32-11.32l-16 16A8 8 0 0 0 192 72Zm5.66 114.34a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32-11.32ZM48 128a8 8 0 0 0-8-8H16a8 8 0 0 0 0 16h24a8 8 0 0 0 8-8Zm80 80a8 8 0 0 0-8 8v24a8 8 0 0 0 16 0v-24a8 8 0 0 0-8-8Zm112-88h-24a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16Z" />
    </svg>
  )
}

function IconCopy({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn('size-4', className)}
      {...props}
    >
      <path d="M216 32H88a8 8 0 0 0-8 8v40H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-40h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8Zm-56 176H48V96h112Zm48-48h-32V88a8 8 0 0 0-8-8H96V48h112Z" />
    </svg>
  )
}

function IconCheck({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn('size-4', className)}
      {...props}
    >
      <path d="m229.66 77.66-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z" />
    </svg>
  )
}

function IconDownload({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn('size-4', className)}
      {...props}
    >
      <path d="M224 152v56a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16v-56a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0Zm-101.66 5.66a8 8 0 0 0 11.32 0l40-40a8 8 0 0 0-11.32-11.32L136 132.69V40a8 8 0 0 0-16 0v92.69l-26.34-26.35a8 8 0 0 0-11.32 11.32Z" />
    </svg>
  )
}

function IconClose({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn('size-4', className)}
      {...props}
    >
      <path d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128 50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z" />
    </svg>
  )
}

function IconEdit({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn('size-4', className)}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
      />
    </svg>
  )
}

function IconShare({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={cn('size-4', className)}
      viewBox="0 0 256 256"
      {...props}
    >
      <path d="m237.66 106.35-80-80A8 8 0 0 0 144 32v40.35c-25.94 2.22-54.59 14.92-78.16 34.91-28.38 24.08-46.05 55.11-49.76 87.37a12 12 0 0 0 20.68 9.58c11-11.71 50.14-48.74 107.24-52V192a8 8 0 0 0 13.66 5.65l80-80a8 8 0 0 0 0-11.3ZM160 172.69V144a8 8 0 0 0-8-8c-28.08 0-55.43 7.33-81.29 21.8a196.17 196.17 0 0 0-36.57 26.52c5.8-23.84 20.42-46.51 42.05-64.86C99.41 99.77 127.75 88 152 88a8 8 0 0 0 8-8V51.32L220.69 112Z" />
    </svg>
  )
}

function IconUsers({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={cn('size-4', className)}
      viewBox="0 0 256 256"
      {...props}
    >
      <path d="M117.25 157.92a60 60 0 1 0-66.5 0 95.83 95.83 0 0 0-47.22 37.71 8 8 0 1 0 13.4 8.74 80 80 0 0 1 134.14 0 8 8 0 0 0 13.4-8.74 95.83 95.83 0 0 0-47.22-37.71ZM40 108a44 44 0 1 1 44 44 44.05 44.05 0 0 1-44-44Zm210.14 98.7a8 8 0 0 1-11.07-2.33A79.83 79.83 0 0 0 172 168a8 8 0 0 1 0-16 44 44 0 1 0-16.34-84.87 8 8 0 1 1-5.94-14.85 60 60 0 0 1 55.53 105.64 95.83 95.83 0 0 1 47.22 37.71 8 8 0 0 1-2.33 11.07Z" />
    </svg>
  )
}

function IconExternalLink({
  className,
  ...props
}: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={cn('size-4', className)}
      viewBox="0 0 256 256"
      {...props}
    >
      <path d="M224 104a8 8 0 0 1-16 0V59.32l-66.33 66.34a8 8 0 0 1-11.32-11.32L196.68 48H152a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8Zm-40 24a8 8 0 0 0-8 8v72H48V80h72a8 8 0 0 0 0-16H48a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16v-72a8 8 0 0 0-8-8Z" />
    </svg>
  )
}

function IconChevronUpDown({
  className,
  ...props
}: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={cn('size-4', className)}
      viewBox="0 0 256 256"
      {...props}
    >
      <path d="M181.66 170.34a8 8 0 0 1 0 11.32l-48 48a8 8 0 0 1-11.32 0l-48-48a8 8 0 0 1 11.32-11.32L128 212.69l42.34-42.35a8 8 0 0 1 11.32 0Zm-96-84.68L128 43.31l42.34 42.35a8 8 0 0 0 11.32-11.32l-48-48a8 8 0 0 0-11.32 0l-48 48a8 8 0 0 0 11.32 11.32Z" />
    </svg>
  )
}

function IconUpstreet({
  className,
  inverted,
  ...props
}: React.ComponentProps<'svg'> & { inverted?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={cn('size-4', className)}
      viewBox="0 0 800 800"
      {...props}
    >
      <g>
        <path d="M540.5,257.7h-87c-45.4,45.4-89.6,89.5-133.6,133.4h51.8c13.4,13.4,26.1,26.1,39.5,39.5c-1,17.1-0.6,35-0.8,53
		c2,0,2.5-1.3,3.3-2c42.8-42.6,85.4-85.4,128.1-128c2-2,2.8-4,2.8-6.8c0-27.4,0-54.8,0-82C544.5,261.7,543.6,259.3,540.5,257.7z"/>
        <path d="M371.3,427.7L371.3,427.7l-88.4,0C243.4,467.1,204.4,506,165,545.2c0.4,17.1-0.4,34.6-0.6,51.3c14,14,27.5,27.5,41.4,41.4
		c16.9-0.5,34.4-1,51.4-0.8c39.4-39.5,78.3-78.5,117.4-117.8v-88.5C373.6,429.4,372.7,428.3,371.3,427.7z"/>
        <path d="M796.9,0H70.8L0,70.9v141.4l72.5,72.5h207.2L50.4,514.1v188.4l22,22.1l3.1,3l22,22.1h188.4l229.3-229.4v207.2l72.5,72.5
		h141.5l70.8-70.8V3L796.9,0z M705,770.2v-0.1h-95c-21.5-21.5-42.8-42.6-64.3-64.3c-0.8-68.4,0.5-137.3,0.5-206.7
		c4.8-4.5,9.8-9.1,14.6-13.6c-8.3-8.1-16.1-15.9-23.6-23.4c-87.3,87.1-174.7,174.4-261.4,261.2c-52.8,0.8-104.4-0.4-155.6-0.3
		c-13.9-13.9-27.3-27.4-41-41v-154c87.5-87.5,174.7-174.9,261.7-261.9c-7.9-7.9-15.6-15.6-23.6-23.6c-4.3,4.6-8.9,9.8-12.4,13.8
		H96.3c-21-21.1-42.1-42.1-63.6-63.8V96.1C54.3,74.5,76,52.8,97.9,30.9h670.2c1.6,0.5,2.4,1.5,2.8,2.1c1.6,223.9,0,447.6,1,670.5
		C749.4,726,727.5,747.9,705,770.2z"/>
        <path d="M699.4,126.3v-0.1c0-5.3-0.1-10.5,0-15.8c0-3.3-0.8-5.9-3.8-7.4h-550c-11.9,11.9-23.5,23.5-35.8,35.8
		c-1,6.4-0.5,13.6-0.4,19.9c10.6,10.5,20.4,20.4,30.8,30.6c87.9-1.5,176.5,0,265.2,0.1c11.1,11.1,22.1,22,32.9,33
		c2.5,2.5,5,3.6,8.6,3.5c28.8,0,57.5,0,86.3,0c2,0,4-0.3,5.5,0.8c12.3,12.3,24.6,24.6,37.5,37.5c-0.8,31.8,0.9,64.3,0.6,97.3
		c12.1,12.1,24.3,24.1,36.3,36.1v265c10.1,10.1,20.1,20,30.5,30.4c5.4,0,11.6,0,17.9,0c1.5,0,3.1-0.4,4.3-1.5
		c11.1-11.3,22.4-22.5,33.8-33.9c0-1.6,0-3.3,0-5c0-26.8-0.1-53.6-0.1-80.4c0-78.5,0.1-157,0.1-235.5
		C699.5,266.5,699.5,196.4,699.4,126.3z"/>
      </g>
    </svg>
  )
}

export {
  IconEdit,
  IconNextChat,
  IconUpstreetChat,
  IconSearch,
  IconOpenAI,
  IconVercel,
  IconGitHub,
  IconSeparator,
  IconArrowDown,
  IconArrowRight,
  IconUser,
  IconPlus,
  IconArrowElbow,
  IconSpinner,
  IconMessage,
  IconTrash,
  IconRefresh,
  IconStop,
  IconSidebar,
  IconMoon,
  IconSun,
  IconCopy,
  IconCheck,
  IconDownload,
  IconClose,
  IconShare,
  IconUsers,
  IconExternalLink,
  IconChevronUpDown,
  IconUpstreet
}
