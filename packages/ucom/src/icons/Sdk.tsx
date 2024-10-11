import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgSdk = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 800 800"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M80.3 428.6 250 540.9v-80L152.8 400l97.2-60.3V259c-56.6 37.4-113.1 74.9-169.7 112.3v57.2ZM719.7 428.6 550 540.9v-80l97.2-60.9-97.2-60.3V259c56.6 37.4 113.1 74.9 169.7 112.3v57.2ZM342.8 427.4h-47.6l-4-55.8h55.6zM422.8 427.4h-47.6l-4-55.8h55.6zM502.8 427.4h-47.7l-4-55.8h55.7z" />
  </svg>
)
export default SvgSdk
