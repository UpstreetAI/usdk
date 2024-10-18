import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgMatch = ({
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
      d="M84.4 661V517l462 34v-76l169.2 128-169.2 122v-78z"
      className="match_svg__st0"
    />
    <path
      d="m208 493.5-6.3-5.1 52.5-63 25.5 73.4 213.1 15.7 21.1-65.3v-39.5L653.2 515l19.2-14.1-57.3-99.1-75.5-104.4-103.3-26.3-1.7-19.7 20.2-28 24.1-82-22.1-42.6-42.1-21-44.5-2.8-38.9 18.8-26.2 46 18.7 81.7 19 28.3-4.9 21.3L234.5 299 164 395.9l-41.4 91.3z"
      className="match_svg__st0"
    />
  </svg>
)
export default SvgMatch
