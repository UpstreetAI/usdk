import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgCrown = ({
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
    <g className="crown_svg__cls-1">
      <path
        d="M57.9 198.4 104.7 760h561.6l93.6-514.8-234 187.2L479.2 58l-234 327.6z"
        className="crown_svg__cls-3"
      />
    </g>
  </svg>
)
export default SvgCrown
