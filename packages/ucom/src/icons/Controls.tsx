import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgControls = ({
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
      d="m708.1 430.9-2.5 306.5-101.5 5 9.9-311.5-54.4 2.5V247.9l59.4 2.5-2.4-192.8h89v192.8l54.4-2.5v185.5zM445.8 742.4h-89.1l2.5-94-54.6 10.2V465.5l49.7 2.5-10-410.4 101.5 5L456.3 468l44-2.5v193.2l-54.4-10.2v93.9Zm-259.8-5-101.5 5L94.4 332 40 334.5V149.1l59.4 2.5-2.5-94H186v94l54.4-2.5v185.4l-51.9-2.5z"
      className="controls_svg__cls-1"
    />
  </svg>
)
export default SvgControls
