import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgVoice = ({
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
      d="M680.3 473.9c-22 0-39.7-15.6-39.7-34.8v-78c0-19.3 17.8-34.8 39.7-34.8s39.7 15.6 39.7 34.8v78c0 19.2-17.9 34.8-39.7 34.8m-140.1 82c-22 0-39.7-15.6-39.7-34.8V279c0-19.3 17.8-34.8 39.7-34.8s39.7 15.6 39.7 34.8v242c0 19.3-17.9 34.9-39.7 34.9M400 720.1c-22 0-39.7-15.6-39.7-34.8V114.8c0-19.3 17.8-34.8 39.7-34.8s39.7 15.6 39.7 34.8V685c0 19.3-17.9 34.9-39.7 34.9ZM259.8 555.9c-22 0-39.7-15.6-39.7-34.8V279c0-19.3 17.8-34.8 39.7-34.8s39.7 15.6 39.7 34.8v242c0 19.3-17.9 34.9-39.7 34.9m-140.1-82c-22 0-39.7-15.6-39.7-34.8v-78c0-19.3 17.8-34.8 39.7-34.8s39.7 15.6 39.7 34.8v78c0 19.2-17.9 34.8-39.7 34.8"
      className="voice_svg__cls-1"
    />
  </svg>
)
export default SvgVoice
