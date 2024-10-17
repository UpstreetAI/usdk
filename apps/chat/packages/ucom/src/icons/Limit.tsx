import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgLimit = ({
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
      d="m213.3 402.8 160.4 118.8-57.8 199.2L12.4 561 227.6 12.5l166.9 109.9zm352.8 98.9L462.6 372.2 627.3 239l160.3 93.3-344.8 455.2-112.3-59.1z"
      className="limit_svg__st0"
    />
  </svg>
)
export default SvgLimit
