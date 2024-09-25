import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgVideo = ({
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
      d="M113.3 636.6h584.5L720 163.5H80zm96.9-37.1h-73.5l11.1-53H199zm226.7 0h-73.6l11.1-53H426l11.1 53.1h-.2ZM590 196.1h73.6l-11.1 53.1h-51.4zm22.2 350.6h40.1l11.1 52.7h-73.6l11.1-52.7h11.2ZM485.9 196.1h51.2l11.1 53h-73.4zm-11.1 350.5h73.4l-11.1 53h-51.3l-11.1-53ZM362.9 196.1H437l-11.1 53H374zM352 325.9l96 55.6c17.7 10.2 17.7 26.9 0 37.1l-96 55.6c-17.7 10.2-32.1 1.8-32.1-18.5V344.5c-.2-20.2 14.5-28.6 32.1-18.5Zm-92.8-129.8h51l11.1 53h-73.2zm-11.1 350.5h73.2l-11.1 53h-51l-11.1-53.1ZM136.5 196.1h73.7l-11.1 53.1h-51.5z"
      className="video_svg__cls-1"
    />
  </svg>
)
export default SvgVideo
