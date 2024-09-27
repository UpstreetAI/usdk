import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgBackpack = ({
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
      d="M715.1 747.4 62.5 729.7 7.7 666.3l49.8-334.8L182 341.7l97.2 10.1 22.4 134.4 196.8 7.6 14.9-144.6 92.2-12.7L755 318.8l37.4 362.7zM495.9 219.9l-204.3-2.5-10 63.4-214.2-12.7L94.8 52.6l617.8 7.6 19.9 218.1-216.7 2.5z"
      className="backpack_svg__st0"
    />
  </svg>
)
export default SvgBackpack
