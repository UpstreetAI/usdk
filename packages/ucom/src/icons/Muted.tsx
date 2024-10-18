import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgMuted = ({
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
      d="m357.8 578.6 68.1 48.3 109.2 76.8 41.9 42.1V554.9l-6.1-189.4zM130.3 531.8l52 4.5 389.2-389.2.8-107.1s-40.6 31.2-46.5 28.9c-5.8-2.4-108.5 83.7-108.5 83.7l-96 81.4-88.3 2.9-106 8.8-5.6 46.5 6 111.6 3 128.1Z"
      className="muted_svg__cls-2"
    />
    <path
      d="M67.42 689.045 694.977 61.488l70.923 70.923-627.557 627.557z"
      className="muted_svg__cls-1"
    />
  </svg>
)
export default SvgMuted
