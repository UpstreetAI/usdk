import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgRightHand = ({
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
      d="M544.4 8.6 572.8 36l-51.2 106.5-54.3 89.2 6.4 5.1 79.7-81.6 87.4-107 43.2 9.2 13.4 46.5-87.7 110.6-71.5 76 6.7 7.4 90.8-55.9 100.8-81.6 36.4 17.7-5.1 40.1-109.6 104-62.2 37.4-4.5 9.2 76-32 62.6-36.3 26.2 14.6.3 33.9-51.1 51-97.5 51.1-110.8 86.3L402 583l-31.2 39.1 1.7 39-71.4 130.2-95.3-41.5-113.5-87-65.4-92.1 54.6-55.3 59-47.6 18.8.2 32.5-43.5 13.3-6.2-24.9-116.6L196 192.2l1.6-89.1 55.3 12.5L281 178l10.9 65.5 24.7 32.3 36.9-35.8 43.8-47.1 64.6-91.6 35.6-78.9z"
      className="rightHand_svg__st0"
    />
  </svg>
)
export default SvgRightHand
