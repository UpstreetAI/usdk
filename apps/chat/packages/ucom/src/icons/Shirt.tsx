import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgShirt = ({
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
      d="m291.7 94.8 39.7 37.7 68.6 17.9 61.6-17.9L506.4 99l212.7 49.4 1 153.8-130.2-23.8 5 73.4L628.4 703l-458.7 2 34.6-365.1 3-61.5-127.2 26.8V145.4l211.7-50.7Z"
      className="shirt_svg__cls-1"
    />
  </svg>
)
export default SvgShirt
