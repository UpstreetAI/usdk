import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgPaint = ({
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
      d="m500 458.6-83.7-46.8-39.3-36.9-41.9-68.9L534.5 14.7l86.1 57.5 81.2 78.8 88.6 93.5zm-112.4-10.2 58.3 32.4 7.4 83.7-24.6 83.7-46.8 73.8-83.7 48.4-107.2 4.1-97.2 10.8-84.2-2.2 38.9-45.4 23.8-45.4 14.3-67 5.1-60.5 21.6-54 47.5-54 82.1-49.7 71.3-32.4 30.2 30.2z"
      className="paint_svg__st0"
    />
  </svg>
)
export default SvgPaint
