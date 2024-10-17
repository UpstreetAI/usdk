import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgChat = ({
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
      d="m657.4 549.9-251.1-14.2-175.8 184.8L243 535.6 92.4 549.8 67.3 123.2l665.4-42.6L657.4 550ZM293.3 279.6H218V365h75.3zm125.5 0h-75.3V365h75.3zm125.6 0h-75.3V365h75.3z"
      className="chat_svg__cls-1"
    />
  </svg>
)
export default SvgChat
