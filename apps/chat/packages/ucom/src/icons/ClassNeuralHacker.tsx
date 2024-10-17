import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgClassNeuralHacker = ({
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
      d="m132.7 519.7-3.9-378.2 339.8 5.7 50.7-53.3L74.5 89l10.8 462.3zM642.1 642.1l-365.3 19.4-13.4 50.6 443.7-14 19.5-467-59.3 52.4zM745.4 105.3 674.8 40 397.3 308.4l47.1 54.4 282.5-197.3-25-22.1zM371.9 315.7l-95 92.2 66 63.7 97.9-81.6zM290.3 546l30.8-56.2-58-59.8-18.2 86.9-16.3 12.7-39.9 11L54.6 653l38 70.7L206.8 760l45.4-157.8 39.9-14.5zM358.5 481l66 21.5-12.7-32.7-1.8-27.1z"
      className="classNeuralHacker_svg__cls-1"
    />
  </svg>
)
export default SvgClassNeuralHacker
