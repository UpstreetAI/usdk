import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgEdit = ({
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
      d="m338.8 756.9 5.5-84.1 415.6-27.9v111.6H338.8zm309.5-478.4L493.7 110.3l65-67.2h44.8l123.4 123-11.4 39.3zM197.1 729.7H39.9V567l412.4-406.8L615 317.7l-417.8 412Z"
      className="edit_svg__cls-1"
    />
  </svg>
)
export default SvgEdit
