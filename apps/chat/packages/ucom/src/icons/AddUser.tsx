import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgAddUser = ({
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
      d="m312.5 658.2-3.5-60.4 116.6 4.3 8.4.3v-84.3l-8.4.4-116.8 4.8 5.1-123.4.3-8.3h-81.6l.2 8.2 1.3 64.1 1.2 55.6.1 3.7-106-6.4-7.9-.4-8.5-.6v86.6l8.3-.3 110.7-4.2 3.1-.1-6.8 118.7-.5 8.5h88.5l-.5-8.5z"
      className="addUser_svg__st0"
    />
    <path
      d="m628.5 408.2-77-106.5L446.1 275l-1.6-20 20.5-28.5 24.7-83.6-22.6-43.5L424.2 78l-45.4-3-39.7 19.4-26.7 46.8 19.1 83.3 19.4 28.8-5 21.7-105.4 28.5-72 98.7-39.6 87.6 79.1 4.7-2-94.2-.2-8.2-.6-27.5h137.1l-1.1 28-.3 8.4-3.9 94.2 87.6-3.6 8.4-.3 28-1.1v140.1l-27.9-1-8.4-.3-87.1-3.2 1.9 32.4H530l1.5-6.7 36.8-55.3L687 509.1zM530 558.5l-17.8 23.9-3.3 24.5-.6-.4-3.2-2.9-10.3-52.5 38.5-118.8 55.4 51.8z"
      className="addUser_svg__st0"
    />
  </svg>
)
export default SvgAddUser
