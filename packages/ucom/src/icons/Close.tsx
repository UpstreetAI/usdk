import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgClose = ({
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
      d="m657.1 84.1 88.1 117.5-235 205.7 231 235.1-128.1 102.8-205.7-249.8-249.8 264.5L54.8 627.6l264.4-235.1-235.1-235L231 40l191 264.5L657 84.1Z"
      className="close_svg__cls-1"
    />
  </svg>
)
export default SvgClose
