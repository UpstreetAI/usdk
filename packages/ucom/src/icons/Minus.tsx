import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgMinus = ({
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
      d="M792.3 320.5v-19.9l-19.9 1-365.1 12.6h-19.9L28.6 295.4l-20.9-1v211.3l19.9-1 358.9-10.5h19.9l366.2 10.5 19.9 1V320.5z"
      className="minus_svg__st0"
    />
  </svg>
)
export default SvgMinus
