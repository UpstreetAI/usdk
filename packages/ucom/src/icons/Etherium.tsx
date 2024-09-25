import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgEtherium = ({
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
      d="M401.1 506.5 129.9 388.3 398.9 40l271.2 345.1-268.9 121.4Zm262.3-38.4L398.9 760 138.8 473.3l262.3 97.2 262.3-102.3Z"
      className="etherium_svg__cls-1"
    />
  </svg>
)
export default SvgEtherium
