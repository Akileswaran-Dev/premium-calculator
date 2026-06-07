import styles from './Spinner.module.css';

export default function Spinner({ fullPage = false, size = 'md' }) {
  const sizeClass = styles[size] || styles.md;
  const containerClass = fullPage ? styles.fullPageContainer : styles.inlineContainer;

  return (
    <div className={containerClass}>
      <div className={`${styles.spinner} ${sizeClass}`}></div>
    </div>
  );
}
