import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'ghost';
  shadow?: boolean;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  href?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  size = 'small',
  variant = 'primary',
  shadow = false,
  active = false,
  disabled = false,
  className,
  href,
  children,
  ...props
}) => {
  return href ?
    (
      <a
        className={
          `${styles.ucomButton} 
         ${size && styles[size]}
         ${variant && styles[variant]}
         ${shadow && variant !== 'ghost' && !active && styles.shadow}
         ${active && styles.active}
         ${className}`
        }
        href={href}
      >
        {children}
      </a>
    )
    :
    (
      <button
        className={
          `${styles.ucomButton} 
         ${size && styles[size]}
         ${variant && styles[variant]}
         ${shadow && variant !== 'ghost' && !active && styles.shadow}
         ${active && styles.active}
         ${className}`
        }
        {...props}
      >
        {children}
      </button>
    );
};

export default Button;
