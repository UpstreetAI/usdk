import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgMint = ({
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
      d="m521.4 569-4.7 56.6 132 110.8 7.1 53-450.2-8.2v-40.1l120.2-120.2-11.8-32.8-122.6-33.8V411.1l554-9.4v70.7zm-16.7-468.9 198-89.6L740.4 86l-212.2 73.1zM471.9 206l-44.6-103.3L465 86.2l44.6 105.7zM292.7 385.2l-89.6-242.8-14-49.5 172.2-70.7 115.5 294.7zm-238 37.7 103.7 2.4v96.6l-99-56.6z"
      className="mint_svg__st0"
    />
  </svg>
)
export default SvgMint
