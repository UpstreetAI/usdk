import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgVitality = ({
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
      d="m449.4 713.3-143.1-11.6L85.8 441 80 345.3 335.4 86.7l147 3.4 237.7 270.2v106.9L449.5 713.3Zm108.4-368-46.4-99.4-52.3 20.7 27.1 101.3-39 26.3-17.1-65.7-21.3-82.6-17.4-65.6-56.1 13.1 7.7 73.2 15.5 101.3 9.6 58.2-38.6 20.6-19.4-63.8-23.2-71.3-36.7 7.6L225 458l83.2 86.3 84.2 75 116.4-93.8 74.2-73.2-25.3-106.9Z"
      className="vitality_svg__cls-1"
    />
  </svg>
)
export default SvgVitality
