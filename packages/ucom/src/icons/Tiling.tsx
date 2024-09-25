import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgTiling = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    data-name="Layer 1"
    viewBox="0 0 800 800"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d="M707.2 720H540.8c-7 0-12.8-5.7-12.8-12.8V540.8c0-7 5.7-12.8 12.8-12.8h166.4c7 0 12.8 5.7 12.8 12.8v166.4c0 7-5.8 12.8-12.8 12.8m0-224H540.8c-7 0-12.8-5.7-12.8-12.8V316.8c0-7 5.7-12.8 12.8-12.8h166.4c7 0 12.8 5.7 12.8 12.8v166.4c0 7.1-5.8 12.8-12.8 12.8M483.1 720H316.7c-7 0-12.8-5.7-12.8-12.8V540.8c0-7 5.7-12.8 12.8-12.8h166.4c7 0 12.8 5.7 12.8 12.8v166.4c0 7-5.7 12.8-12.8 12.8m0-224H316.7c-7 0-12.8-5.7-12.8-12.8V316.8c0-7 5.7-12.8 12.8-12.8h166.4c7 0 12.8 5.7 12.8 12.8v166.4c0 7.1-5.7 12.8-12.8 12.8m0-224H316.7c-7 0-12.8-5.7-12.8-12.8V92.8c0-7 5.7-12.8 12.8-12.8h166.4c7 0 12.8 5.7 12.8 12.8v166.4c0 7-5.7 12.8-12.8 12.8M259.2 496H92.8c-7 0-12.8-5.7-12.8-12.8V316.8c0-7 5.7-12.8 12.8-12.8h166.4c7 0 12.8 5.7 12.8 12.8v166.4c0 7.1-5.8 12.8-12.8 12.8m0-224H92.8c-7 0-12.8-5.7-12.8-12.8V92.8c0-7 5.7-12.8 12.8-12.8h166.4c7 0 12.8 5.7 12.8 12.8v166.4c0 7-5.8 12.8-12.8 12.8"
      className="tiling_svg__cls-1"
    />
  </svg>
)
export default SvgTiling
