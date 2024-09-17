import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgLeftHand = ({
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
      d="m264.2 8.6-37 27.4 51.2 106.5 54.3 89.2-6.4 5.1-79.7-81.6-87.4-107-43.2 9.2-13.4 46.5 87.7 110.6 71.5 76-6.7 7.4-91-55.9-100.8-81.6L26.9 178l8.8 40.1 105.9 104 67.7 37.4-1.1 9.2-76-32-53.7-36.3-35 14.6-.3 33.9 57.5 51 91.4 51.3 110.8 86.3L398 583l31.2 39.1-.6 39 70.2 130.2 95.3-41.5 113.6-87.1 65.4-92.1-54.6-55.3-59-47.6-18.8.2-32.5-43.5-13.3-6.2 24.9-116.6L604 192.2l-1.6-89.1-52.7 12.5-30.7 62.3-10.9 65.5-24.7 32.3-37-35.7-43.8-47.1-64.6-91.6-35.6-78.9z"
      className="leftHand_svg__st0"
    />
  </svg>
)
export default SvgLeftHand
