import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgHead = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    viewBox="0 0 800 800"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d="m653.5 431.8-23-4.6-34.3 78.4-33.6 1.2 34.1-86.4-40.8-77.2-54.5-53.4-52.1 41.2-70.3 39.8 8-30.9 2.2-47.7L282 343.3l-67.4 87.4s39.3 90.6 37.5 92l-27.2 1.2-36.4-73.9-30.3 14.8 8.6-65-20.4-89.5 11.4-44.3 26.1-73.8 59-61.4 72.6-51.1 73.6-4.6 85.1.8L540 107l45.3 42 31.7 55.7 20.4 40.9 14.8 72.6-5 64.8zm-365.2-61.4 84-46.5-20.4 80.9L463 349.2l41.9-26.4 30.6 34.1 34.1 61.4-30.6 75-22.7 44.3-38.5 36.8-57.9 33.8-9.3 2.1-22.5-5.6-56.7-29.7-41.9-40.9-30.6-61.4-18.2-40.9zm5.7 254.5-1.2-42.2 79.4 39.9 38.4 8 25.2-6.8 71.5-40.9 8 58 27.2 29.6L410.6 725l-146.1-47.7 18.2-8z"
      className="head_svg__st0"
    />
  </svg>
)
export default SvgHead
