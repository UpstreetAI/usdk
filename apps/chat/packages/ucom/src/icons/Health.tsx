import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgHealth = ({
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
      d="m125 50 172.4-12.2 108.8 204.5L510.5 37.8 671.6 50l120.7 23.4L788 336 414.8 762.2h-37.3L7.7 333.8V73.4z"
      className="health_svg__st0"
    />
  </svg>
)
export default SvgHealth
