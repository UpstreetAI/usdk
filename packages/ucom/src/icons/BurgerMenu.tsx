import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgBurgerMenu = ({
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
    <defs>
      <path id="burger-menu_svg__a" d="M52 324.1h696v152.8H52z" />
    </defs>
    <path
      d="m52 341.1 696-17v152.7L52 442.9z"
      className="burger-menu_svg__st1"
    />
    <defs>
      <path id="burger-menu_svg__b" d="M52 131.2h696V284H52z" />
    </defs>
    <path d="m748 148.2-696-17V284l696-34z" className="burger-menu_svg__st1" />
    <defs>
      <path id="burger-menu_svg__c" d="M52 517h696v152.8H52z" />
    </defs>
    <path
      d="M748 534 52 517v152.7l696-33.9z"
      className="burger-menu_svg__st1"
    />
  </svg>
)
export default SvgBurgerMenu
