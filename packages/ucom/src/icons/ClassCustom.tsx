import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgClassCustom = ({
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
      d="M275.8 69.6 40 67l16.1 687.9 2.7-.3 40.9-188.4V124.7l152.6 2.5zM492 72l16.8 59.4 191.5 3.2L684.4 423l17.9 262.5 2.6 50.5 29-1L760 74.9z"
      className="classCustom_svg__cls-1"
    />
    <path
      d="m629.7 451.1-26.4-69.3 8.1-47.5-33.3-44.5-62.3-9.8-57.6-15.4-19.6-24.1-4.3-13 .2-.2 23.1-49.7 2.4-56.9-26.5-59.9-47.7-15.7-55.9 18.4-23.5 45-6.1 54.2 12.8 57.9 12.4 17.2-14.6 42-39.7 3.3-45.1 12.1-27.3 40.4-2.8 33.8-11.9 65.8L131 562.6l-28.5 144.5 16.2 39.3 30.5 6.7 31.1-38.6-17.6-27.9-.7-22.7 12.1-43.8 48.3-61.1 12.4-78.6 12.5-28.5 14.8 56.1.4 90.9-16.8 51.5-14.1 66.6v26.5l305.3-8.3-8.5-37.6-40.6-97L495 512l36.2-62.1 39.4 60.2-6.4 43 46.2 101-42.6 37.1-6.8 28.5 50.1 34.6 49.8-50.4 2.8-36.1-10.5-187z"
      className="classCustom_svg__cls-1"
    />
  </svg>
)
export default SvgClassCustom
