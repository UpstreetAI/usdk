import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgCaretRight = ({
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
      d="M632 379.4v41.2L245.2 694.3 198.8 720l-30.9-30.9 32.8-268.5v-41.2L168 110.9 198.9 80l46.4 25.7z"
      className="caretRight_svg__cls-1"
    />
  </svg>
)
export default SvgCaretRight
