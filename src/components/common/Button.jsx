import './Button.css';

export default function Button({
  variant = 'primary',
  size = 'large',
  disabled = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  className = '',
  children,
  ...rest
}) {
  const cls = [
    'hh-btn',
    `hh-btn--${variant}`,
    `hh-btn--${size}`,
    fullWidth && 'hh-btn--full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={cls} disabled={disabled} {...rest}>
      {iconLeft && <span className="hh-btn__icon">{iconLeft}</span>}
      {children && <span className="hh-btn__label">{children}</span>}
      {iconRight && <span className="hh-btn__icon">{iconRight}</span>}
    </button>
  );
}
