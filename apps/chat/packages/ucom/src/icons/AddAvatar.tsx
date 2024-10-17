import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgAddAvatar = ({
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
      d="m249.7 535.3 56.1 28.1 21.8 6.2h9.4l56.1-34.3 37.4-37.4 21.8-43.6 31.2-74.8-34.3-59.2L418 286l-40.5 24.9L268.4 367l18.7-81-84.2 46.8-46.8 59.2 18.7 40.5 31.2 59.2 40.5 40.5 3.1 3.1Z"
      className="addAvatar_svg__cls-1"
    />
    <path
      d="m199.8 304.7 106-49.9v46.8l-9.4 31.2 68.6-40.5 53-40.5 53 53 40.5 74.8-34.3 84.2h34.3l34.3-77.9h21.8c0 3.1-6.2-43.6-6.2-43.6l6.2-62.3-15.6-71.7-18.7-40.5-31.2-56.1-43.6-40.5L393 40h-84.2l-71.7 3.1L165.4 93l-59.2 59.2-24.9 71.7-12.5 43.6 18.7 87.3-9.4 65.5 31.2-15.6 37.4 71.7h28.1L137.4 386l65.5-87.3-3.1 6.2ZM399.3 653.8v-93.5l-46.8 24.9-24.9 6.2-37.4-9.4-77.9-40.5V582l-9.4 43.6-18.7 9.4 143.4 46.8 71.7-28.1ZM442.9 644.4h106c0-3.1-6.2 106-6.2 106v9.4h81v-9.4l-6.2-109.1h109.1c0 3.1 6.2 3.1 6.2 3.1v-77.9h-6.2l-109.1 6.2 6.2-115.3v-6.2h-74.8v121.6l-106-6.2h-9.4v77.9h9.4Z"
      className="addAvatar_svg__cls-1"
    />
  </svg>
)
export default SvgAddAvatar
