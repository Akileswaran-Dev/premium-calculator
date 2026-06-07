import styles from './CalculatorDisplay.module.css';

export default function CalculatorDisplay({ expression, result, isError }) {
  // Determine text scale dynamically based on content length
  const getResultFontSize = (text) => {
    const len = text.length;
    if (len > 18) return styles.fontSm;
    if (len > 12) return styles.fontMd;
    return styles.fontLg;
  };

  const displayResult = isError ? 'Error' : result || '0';

  return (
    <div className={styles.display}>
      {/* Visual formula expression tracker */}
      <div className={styles.expression} title={expression}>
        {expression || '\u00A0'}
      </div>
      {/* Calculated final result output */}
      <div className={`${styles.result} ${getResultFontSize(displayResult)}`}>
        {displayResult}
      </div>
    </div>
  );
}
