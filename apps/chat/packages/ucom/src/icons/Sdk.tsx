import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgSdk = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 800 800"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M306.4 445.5h-78.8l-6.6-92h92zM438.4 445.5h-78.8l-6.6-92h92zM570.4 445.5h-78.8l-6.6-92h92z" />
    <path
      d="m682.6 444.9-18.8 45.4v60.5l-3.8 60.5-19.1 41.6-37.1 22.7-60.4 3.8-3.7-56.7h34.1l18.8-15.1 3.8-37.8 3.8-83.2 7.5-37.8 25.9-34 26.3-15.1-30-22.3-22.1-41.6-7.5-49.2v-68.1l-7.5-34-15-11.3h-34.1v-53.3h52.9l37.1 11.7 22.5 30.3 7.9 49.2v94.6l7.5 34 18.8 18.9 37.1 3.8 3.8 75.3-48.4 7.6ZM202.1 184.3l-7.5 34v68.1l-7.5 49.2-22.1 41.6-30 22.3 26.3 15.1 25.9 34 7.5 37.8 3.8 83.2 3.8 37.8 18.8 15.1h34.1l-3.8 56.7-60.4-3.8-37.1-22.7-19.1-41.6-3.8-60.5v-60.5l-18.8-45.4-45-7.6.4-75.3 37.1-3.8 18.8-18.9 7.5-34v-94.6l7.9-49.2 22.5-30.3 37.1-11.7h52.9v53.3h-34.1l-15 11.3Z"
      className="sdk_svg__cls-1"
    />
  </svg>
)
export default SvgSdk
