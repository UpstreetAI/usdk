import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgEmotion = ({
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
      d="m703.2 482.1-1.3 92.2-63.1 31.6 21.4-66.9 13.9-72-43-137.7-44.9-115.2-.5 1.5-31.6 101-25.2-195.7-43 89.7-82.1 119.9L424 161.3l-65.1 98.5-83.9 91 1.3-157.9-1.1-1.8-143 274.5 36.7 146.6-43-18.9-27.8-17.7-1.3-85.8-45.4 13.7 1.3-149 27.4-79.6 29.5-83.4 59.3-68.2 87.2-55.6.2 1.2L309.2 50l97.2-10.1 102.3 13.9 13.3 6.8 76.4 50.7 9.4-6.3 13.3 6.8 20.2 17.7 8.9 12.7 50.6 64.4L740 310.5l8.9 62.9v128.9zm-464.9-68.2 21.4-10.1 51.8-40.4 56.8-52.8 3.1 94.5 39.9-44.2 58.1-50.2 36.6-63.5 12.7 78.3 7.6 64.4 31.8-21.4 30.1-40.4 36.6 122.6-18.9 99.7-15.2 89.7-32.7 29L450.4 736l-45.5 24-6.3-1.3-49.3-22.7-92.2-66.9-29-27.8-31.6-97.2-18.9-93.5 60.6-120v83.3Z"
      className="emotion_svg__cls-1"
    />
  </svg>
)
export default SvgEmotion
