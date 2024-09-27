import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgMic = ({
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
      d="m571.5 283.4-25.1 20.8v116.7l-20.9 54.2-41.9 41.7-58.6 25h-46l-62.8-20.9-37.7-37.5-20.9-54.2v-62.5l-4.2-62.5-25.1-20.9-25.1 16.7v133.4l33.5 79.1 62.8 58.3 75.4 25v75h-92.1V725h234.4v-54.2h-92.1v-75l75.4-25 71.1-75 25-66.6V300.1z"
      className="mic_svg__st0"
    />
    <path
      d="M379.1 495.8h46l33.4-20.9 37.7-54.1v-275l-25-41.7L400 74.9l-67 25-29.3 45.9v275l33.5 54.2z"
      className="mic_svg__st0"
    />
  </svg>
)
export default SvgMic
