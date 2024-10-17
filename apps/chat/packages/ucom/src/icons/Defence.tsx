import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgDefence = ({
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
      d="M725.2 551.6 406.4 760 103.1 594.1 41.3 40l316 .6-56.8 77.4-175 2.5L176.8 553l229.7 112.2 238.6-168.1 33.4-371.7H504.6l-51.3-84.7 305.4-.6zM602.6 184.5 587 456.8 406.4 582.3l-173.9-97.1-26.7-300.8L335 209.9l69.1-91.8 73.6 73.4z"
      className="defence_svg__cls-1"
    />
  </svg>
)
export default SvgDefence
