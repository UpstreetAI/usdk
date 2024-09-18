export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'secondary' | 'ghost';
    shadow?: boolean;
    active?: boolean;
    disabled?: boolean;
}
declare const Button: React.FC<ButtonProps>;
export default Button;
