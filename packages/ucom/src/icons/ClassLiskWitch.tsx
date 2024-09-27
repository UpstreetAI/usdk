import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgClassLiskWitch = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    data-name="Layer 1"
    viewBox="0 0 800 800"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d="m223.3 352.6-28 116.4 43.2 100 1.1.1-43.8 59.9 6.2 22.6 124.6-53.7 59.3 19.6 60.5-16.9 118.2 50.6 19.6-22.2-32.3-58.3L593.4 469l-35.9-128-38.6 1.3-62.3 162.2-34.6-89.8-48.1 137.9-35.4-203zM292.5 239.3 198 40l-86 35.5 127.2 161.1z"
      className="classLiskWitch_svg__cls-1"
    />
    <path
      d="M422.3 316.2 457 439.7l64-194.2-172.8-20.3 30.7 249.2zM190 261l5.3 68.4 139.2-3.5L324 265zM583.7 272.6l-37.5-1.1-19.1 49.5 51.7-1z"
      className="classLiskWitch_svg__cls-1"
    />
    <path
      d="m284.8 97.7 20.3 56.4 384.9 6.4-36.6 521-538.2 26.8-5.6-536-57.3-53.1L67.4 760l655-19.2 25.3-638z"
      className="classLiskWitch_svg__cls-1"
    />
  </svg>
)
export default SvgClassLiskWitch
