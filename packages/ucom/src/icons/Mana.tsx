import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgMana = ({
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
      d="m510.3 429.8-88.2-88.2-88.2 88.2 176.4 176.5L775 363.6 422.1 13 25 340.4v111.4L331.1 787l113-92.5-242.6-286.8 220.6-176.5 154.4 132.4z"
      className="mana_svg__st0"
    />
  </svg>
)
export default SvgMana
