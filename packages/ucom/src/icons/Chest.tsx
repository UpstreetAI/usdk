import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgChest = ({
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
      d="m719.1 656.9-52.2 13.9-42.9-69.1 11.7-19.3-70.8-187.6-17.4 110.5 11.6 48.8 68.5 105.3-118.2 64.2L416.9 621l46.9-197.4 17.4-63.6 36.5-153.8-54.4-6.2 23.4-77.6-163.1-13.9.8-8L367.3 82l103.5-5.9 45.2 30.8 1.2 55.2 91.8 37.3 55.7 177.3 59.1 164.4 20.9-3.9 15.4 83.5-40.9 36ZM318.5 157.2l2.6-24.7 135.7 10-30 77.6 58.9 7.7-32.3 138.8L386.7 623l-102.4 96.9-84.2-49.1L258.2 558l11.6-42.4-10.5-116.9L160.7 567l16.2 27-48.7 65.5-53.5-21.8-34.6-41.1L62 518.2l22 2.6L161.8 362 228 183l90.6-25.7Z"
      className="chest_svg__cls-1"
    />
  </svg>
)
export default SvgChest
