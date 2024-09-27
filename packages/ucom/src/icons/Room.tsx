import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgRoom = ({
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
      d="m53.4 791.4 92.8-679.7-29.3-103 569.7 20.6-27.8 108.1 87.9 572.5L575.8 727l-43.9-512.4-206.2 5.2-35.5 552.4z"
      className="room_svg__st0"
    />
  </svg>
)
export default SvgRoom
