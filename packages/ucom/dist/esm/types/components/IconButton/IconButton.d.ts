export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: string;
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'secondary' | 'ghost';
    shadow?: boolean;
    active?: boolean;
    disabled?: boolean;
}
declare const IconButton: React.FC<IconButtonProps>;
export default IconButton;
