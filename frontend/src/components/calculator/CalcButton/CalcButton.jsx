import styles from './CalcButton.module.css';

export default function CalcButton({ value, onClick, variant = 'number', ariaLabel }) {
  const variantClass = styles[variant] || styles.number;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.button} ${variantClass}`}
      aria-label={ariaLabel || value}
    >
      {value}
    </button>
  );
}
