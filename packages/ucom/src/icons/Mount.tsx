import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgMount = ({
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
      d="m211.1 126.8-55.7 65.8-35.5 96.2L19.1 471.2l37.5 44 69.7 7.4 46.8-51.4 73.4-41 68.4-7.4 40.5-47.8 5.1-101.3 32.9 71.7v77.5l-70.9 45.9-53.2 149.4-58.3 55.7 195 118.4 291.2-118.4-81-32.9 15.2-125.7-20.3-158-93.7-136.8-101.3-81 124.1 53.2L631.5 294l38 116.5 7.6 111.4-17.7 98.8L781 587.8l-15.2-184.9-81-217.8L555.5 78.7 388.4 10.3 228.8 7.8l-78.5 75.5z"
      className="mount_svg__st0"
    />
  </svg>
)
export default SvgMount
