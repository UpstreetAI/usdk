import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgX = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 800 800"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="m455.7 353.7 218.1-253.6h-51.7L432.7 320.3 281.4 100.1H107L335.8 433 107 698.9h51.7l200-232.5 159.8 232.5H693L455.8 353.6Zm-70.8 82.2-23.2-33.2L177.4 139h79.4l148.8 212.9 23.2 33.2 193.5 276.7h-79.4L385 436Z" />
  </svg>
)
export default SvgX
