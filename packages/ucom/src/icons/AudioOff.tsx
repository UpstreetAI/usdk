import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgAudioOff = ({
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
      d="M462.9 45.3s-40.8 31.4-46.7 29.1c-5.8-2.4-109.1 84.1-109.1 84.1l-96.5 81.8-88.8 2.9L15.2 252l-5.6 46.7 6 112.2 3 128.8 106.9 9.1 96.7 20.1 93.5 66.4 109.8 77.2 42.1 42.3V562.9l-7-217.4zM744 329.4l-39.2-39.2-74.3 80.5-74.3-80.5-39.2 39.2 81.8 75.6-74.3 80.5 24.2 24.3 81.8-75.5 81.8 75.5 24.2-24.3-74.3-80.5z"
      className="audioOff_svg__st0"
    />
  </svg>
)
export default SvgAudioOff
