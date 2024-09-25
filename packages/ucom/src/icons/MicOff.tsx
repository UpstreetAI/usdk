import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgMicOff = ({
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
      d="m538.8 451.6 7.1-32V302l25.1-21 25.1 16.8V428l-18.3 62.7zM302.9 142.5l29.3-46.2L403 74.9l67.5 25.6 25.1 42v269.6L302.9 218.9zm323.3 571-496-497 49.6-49.7 496 497zM256.8 428l21 54.6 37.7 37.8 62.9 21h5l52.1 55.9-11-1.4v75.6h88.8l3.3 10.9v43.7H281.9v-54.6h92.2v-75.6l-75.4-25.2-62.9-58.7-33.5-79.8v-64.7l54.5 54.6z"
      className="micOff_svg__st0"
    />
  </svg>
)
export default SvgMicOff
