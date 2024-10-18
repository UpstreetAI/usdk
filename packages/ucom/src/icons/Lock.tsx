import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgLock = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 1200"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M948.75 454.88 900 443.63v-68.625c0-165.38-134.62-300-300-300s-300 134.62-300 300v68.625l-48.75 11.25c-44.25 10.125-75.375 49.125-75.375 94.5V952.5c0 45.375 31.125 84.375 75.375 94.5l327 75.375c7.125 1.875 14.25 2.625 21.75 2.625s14.625-.75 21.75-2.625l327-75.375c44.25-10.125 75.375-49.125 75.375-94.5V549.38c0-45.375-31.125-84.375-75.375-94.5M637.5 825c0 20.625-16.875 37.5-37.5 37.5s-37.5-16.875-37.5-37.5V675c0-20.625 16.875-37.5 37.5-37.5s37.5 16.875 37.5 37.5zM825 426.38l-203.25-46.875a94.7 94.7 0 0 0-43.5 0L375 426.38v-51.375c0-124.12 100.88-225 225-225s225 100.88 225 225z" />
  </svg>
)
export default SvgLock
