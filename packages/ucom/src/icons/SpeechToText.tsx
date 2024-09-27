import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgSpeechToText = ({
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
      d="M606.2 565.9v-66.4H720v66.4zM288.6 717.6 189 328.1l-38.7 105.1H80.1L198.5 82.4l99.5 403 37.9-118.5h384v66.4H384.6l-96.1 284.4Zm132.7-483.5H720v66.4H421.3zm109 331.8H421.2v-66.4h109.1z"
      className="speechToText_svg__cls-1"
    />
  </svg>
)
export default SvgSpeechToText
