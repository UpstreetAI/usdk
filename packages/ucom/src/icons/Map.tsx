import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgMap = ({
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
      d="m581.1 706.6-49.4-560.4 138.6-52.9 122.1 478.2zM305.7 576.5 357.4 97l149.7 53 28.5 551.1zM7.7 706.6l154.8-560.4 176.4-52.9-73.1 483.2z"
      className="map_svg__st0"
    />
  </svg>
)
export default SvgMap
