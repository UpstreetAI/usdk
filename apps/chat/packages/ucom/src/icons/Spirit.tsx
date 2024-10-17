import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgSpirit = ({
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
      d="m131.2 720 41.5-91.5-8.8-45.6-52.2-120-21.4-87.8 78.7-54.7 138.6-74.2 218.3-97.5L709.6 80l-11.2 149-167.2 85.4-178.4 93.4 10.7 31.9 174.4-81.8 147.7-65.2-47 160.8-76.8 36.5L383 570.1l3.9 26.5 136.3-26.2-89.9 124-44.4 3.2-127 7.8-64.6 4.2-66.2 10.4Z"
      className="spirit_svg__cls-1"
    />
  </svg>
)
export default SvgSpirit
