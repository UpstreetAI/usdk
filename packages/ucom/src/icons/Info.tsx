import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgInfo = ({
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
      d="M652.8 602h139.5v81.4H652.8zM6.1 602h553.7v81.4H6.1zM6.1 439.3h786.2v81.4H6.1zM6.1 276.6h786.2V358H6.1zM6.1 198h786.2v-81.4H6.1"
      className="info_svg__st0"
    />
  </svg>
)
export default SvgInfo
