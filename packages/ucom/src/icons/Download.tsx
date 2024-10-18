import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgDownload = ({
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
      d="M416.1 562.8 157.9 250.2l191.2 25.5-44.6-235.8h165.7l-31.8 235.8 210.3-38.3-232.5 325.4Zm-258.2 97.3 458.8-21.8V517.8l127.4-6.3-6.3 248.5-669-19v-.5l-3 .5S58 573.2 56 562.6c.2-7.6 101.9-12.8 101.9-12.8v110.4Z"
      className="download_svg__cls-1"
    />
  </svg>
)
export default SvgDownload
