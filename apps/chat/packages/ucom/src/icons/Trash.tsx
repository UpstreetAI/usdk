import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgTrash = ({
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
      d="M164.8 249.3 142.9 200l131.3-32.7-5.6-54.6L509.4 80l5.6 54.6 140.2-27.4 2 65.7-492.3 76.4Zm388.4 470.8H238.3l-40.8-443.3 399.2 10.8z"
      className="trash_svg__cls-1"
    />
  </svg>
)
export default SvgTrash
