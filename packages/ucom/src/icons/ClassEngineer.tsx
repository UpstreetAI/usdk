import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgClassEngineer = ({
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
      d="M557.4 484.4 308.5 229.9l-11-110.6-127.2-69.1-63.7 27.6 94.1 55.3 2.7 59.4-55.3 22.3-94-51.3 5.5 58.1 80.2 80.2 85.8 2.8 262.7 260 8.3 132.7 127.2 52.5 69.2-27.6-94.1-49.8-2.7-63.6 55.3-24.9 94 56.8v-56.8l-94-94zM699.7 119.3l-22.1 316 65.6 46.6 16.8-423-436.7-4.7 54.6 59.8zM98.9 691.8l-3.4-340.1L40 313.2l9 432.6 421.3-12.3-62.5-57.1z"
      className="classEngineer_svg__cls-1"
    />
  </svg>
)
export default SvgClassEngineer
