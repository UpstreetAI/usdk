import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgDebugMode = ({
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
    <g data-name="Layer 2">
      <path
        d="m149.6 547.5-11.7-365.3h538.4v144.6l50.8 33.6 7.8-230H75.3L97.2 573H40l33.4 77.5 370.7 1.1-47.4-104.1z"
        className="debugMode_svg__cls-1"
      />
      <path
        d="m760 530-9.5-53.8-29.7 11.5c-5.3-14.3-13-28.2-23.2-41l24-16.2-38.7-38.6-16.7 25c-13.2-9.3-27.3-16.2-41.8-20.6l12.9-33.4-53.8-9.5.7 37.2c-16.7.4-32.9 4.2-47.4 11.5l-8.8-18.5-53.7 53.8 18.5 8.8c-7.3 14.5-11.1 30.7-11.5 47.4l-37.2-.7 9.5 53.8 33.4-12.9c4.4 14.5 11.2 28.6 20.6 41.8l-25 16.7 38.6 38.7 16.2-24c12.8 10.2 26.6 17.9 41 23.2l-11.5 29.7 53.8 9.5-.6-30.9c21.4.6 42.3-4.3 60.2-15.1L558.7 509.7l41.8-41.8 113.6 121.5c10.8-17.8 15.7-38.7 15.1-60.2l30.9.6Z"
        className="debugMode_svg__cls-1"
      />
    </g>
  </svg>
)
export default SvgDebugMode
