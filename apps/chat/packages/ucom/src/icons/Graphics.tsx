import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgGraphics = ({
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
      d="M712.3 720.4 9.6 616.2 87.7 79.6l702.8 108.3zm-638-158.9 595.1 90.1 58.9-416.8L135 154.5zm91.4-88.7 57.7-16 85.2 9.8 34.6 9.8 132.2-152.7 69.2 140.4 64.1-57.9 28.2 199.7L124 529.6zM266 368c-37.3 0-67.4-30.2-67.4-67.5S228.8 233 266 233s67.4 30.2 67.4 67.5c.1 37.4-30.1 67.5-67.4 67.5"
      className="graphics_svg__st0"
    />
  </svg>
)
export default SvgGraphics
