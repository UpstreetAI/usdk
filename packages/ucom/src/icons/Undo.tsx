import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgUndo = ({
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
      d="M100.8 306.6 375 80l-22.3 162.1s347.7-53.8 346.6 209.8c.5 224.2-127.3 259.2-494.9 268-3.3 0 0-107-5.6-123 265.3-.9 380.7-.9 381.8-143.7 1.1-151.8-227.8-116.1-227.8-116.1l33.5 176.2z"
      className="undo_svg__cls-1"
    />
  </svg>
)
export default SvgUndo
