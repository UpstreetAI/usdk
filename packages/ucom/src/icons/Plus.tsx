import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgPlus = ({
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
      d="m43 502.8 267.1-10-16 278.6-1.1 19.9h207.6l-1.1-19.9-16-278.6 273.7 10 19.6.7V305.8l-19.6.8L483 317.9l12-289.6.8-19.6H304.2l.4 19.3 6.2 289.6-267.4-16-20-1.2v203.2z"
      className="plus_svg__st0"
    />
  </svg>
)
export default SvgPlus
