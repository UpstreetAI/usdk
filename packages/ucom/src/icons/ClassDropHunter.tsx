import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgClassDropHunter = ({
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
      d="M304.2 294.9S172.9 424.2 172.1 425.2c-.8.8 18.6 111.6 18.6 111.6l80 67 100.4 9.3L506.9 440l-9.3-35.4L760 80.9 570.3 40 341.5 294.9h-37.2Zm102.3 165.6-44.7 61.4-59-4.8-32.2-26.1-12.9-56.5 50.2-53.9 78.1 9.3 20.5 70.7ZM213.1 601.9 187 579.5l-11.2-9.2L40 698.6l80 61.4 106-143.2z"
      className="classDropHunter_svg__cls-1"
    />
    <path
      d="m648.2 648.4-384 19.1-41.8 52.8 492.5-14.5 19.3-487-61.3 76.8zM126 555.2l-4.4-420.3 277.8 4.6 44.3-54.4-377.9-4.2L78 598.8z"
      className="classDropHunter_svg__cls-1"
    />
  </svg>
)
export default SvgClassDropHunter
