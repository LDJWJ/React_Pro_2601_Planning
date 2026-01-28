import './IconButton.css';

export default function IconButton({
  variant = 'transparent',
  selected = false,
  icon,
  label,
  className = '',
  ...rest
}) {
  const cls = [
    'hh-icon-btn',
    `hh-icon-btn--${variant}`,
    selected && 'hh-icon-btn--selected',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={cls} {...rest}>
      {icon && <span className="hh-icon-btn__icon">{icon}</span>}
      {label && <span className="hh-icon-btn__label">{label}</span>}
    </button>
  );
}
