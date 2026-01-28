import './Chip.css';

export default function Chip({ variant = 'category', className = '', children }) {
  const cls = ['hh-chip', `hh-chip--${variant}`, className].filter(Boolean).join(' ');
  return <span className={cls}>{children}</span>;
}
