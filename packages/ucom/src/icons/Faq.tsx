import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgFaq = ({
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
      d="m40 135 27.1 407.6 163-13.6-13.6 176.6L406.7 529l271.7 13.6 81.5-448.3zm385.5 293.8h-51.2v-51.2h51.2zm22.1-133.5-4.2 1.8q-13.8 6.15-15.9 12c-1.4 3.9-2 9.5-2 16.9v25.7h-51.2V326c0-21.2 11.2-38.5 33.5-52l4-2.4c9.2-5.5 13.8-13.1 13.8-22.6s-2.5-12.9-7.5-17.9c-5-5.1-11-7.6-18-7.6h-25.7c-15.8 0-24.4 8.5-25.7 25.5h-25.5c3.9-34.1 21-51.2 51.2-51.2h51.2c14 0 26.1 5 36.2 15.1C472 222.9 477 235 477 249c-.1 22.2-9.9 37.7-29.4 46.3"
      className="faq_svg__cls-1"
    />
  </svg>
)
export default SvgFaq
