import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgRegenerateChat = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    data-name="Layer 1"
    viewBox="0 0 20 20"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d="m14.5 2.9 1-2.2-.3-.4-5.6 2.3v.6c-.1 0 2.2 5.3 2.2 5.3h.7c0-.1.7-2.2.7-2.2 1.4 1.1 2.8 2.8 2.8 4.5 0 3.1-2.5 5.7-5.7 5.7S4.6 14 4.6 10.8 5.6 7 7.2 6l-.4-3.5c-3.2 1.4-5.5 4.6-5.5 8.3s4 8.9 8.9 8.9 8.9-4 8.9-8.9-1.9-6.4-4.7-7.9Z"
      className="regenerateChat_svg__cls-1"
    />
  </svg>
)
export default SvgRegenerateChat
