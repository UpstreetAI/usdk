import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgView = ({
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
      d="m685.2 315.8-65.3-76.6-99.1-61.9-105.5-16.5-87.1 8.2-74 28.9-100.1 74.4-43.5 49.6-30.5 74.6 13.1 32.6 47.9 70.2 82.7 74.3 108.9 41.3 95.8 8.2 92.4-20.7 94.8-61.9 39.2-37.1 43.5-61.9 21.8-45.1-34.8-80.6Zm-148 154.6-95.8 70.2-21.8 4.1-74-8.2-65.3-41.3-39.2-58.4 4.3-81.9 74-78.9 74-36.8 74 12.4 61.7 41.3 25.3 63.3 4.3 60.6-21.7 53.7Z"
      className="view_svg__cls-1"
    />
    <path
      d="m428.3 321.8-52.3-4.2-39.5 29.9-11.1 44.5 17.8 40.6 50.6 24.6 48.7-9.9 33.7-34.7 4.4-33.1-21.8-41.2z"
      className="view_svg__cls-1"
    />
  </svg>
)
export default SvgView
