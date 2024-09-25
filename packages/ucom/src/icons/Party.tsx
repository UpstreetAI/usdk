import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgParty = ({
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
      d="M542.7 717.5 541 725H249.4l.6-1.8-14.9-9.3-26.1-56-125-98.8 54-119.4 80.2-110 117.5-31.8 5.6-24.2-21.6-32.1-21.3-92.8 29.8-52.2L372.5 75l50.6 3.2 47.8 23.8 25.2 48.5-27.5 93.2-22.9 31.8 1.8 22.3L565 327.6l85.8 118.7L716 558.8l-132.3 97.1zM240.6 473.2l-59.7 71.6 52.2 42.2 31.7 47.1 5.6 28.4 16.8-55zm304 0-42.9 132.4 11.5 58.5 3.6 3.2.7.4 3.7-27.3 19.8-26.6 65.3-82.9z"
      className="party_svg__st0"
    />
  </svg>
)
export default SvgParty
