import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgHeadset = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    viewBox="0 0 1200 1200"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d="m989.5 563.3 21-491-818.3 56.2 20.7 434.3-135.5 30v269.7l148.6 33 12.6 232.2h431.3l-33.7-104.2-336.9 50.1-16-165.4 97.6 21.7V525.5l-91.1 20.2 31.6-331.5 558.7-41.1 33.2 373.3-94.2-20.9v404.4l303.5-67.4V592.8z"
      className="headset_svg__st0"
    />
  </svg>
)
export default SvgHeadset
