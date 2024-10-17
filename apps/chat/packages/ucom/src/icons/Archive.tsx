import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgArchive = ({
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
      d="m297.5 419.9 1.8 86.6 104.8-86.6 164 8.2 49.2-270.7L182.7 182 199 428.1zm147.6-147.7h49.2v49.2h-49.2zm-82 0h49.2v49.2h-49.2zm-82 0h49.2v49.2h-49.2z"
      className="archive_svg__st0"
    />
    <path
      d="M754.5 282.2 640 295.7l-35.9 197.7-193.8-29.2L267.4 574l-7.2-86.6-101.6 7.7-12.9-192.9-88.7-7.3L7.2 629.7 62 693.1l652.6 17.7 77.3-65.9zM599.2 147.7l4.9-26.6L201 143.3l1.8 26.2zM573.6 113.5l4.4-24.3-354.3 19 1.6 23.9z"
      className="archive_svg__st0"
    />
  </svg>
)
export default SvgArchive
