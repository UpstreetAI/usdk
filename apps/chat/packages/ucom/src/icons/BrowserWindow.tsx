import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgBrowserWindow = ({
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
    <path d="m11.1 124.6 24.1 485.8 3.3 65.1h726.1L789 124.6zm697 495.9H94.4l-2.8-52.1-20.3-389h657.5z" />
    <path d="M35.7 290.5h728.8v54.9H35.7zM159 264.6h-47.7l-4-55.7H163zM239 264.6h-47.7l-4-55.7H243zM319 264.6h-47.7l-4-55.7H323z" />
  </svg>
)
export default SvgBrowserWindow
