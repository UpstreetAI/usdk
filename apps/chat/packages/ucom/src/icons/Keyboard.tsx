import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgKeyboard = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 1200"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M225 450h75v75h-75zM337.5 450h75v75h-75zM450 450h75v75h-75zM562.5 450h75v75h-75zM675 450h75v75h-75zM787.5 450h75v75h-75zM900 450h75v75h-75zM225 562.5h75v75h-75zM337.5 562.5h75v75h-75zM450 562.5h75v75h-75zM562.5 562.5h75v75h-75zM675 562.5h75v75h-75zM787.5 562.5h75v75h-75zM900 562.5h75v75h-75zM225 675h75v75h-75zM900 675h75v75h-75z" />
    <path d="M112.5 300v600h975V300zm900 525h-825V375h825z" />
    <path d="M337.5 675h525v75h-525z" />
  </svg>
)
export default SvgKeyboard
