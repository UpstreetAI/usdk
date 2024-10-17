import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgDiscord = ({
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
      d="m708.5 276.4-97.1-115.2-118.2-40.9-30 43.5-64.6-9.3-64.6 9.3-29.9-43.5-117.7 40.9-97.1 115.2-50.5 170.3 26.8 139.8 61.6 51.7 112.2 40.7 23.9-47.7-47.9-44.3 6.2-18 43.2 23.2 65.3 19 68.4 5 68.4-5 65.3-19.2 43.2-23.2 6.2 18-47.7 44.3 23.9 47.7L670 638l61.6-51.7 26.8-139.8-50.5-170ZM317.6 490.2l-43.2 5.4-42-33.3-7.8-64.1 39-46.9 44.2-3.1 35.9 40.7 5.5 58.4-31.7 43Zm248.5-28-42 33.3-43.2-5.4-31.8-43.2 5.5-58.4 35.9-40.7 44.2 3.1 39 46.9-7.7 64.4Z"
      className="discord_svg__cls-1"
    />
  </svg>
)
export default SvgDiscord
