import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgAccessories = ({
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
      d="m748.8 354.2-59.7 44-127.9 70.9-15-25.2 33.6-18.7-8.4-40.2-38.3 14.1-11.2-18.7 78.5-39.2 78.5-47.6 45.8-46.7 35.5 87.8-11.3 19.5Zm-91.5-104.6-50.5 7.4-91.5 18.7L399.5 314 266 372.9l-84 50.5-57 42.9-48.5 5.6-36.4-5.6 16.8-28.1 53.2-41.1L215.6 341l157.8-66.3L548 212.1l102.8-22.4h47.6l7.4 11.2-15.9 30.9-32.7 17.7ZM292.2 467.3l39.2 93.4-95.2 25.2-108.4 24.2-32.7-6.5-34.6-84 89.6-10.3 142-42Zm38.3-67.3 124.2-50.5 16.8 9.4 21.5 57.9-88.7 20.6 17.7 32.7 14 36.4 75.6-46.7 23.3 57-9.4 18.7-119.6 46.7-26.2-8.4-56.9-153.1 7.5-20.6Z"
      className="accessories_svg__cls-1"
    />
  </svg>
)
export default SvgAccessories
