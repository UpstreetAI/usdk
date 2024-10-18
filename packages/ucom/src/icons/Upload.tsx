import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgUpload = ({
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
      d="M461.7 541.8H315.8L355 332.7l-168.3 22.4L414.2 80l204.6 286.5-185.2-33.7 28 209.1ZM186.8 632l404-19.2v-106l112.3-5.6-5.6 218.9-589.1-16.8v-.4l-5.6.4s-3.9-147.7-5.6-157.1C95.5 539.5 187 535 187 535v97.2Z"
      className="upload_svg__cls-1"
    />
  </svg>
)
export default SvgUpload
