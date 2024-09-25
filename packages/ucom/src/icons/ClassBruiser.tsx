import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgClassBruiser = ({
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
      d="m124.4 427-36.7 37.8 80.2 190.3 217.8 55.1 18.4-50.4-162.8-67.9zM323.8 304.4l130.8 63.5 57.2 115.3 34.5 9.2 34.3-57.3L521 403l-9.2-59.6-64.1-73.4-39-50.5 59.6 39 25.2-22.8-68.8-103.2-96.2 59.5z"
      className="classBruiser_svg__cls-1"
    />
    <path
      d="m495.8 279.2 52.7 48.1 2.3 59.6 75.7 36.7 77.9-94-43.5-38-4.6-81.2-52.8-24.7-68.7-105.8-82.6 38.8 82.6 128.4zM420.2 389.3l-105.5-55.1-144.4 94 89.4 135.2 149 59.7 64.2-130.7zM662.5 662.6l-196.1 9.9-13.6 60.3 281.1-8.7 12.7-321.5-69.9 61.1zM605.8 62.3l32 60.3 62.5 1.1-7.1 102 58.7 41.5L760 64zM126.8 689.4l-21.2 1.1-.3-35.3-51.8-84.4L56.1 744l188.5-3.9-117.1-49.6zM99.7 113.7l215.7 3.6 101-55.4L40 56l8.2 340.1 54-44.9z"
      className="classBruiser_svg__cls-1"
    />
  </svg>
)
export default SvgClassBruiser
