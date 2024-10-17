import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgLogout = ({
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
      d="M777.9 439.4 482.5 734.8l-45.6-28.6 9.1-189.5-183.4 19.7-18.2-33.3-.5-183.4 12.6-25.8L446 303l-7.6-188 33.4-19.7 313.6 303.2zm-623.8-285L152.6 638l181.9 68.2L339 788H14.7V15l350.1-3-1.5 101.7z"
      className="logout_svg__st0"
    />
  </svg>
)
export default SvgLogout
