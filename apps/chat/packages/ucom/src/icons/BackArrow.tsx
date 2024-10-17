import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgBackArrow = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    viewBox="0 0 84 89"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d="m84 56.363-33.71-1.64 14.451 30.62L60.896 89l-5.77-3.048L0 46.938v-4.876L55.126 3.048 60.896 0l3.845 3.824L50.29 34.58 84 32.637z"
      className="back-arrow_svg__st0"
    />
  </svg>
)
export default SvgBackArrow
