import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgAttack = ({
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
      d="m723.6 636 61.2 51.8-54.6 50.1-56 51-49.4-70.6-51.1-55.9-87.8 81-56.3-40.5 51.8-69.8L69.7 217l-.9-188L73 8.7l185.8 39.5 382.4 436.5 72.1-45 38.3 47.3-85.5 90zM614.9 331.3 451.7 147.7l87.2-99.5L724.7 8.6l22.5 20.3L728 217zM84.4 439.6l72 45 56.4-38.4 137.4 152.6-34 34.4L368 703l-56.3 40.5-87.8-81L180 716l-58.8 75.3-53.7-53.4-52.2-50.1 70.6-61.2 45.9-49.7-85.5-90z"
      className="attack_svg__st0"
    />
  </svg>
)
export default SvgAttack
