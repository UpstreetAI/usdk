import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgPublish = ({
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
    <path d="M401.3 279.8 232.9 386.1l109.6 2.8-8.1 248.7 131 2.6-10.7-248.6h112.4z" />
    <path d="M728.3 0H71.7C32.2 0 0 12.2 0 71.7v676.6C0 767.8 32.2 800 71.7 800h656.6c39.5 0 71.7-32.2 71.7-51.7V71.7C800 12.2 767.8 0 728.3 0m24.4 202.1v526.2c0 13.4-10.9 24.4-24.4 24.4H71.7c-13.4 0-24.4-10.9-24.4-24.4V202.1zm0-130.4v83.1H47.3V71.7c0-13.4 10.9-24.4 24.4-24.4h656.6c13.4 0 24.4 11 24.4 24.4" />
    <path d="M103.9 71.3c-16.3 0-29.5 13.2-29.5 29.5s13.2 29.5 29.5 29.5 29.5-13.2 29.5-29.5-13.3-29.5-29.5-29.5M181.5 71.3c-16.3 0-29.5 13.2-29.5 29.5s13.2 29.5 29.5 29.5 29.5-13.2 29.5-29.5-13.2-29.5-29.5-29.5M259.2 71.3c-16.3 0-29.5 13.2-29.5 29.5s13.2 29.5 29.5 29.5 29.5-13.2 29.5-29.5-13.2-29.5-29.5-29.5" />
  </svg>
)
export default SvgPublish
