import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgMove = ({
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
    <path d="m4.9 399 136.5 115.1L113.9 399l27.5-115.1zM286.6 659.2l114.9 136.3 114.9-136.3L401.5 686zM795.1 399 658.8 284.1 685.5 399l-26.7 115zM286.6 141.8 401.5 115l114.9 26.8L401.5 5.5z" />
  </svg>
)
export default SvgMove
