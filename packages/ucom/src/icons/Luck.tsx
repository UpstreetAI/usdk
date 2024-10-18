import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgLuck = ({
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
      d="m747.9 430.3-258.2-8 153.8 159.9L617.3 689l-98.7-.2-84.2 45.3-95.7-32-5.7-234.5-168.4 106.7-89.9-29.4-31.9-114.6-31.3-98.6 48.7-64 197.3 24-113.2-141.3 17.4-98.6 121.9-13.3 101.6-17.9L478 49.1l-14.5 205.2L637.7 137l87.9 13.3 16.5 137 46.4 68.3zM295.2 574.2l-75.4 205.2H86.3l-34.8-98.6 214.7-130.6z"
      className="luck_svg__st0"
    />
  </svg>
)
export default SvgLuck
