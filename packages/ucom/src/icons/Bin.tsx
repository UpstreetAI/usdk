import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgBin = ({
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
      d="m112.3 216-26.8-60.2 160.6-40.1-6.7-66.9L533.8 8.6l6.7 66.9 171.4-33.4 2.5 80.3zm475 575.4H202.4l-49.9-541.9 488.4 13.4z"
      className="bin_svg__st0"
    />
  </svg>
)
export default SvgBin
