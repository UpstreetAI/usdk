import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgSaveEquipment = ({
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
      d="m770.1 656.4-171.9 133L423.6 662l113.6-2.8-8.3-257.8 135.8-2.8-11.1 257.8zM516.6 187.9l6.7 133.1h-60.9v241.2L390.3 576l-108.1 2.8-199.6-36 19.4-58.2 16.6-94.2 22.2-191.1-69.3-.3L29.9 88.2l141.4-77.6h119.2l16.6 169.1h45.7L368 10.6l111 2.7 144.2 78.1L597.5 199z"
      className="saveEquipment_svg__st0"
    />
  </svg>
)
export default SvgSaveEquipment
