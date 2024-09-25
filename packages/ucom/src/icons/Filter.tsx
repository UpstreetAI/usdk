import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgFilter = ({
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
      d="m315.9 605.8 70.7 13.3v141.3l-61.8-13.3V605.8H316ZM417.5 623.5l70.7 13.3v101.6l-61.8-13.3V623.5h-8.8ZM713.4 195.1 678.1 40.5H143.6L86.2 212.8l216.4 176.7v181.1c-4.4 0 203.2 35.3 203.2 35.3V385c-4.4 0 207.6-189.9 207.6-189.9M452.8 557.3 360 530.8V367.4L214.2 226.1l375.5-13.3-136.9 154.6z"
      className="filter_svg__cls-1"
    />
  </svg>
)
export default SvgFilter
