import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgPower = ({
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
    <path d="M438.3 421.6h-65.5L328.3 7h143.4z" className="power_svg__st0" />
    <path
      d="m549.5 60.9-14.9 146.4c62.6 42.9 103.7 115 103.7 196.6 0 131.6-106.7 238.2-238.2 238.2S161.8 535.5 161.8 404c0-84.2 43.7-158.3 109.7-200.6L256 58.6C120.9 115 25.9 248.4 25.9 404c0 206.6 167.5 374.1 374.1 374.1S774.1 610.6 774.1 404c0-153.5-92.4-285.4-224.6-343.1"
      className="power_svg__st0"
    />
  </svg>
)
export default SvgPower
