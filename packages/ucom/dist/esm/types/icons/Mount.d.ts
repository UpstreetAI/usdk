import type { SVGProps } from 'react';
interface SVGRProps {
    title?: string;
    titleId?: string;
}
declare const SvgMount: ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => import("react/jsx-runtime").JSX.Element;
export default SvgMount;
