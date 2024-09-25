import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgDexterity = ({
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
      d="m560 467.9 26.3 13.3 13.8 77.1 89.8 76.3 14.8 30.2-.9 32.5-48.7 62.7-178.5-39.5-78.8-106.9-65-78.6-106.5-53.8 38.3-116.1 57.3-22.6L481 89.9l278.9 135.7-200 242.1ZM155.8 101.8 212.5 40l153 112.1-36 53.5zm104.1 216.1L84.1 265.4l25.9-91.3 175.7 78.6zm-63 121.7L40 418.4l14.8-82.8 163 36.1-20.9 68Z"
      className="dexterity_svg__cls-1"
    />
  </svg>
)
export default SvgDexterity
