import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgLogin = ({
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
      d="m457.1 788 4.5-81.9L643.5 638 642 154.4l-209.2-40.8L431.3 12l350.1 3v773zm95.5-348.6L257.2 734.8l-45.6-28.6 9.1-189.5-183.5 19.7L19 503.1l-.5-183.4 12.6-25.8 189.5 9.1-7.6-188 33.4-19.7L560 398.5z"
      className="login_svg__st0"
    />
  </svg>
)
export default SvgLogin
