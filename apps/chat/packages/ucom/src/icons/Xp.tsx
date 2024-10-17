import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgXp = ({
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
      d="M663.3 526H542.9v107.3H441.4V166.6h222l56.7 73.3v196.7L663.4 526Zm-44.9-232.7L609 280h-66.1v116.7H609l9.4-13.3v-90ZM309.2 633.4l-61.4-140.1h-2.4L184 633.4H80.2l103.9-236.7-96.9-230.1h103.9l54.3 130h2.4l54.3-130H406l-96.9 230L413 633.3H309.1Z"
      className="xp_svg__cls-1"
    />
  </svg>
)
export default SvgXp
