import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgUpdate = ({
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
      d="M720 377.8H483.3l83.5-83.5c-35.6-65.6-104.9-110.2-184.9-110.2-116.3 0-210.6 94.3-210.6 210.6s94.3 224.2 210.6 224.2 163.8-68 195.1-145.2c25.2 17.2 51.1 34.9 76.4 52.3-48.9 100.9-151.9 170.6-271.5 170.6S80 561.5 80 394.8s135.2-290.5 301.9-290.5S579.1 146.6 633.1 228l86.9-69.3z"
      className="update_svg__cls-1"
    />
  </svg>
)
export default SvgUpdate
