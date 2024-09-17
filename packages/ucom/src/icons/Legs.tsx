import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgLegs = ({
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
      d="m771.5 708.5 7.5 26.7-97.9 36.2-129.6 6-7-31.3 8.9-14.4-47.5-31.1-46.3-225.5-51.8-187.5-37.1 188.8-73.9 230.1-46.8 30.2 14.4 18.3-17.4 34.4L119.2 779l-77.1-25.7 4-34.2 1.7-19.1L21 649.3l31.2-89.9L158.1 211l32.7-146 25.6.3 2.8-31.4h130.4-4.2l1.2-21.8 137-1.6.3 23.8h4.5l105.3-2.7 5.7 34 25.6-1.1 21 135 109.3 365 19.2 105.8-17.8 31.1zM375.2 48.4l-3 49.5 79.8-3 1.5-63.2z"
      className="legs_svg__st0"
    />
  </svg>
)
export default SvgLegs
