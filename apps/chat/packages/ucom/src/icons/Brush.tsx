import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgBrush = ({
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
      d="m294.9 701.6 55.6 4.1 132.7-291.8-110.3-114.7L80 428.5l6.8 77.9 114.4-55.3-117.3 91 37.8 73.3 89.4-63.4-77.4 93.3 123 65.6 74.7-151.8zM469.7 282.5l-55.8 39.8 48.6 50.3 44.8-53.7zM478.9 276.5l34.4 36.5L720 132.4l-53.3-53.3z"
      className="brush_svg__cls-1"
    />
  </svg>
)
export default SvgBrush
