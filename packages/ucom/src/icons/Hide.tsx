import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgHide = ({
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
      d="m765.6 454.9-53.4 75.9-48 45.6 127.2 134.4-69.4 59.5L20.4 104.4l64-74.7 136.8 126.5 90.7-35.4 106.8-10.1L548 130.9l121.5 75.9 80.1 94 42.7 98.8zM589.5 350.2l-31.1-77.6-75.7-50.6-90.7-15.2-90.8 45 69.4 51.2 64.1 5.1 37.4 20.2 26.7 50.6-5.3 40.5 74.7 70.9 26.7-65.8zM98.4 247.3l112.1 101.3-5.3 100.4 48 71.6 80.1 50.6 90.7 10.1 26.7-5.1 97.3 75.9-113.3 25.3-117.4-10.1-133.5-50.6-101.4-91-58.7-86.1-16-40.1L45 308.1z"
      className="hide_svg__st0"
    />
  </svg>
)
export default SvgHide
