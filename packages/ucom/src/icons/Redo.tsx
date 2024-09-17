import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgRedo = ({
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
      d="M763 285.8 427.6 8.6 455 206.9S37.1 141.1 37.1 463.5c-4.9 274.2 149.7 317 599.3 327.8 4 .1-.1-130.9 6.8-150.4-324.5-1.1-465.6-1.1-466.8-175.7-1.3-185.6 278.6-142 278.6-142l-41 215.5z"
      className="redo_svg__st0"
    />
  </svg>
)
export default SvgRedo
