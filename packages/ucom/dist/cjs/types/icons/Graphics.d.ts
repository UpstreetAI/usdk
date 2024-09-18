import type { SVGProps } from 'react';
interface SVGRProps {
    title?: string;
    titleId?: string;
}
declare const SvgGraphics: ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => import("react/jsx-runtime").JSX.Element;
export default SvgGraphics;
