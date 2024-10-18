import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgAudio = ({
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
      d="m721.7 524.8-34.1 74.9-68.2 62.6-42.6-34.1 36.9-28.5 39.8-49.1 22.7-67.2 14.2-79.5-17-88-36.9-73.8-56.8-56.8 34.1-42.6 56.8 51.1 39.8 65.3 47.4 102.2v79.5zm-98.1-163.5 2.8 88-36.9 79.5-45.4 45.2-28.4-39.4 34.1-45.4 22.7-51.1-11.4-99.4-45.4-73.8 25.6-36.9 22.7 17 42.6 51.1zM237.1 554.7 50.6 528l-3.1-263.6 97.7-8.1 81.4-2.7 231-178.5 4.3 650z"
      className="audio_svg__st0"
    />
  </svg>
)
export default SvgAudio
