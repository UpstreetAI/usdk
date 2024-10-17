import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgErase = ({
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
      d="M746.8 737.4H195.4L40.1 593v-2.6L420.8 62.5h10.9l321.7 274.3 6.6 10.9L431.7 676 749 652l-2.2 85.3ZM434 586.3 230.5 422.2h-6.6L103.5 579.7v4.4l113.8 107.3 133.5-10.9 83.1-87.5v-6.7Z"
      className="erase_svg__cls-1"
    />
  </svg>
)
export default SvgErase
