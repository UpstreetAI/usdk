import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgTwitch = ({
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
    <g data-name="Layer 1-2">
      <path
        d="M240 80.5 125.7 194.8v411.4h137.1v114.3l114.3-114.3h91.5l205.8-205.8V80.5zm388.6 297.2-91.5 91.4h-91.4l-80 80v-80H262.9V126.2h365.7z"
        className="twitch_svg__cls-1"
      />
      <path
        d="M514.3 206.2H560v137.1h-45.7zM388.5 206.2h45.7v137.1h-45.7z"
        className="twitch_svg__cls-1"
      />
    </g>
  </svg>
)
export default SvgTwitch
