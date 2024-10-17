import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgExportAvatar = ({
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
      d="m309.7 524.4 55.1 28.6 21.8 5.5 9-2.1 56.1-32.6 37.5-35.8 22-42.8 29.6-72.7-33-59.4-29.7-33.1-40.6 25.6-107.8 53.9 19.7-78.3-81.4 45-46.2 59.4 17.6 39.6 29.7 59.5z"
      className="exportAvatar_svg__cls-1"
    />
    <path
      d="m261.8 299.9 104.1-49.6-2.2 46.3-7.7 29.9 68.2-38.6 50.6-39.8 52.9 51.7 39.6 74.8-33.1 83.6 32.6-1.1 33.3-75.9 22.3 4.4-6-47.4 4.9-62.7-14.3-70.3-19.7-39.7-30.8-54-44-40.7-64.1-30.1-82.5-.8-71.4 4.4-70.4 49.6-57.3 59.5-25.3 71.5-11 43 19.7 86.7-8.4 63 29.4-14.3 35.3 71.5 26.4-1.1c1.7-1.4-36.4-89.2-36.4-89.2l65.4-84.7ZM590.4 669.6l7.5-175.1-92.2 1.8 5.7 175.2-77.2 1.9L552.8 760l116.8-90.4z"
      className="exportAvatar_svg__cls-1"
    />
    <path
      d="m456.2 640.9-3-93.3-42.1 24.1-24.4 6.5-37.3-7.7-77-38.7 1.1 40.9-11 43-17.7 7.7 141.9 46.3z"
      className="exportAvatar_svg__cls-1"
    />
  </svg>
)
export default SvgExportAvatar
