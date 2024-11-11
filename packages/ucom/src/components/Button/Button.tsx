import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  shadow?: boolean;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  href?: string;
  target?: string; // Add the target prop
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
  target, // Destructure the target prop
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
        target={target} // Use the target prop
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
