import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgCredits = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 800 800"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d="M509.2 337.8c-21.2-36.3-60.5-60.7-105.6-60.7-67.6 0-122.4 54.8-122.4 122.4S336 521.9 403.6 521.9s84.3-24.4 105.6-60.7h98.7c-15.6 51.4-49.9 94.6-95.2 121.6v96.7h-85.4v-67.8c-7.8.9-15.7 1.4-23.7 1.4s-15.9-.5-23.7-1.4v67.8h-85.4v-96.7c-62.4-37.3-104.4-105.3-104.4-183.3s42-146 104.4-183.3v-96.7h85.4v67.8c7.8-.9 15.7-1.4 23.7-1.4s15.9.5 23.7 1.4v-67.8h85.4v96.7c45.2 27 79.6 70.2 95.2 121.6z"
      className="credits_svg__cls-1"
    />
  </svg>
)
export default SvgCredits
