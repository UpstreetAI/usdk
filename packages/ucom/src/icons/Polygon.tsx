import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgPolygon = ({
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
      d="M23.3 165.2 209 58.2l31.4 11.2 185.7 98.3 10.5 23.5 2.6 80.9-78.5 41.7v-73L345 212.1l-102-62.6-36.6-2.6-102 62.6-18.3 26.1v107l10.5 36.5 104.6 73h36.6l319.1-185.2 39.2-2.6 172.6 99.1 20.9 23.5 2.6 221.7-15.7 28.7-175.2 99.1-36.6 5.2-177.9-99.1-20.8-16.8-2.6-95.3 75.9-41.7 2.6 65.2 13.1 33.9 102 64.3 39.2-1.7 94.2-57.4 23.5-39.1V449.6l-13.1-32.3L596.2 353H557L251.7 530.4l-47.8 5.2L33.7 433.9l-26-36.5V196.5z"
      className="polygon_svg__st0"
    />
  </svg>
)
export default SvgPolygon
