import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgCaretUp = ({
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
      d="M379.4 168h41.2l273.7 386.9 25.7 46.4-30.9 30.9-268.5-32.8h-41.2L110.9 632 80 601.1l25.7-46.4z"
      className="caretUp_svg__cls-1"
    />
  </svg>
)
export default SvgCaretUp
