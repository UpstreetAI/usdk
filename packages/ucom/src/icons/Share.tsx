import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgShare = ({
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
      d="M579.4 514c-25.9 0-49.7-8.9-68.7-23.7l-3.1 3.1L333 600.9c0 2.1.3 4 .3 6.1 0 69.7-43.6 113.5-112.7 113.5S107.9 676.7 107.9 607s50.5-113.5 112.7-113.5 47.9 8.3 66.6 22.1l179.5-104.7s.4 3.6 0 0c-1.1-10.7 2-14.3 2.9-16.2L285.7 286.8c-18.4 13.1-40.8 20.9-65.1 20.9-62.3 0-112.7-43.9-112.7-113.5S158.4 80.7 220.6 80.7s112.7 50.8 112.7 113.5-.2 5.7-.4 8.6l184.6 109.5c10.4-15.8 35-25.2 61.8-25.2 69.2 0 112.7 50.8 112.7 113.5 0 69.8-43.4 113.6-112.6 113.6Z"
      className="share_svg__cls-1"
    />
  </svg>
)
export default SvgShare
