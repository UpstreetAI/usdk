import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgDevTools = ({
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
      d="m442.7 541.6 3.3-294.5 58.3-71.1-34-114.8L416.8 40l22.8 87.5-33.2 36.2-45.4-19.3-25-84.9-30.7 37.2v93.7l48.5 51.9 1.6 305.8-72.8 82.4 43.7 105.1 56.6 24.4-25.9-84.2 35.6-38.8 47 17.8 21.7 88.2 33.2-33.2v-110zM80.3 428.6 250 540.9v-80L152.8 400l97.2-60.3V259c-56.6 37.4-113.1 74.9-169.7 112.3v57.2ZM719.7 428.6 550 540.9v-80l97.2-60.9-97.2-60.3V259c56.6 37.4 113.1 74.9 169.7 112.3v57.2Z"
      className="devTools_svg__cls-1"
    />
  </svg>
)
export default SvgDevTools
