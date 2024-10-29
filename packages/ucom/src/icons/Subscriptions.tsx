import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgSubscriptions = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 34 39"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      d="M30.147 25.105c-.828-1.476-2.363-2.468-4.121-2.468-2.637 0-4.774 2.228-4.774 4.977s2.137 4.977 4.774 4.977c1.758 0 3.293-.992 4.122-2.468H34c-.606 2.096-1.95 3.858-3.718 4.956V39h-3.331v-2.755a8 8 0 0 1-1.85 0V39h-3.332v-3.92c-2.438-1.516-4.072-4.292-4.072-7.466s1.634-5.95 4.072-7.465v-3.92H25.1v2.755a8 8 0 0 1 1.85 0v-2.756h3.332v3.921c1.768 1.099 3.112 2.86 3.718 4.956zm-16.865 2.533c0 3.218 1.14 6.168 2.968 8.466H0l.047-3.043L4.19 29.68s-.096-15.537 1.884-18.997c2.898-5.067 8.15-6.375 8.15-6.375S13.807.32 17.137.005V0l.023.002c.008 0 .016-.001-.019-.002v.005c3.372.315 2.872 4.303 2.872 4.303s5.337 1.308 8.193 6.375c.51.818.862 2.315 1.127 4.124-1.045-.289-2.142-.488-3.274-.488-7.034 0-12.778 5.988-12.778 13.32"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgSubscriptions
