import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgModuleStore = ({
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
    <circle cx={654.4} cy={703} r={59.8} className="moduleStore_svg__st0" />
    <circle cx={296} cy={703} r={59.8} className="moduleStore_svg__st0" />
    <path
      d="m745.9 480.6 3.1.4 31.4-286.9-84.1-4.5-12.5 219.2h-.1l-456.6-.2-55.9-239.2-90.9-5.6H19.6v72.3l74.1-17.3L166 515.4l23.6 97.7 551.8-16.2 4.6-75.2-485.6 29.8-15-61.5 500.5-9z"
      className="moduleStore_svg__st0"
    />
    <path
      d="m328.963 102.252 90.155-90.156 90.155 90.156-90.155 90.155zM444.165 217.442l90.155-90.155 90.156 90.155-90.156 90.156zM272.07 274.307l90.156-90.156 90.155 90.156-90.155 90.155z"
      className="moduleStore_svg__st0"
    />
  </svg>
)
export default SvgModuleStore
