import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgHome = ({
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
      d="m403.2 78.4-318 300.8 98.4 2.8-32.7 339.6h163.4l6.3-293.2 139.9-12.7L474 721.6h158.9l-7-329.6h89z"
      className="home_svg__st0"
    />
  </svg>
)
export default SvgHome
