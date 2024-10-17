import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgClassBeastPainter = ({
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
      d="m53.9 147.6-2 27.8 146 66.4 57.4-55.2L190.6 40l-38.9 3.4 27.6 57.2-45.5-58.7-36.8 19 31.8 44.8-46.7-38.8-32.8 61.6 75.9 37.3zM216.4 266.6l68.2 95.6 86.2-83.2-92-76.8zM382.1 309.5l-68.3 64.3L651.2 760l99.5-99.5zM108.4 683l-3.9-380.8-55.2-20.3 10.6 453.5 436.9-12.8-47.9-56.5zM691.6 127.2 665 506.6l66.5 52.7 18.6-490.6-478.5-5.2 15.8 57z"
      className="classBeastPainter_svg__cls-1"
    />
  </svg>
)
export default SvgClassBeastPainter
