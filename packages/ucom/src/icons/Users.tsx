import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgUsers = ({
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
      d="m486.9 712.6-1.5 7.4H226.5l.5-1.8-13.2-9.2-23.2-55.1-110.9-97.4L127.8 439l71.1-108.4 104.3-31.2 5-23.9-19.1-31.6-18.9-91.3 26.5-51.4L336 80.1l44.9 3.1 42.4 23.5 22.4 47.8-24.4 91.7-20.3 31.3 1.7 22L507 328.9l76.1 116.9 57.8 110.8-117.4 95.5-36.4 60.6ZM218.7 472l-52.9 70.5 46.4 41.5 28.2 46.4 5 28 14.9-54.1-41.5-132.2Zm269.9 0-38.1 130.3 10.1 57.6 3.2 3.2.6.4 3.3-26.9 17.6-26.2 57.9-81.6-54.6-56.9Z"
      className="users_svg__cls-1"
    />
    <path
      d="m639.7 556.5-57.8-110.8-66-101.3 8.3 13.6-4 19.4-84.7 25.5-40.6 135 14.4 109.2 26.2 28.4 12.1 35.6 10.7 7.5-.4 1.5h26.5l1.5-7.4 36.4-60.6 117.3-95.5Zm-155.5 54.1-17.6 26.2-3.3 26.9-.6-.4-3.2-3.2-10.1-57.6 38.1-130.3 54.6 56.9-57.9 81.6Z"
      className="users_svg__cls-1"
    />
    <path
      d="m685.4 401.4-84.7-23.9-1.3-18 16.5-25.5 19.8-74.7-18.2-38.8-34.4-19.2-36.5-2.5-31.9 17.1-21.5 41.9 7.1 34.3 14.6 4.1 12.3 3.5 6.9 10.6 76.1 117 .9 1.3.8 1.4 57.9 110.9 12.7 24.5-21.4 17.4-112.8 91.7-27.4 45.5h147.2l1.2-6 9.4-38.7 32-28.2 9.7-94.9z"
      className="users_svg__cls-1"
    />
  </svg>
)
export default SvgUsers
