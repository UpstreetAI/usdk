import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgScene = ({
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
      d="m378 126.1-112-74-97.1 12.7-106.3 50.8L8.1 223.4l152.2-36.6 154.3 36.6-109.3 24.4L99 312.7 86.4 426.3l50.7 146 29.6 28.4 33.8-101.4L285 385.7l114.1-82.4 25.4 110.8v138.7l-16.9 76.3-71.8 105.5-42.3 56.8 292.1-2.1-13.2-124.6-16.9-169.5-38-117.6-38-97.4 106.2 36.2 66.8 51.4 46.6 87.1 19.1 68.7 43.2-119.1L727.6 267l-47.7-82.5-154 10.5 29.6-40.6L679 135.9l58.9 33 54 42.4-24.5-113.1-103.1-70.7L536.7 8.6 428.7 57z"
      className="scene_svg__st0"
    />
  </svg>
)
export default SvgScene
