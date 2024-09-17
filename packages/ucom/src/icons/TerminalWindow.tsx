import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgTerminalWindow = ({
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
      d="m80.1 173.4 19.8 399.7 2.7 53.6H700l20.1-453.2h-640Zm573.4 408H148.6l-2.3-42.9-16.7-320h540.9z"
      className="terminalWindow_svg__cls-1"
    />
    <path
      d="M377.6 381.4c-43.9-29-87.7-58.1-131.6-87l3.4 64.8 71.7 44.5-67.2 42.1 3.1 59.9 120.5-79.8v-44.5ZM433.4 470.5h120.5v35.2H433.4z"
      className="terminalWindow_svg__cls-1"
    />
  </svg>
)
export default SvgTerminalWindow
