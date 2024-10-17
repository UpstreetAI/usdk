import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgSpeaker = ({
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
      d="m687.3 291.3-29.8-65.5-59.5-56.6-38.7 29.8 32.7 26.8 35.7 44.7 20.8 59.5 11.9 71.4-14.9 77.4-32.7 65.5-50.6 50.6 29.8 38.7 50.6-44.7 35.7-59.5 41.7-92.3v-71.4zM598 437.2v-77.4l-29.8-71.4-41.7-41.7-26.8 35.7 29.8 41.7 20.8 44.7-8.9 89.3-41.7 65.5 23.8 32.7 20.8-14.9 38.7-44.7 14.9-59.5ZM330.1 208l-77.4 53.6-80.4 17.9-86.3 8.9v104.2l-6 92.3 6 38.7 86.3 6h71.4l80.4 68.5s83.3 71.4 89.3 68.5c6 0 38.7 23.8 38.7 23.8V443.3l3-178.6v-155l-35.7 35.7-89.3 62.5Z"
      className="speaker_svg__cls-1"
    />
  </svg>
)
export default SvgSpeaker
