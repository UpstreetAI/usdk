import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgSleep = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    data-name="Layer 1"
    viewBox="0 0 1200 1200"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d="M282.1 840.1c3.8 9.7 13.1 15.9 23.6 15.9h153.6c14.1 0 25.6-11.5 25.6-25.6s-11.5-25.6-25.6-25.6h-91.9L477.2 695c7.4-7.4 9.5-18.4 5.6-27.9-3.8-9.7-13.1-15.9-23.5-15.9H305.7c-14.1 0-25.6 11.5-25.6 25.6s11.5 25.6 25.6 25.6h91.9L287.8 812.2c-7.4 7.4-9.7 18.4-5.6 27.9ZM538.1 635.3c3.8 9.7 13.1 15.9 23.6 15.9h128c14.1 0 25.6-11.5 25.6-25.6S703.8 600 689.7 600h-66.3l84.2-84.2c7.4-7.4 9.5-18.2 5.6-27.9-3.8-9.7-13.1-15.9-23.6-15.9h-128c-14.1 0-25.6 11.5-25.6 25.6s11.5 25.6 25.6 25.6h66.3l-84.2 84.2c-7.4 7.4-9.7 18.4-5.6 27.9M920 472c0-14.1-11.5-25.6-25.6-25.6h-40.7l58.6-58.6c7.4-7.4 9.5-18.2 5.6-27.9-3.8-9.7-13.1-15.9-23.6-15.9H791.9c-14.1 0-25.6 11.5-25.6 25.6s11.5 25.6 25.6 25.6h40.7L774 453.8c-7.4 7.4-9.5 18.2-5.6 27.9 3.8 9.7 13.1 15.9 23.5 15.9h102.4c14.1 0 25.6-11.5 25.6-25.6Z"
      className="sleep_svg__cls-1"
    />
  </svg>
)
export default SvgSleep
