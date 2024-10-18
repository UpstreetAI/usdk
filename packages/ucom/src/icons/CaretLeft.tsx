import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgCaretLeft = ({
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
      d="M168 379.4v41.2l386.9 273.7 46.4 25.7 30.9-30.9-32.8-268.5v-41.2l32.8-268.5L601.3 80l-46.4 25.7z"
      className="caretLeft_svg__cls-1"
    />
  </svg>
)
export default SvgCaretLeft
