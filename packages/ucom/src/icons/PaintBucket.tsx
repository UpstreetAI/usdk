import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgPaintBucket = ({
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
      d="M311 789.4 1.9 477l247-255L90.4 100.2l100.4-89.6 122.4 151.6 64.3-75.8 379.1 358.4-144.8 62zm66.6-581.3L115.7 474.7l392.9 13.8 78.1-71.2zm420.5 422.8L779.7 686l-41.4 23-50.5-23-11.5-52.8 57.4-128.7z"
      className="paintBucket_svg__st0"
    />
  </svg>
)
export default SvgPaintBucket
