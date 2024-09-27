import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgVr = ({
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
      d="M720 574.8H619.8L569 472.5h-33.5v102.3h-97.9V225.2h209.5l54.7 54.9v124.8l-45.5 45L720 574.7ZM603.8 320.2l-9.2-10h-59.2v77.3h59.2l9.2-10v-57.4ZM186 574.8 80 225.2h100.3l61.5 227.1h2.3l61.5-227.1h100.2L303.2 574.6H186Z"
      className="vr_svg__cls-1"
    />
  </svg>
)
export default SvgVr
