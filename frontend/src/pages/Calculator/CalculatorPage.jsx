import useCalculator from '../../hooks/useCalculator';
import useKeyboard from '../../hooks/useKeyboard';
import CalculatorDisplay from '../../components/calculator/CalculatorDisplay/CalculatorDisplay';
import CalculatorKeypad from '../../components/calculator/CalculatorKeypad/CalculatorKeypad';
import styles from './CalculatorPage.module.css';

export default function CalculatorPage() {
  const {
    expression,
    result,
    isError,
    isEvaluating,
    handleDigit,
    handleOperator,
    handleDecimal,
    handleBackspace,
    handleClear,
    handleEvaluate,
  } = useCalculator();

  // Bind keyboard events
  useKeyboard({
    handleDigit,
    handleOperator,
    handleDecimal,
    handleBackspace,
    handleClear,
    handleEvaluate,
  });

  return (
    <div className={styles.page}>
      {/* Animated subtle background decorative orbs */}
      <div className={styles.orbs} aria-hidden="true">
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
      </div>

      <div className={styles.container}>
        <div className={styles.calculatorCard}>
          {/* Glass header with calculator title/badge */}
          <div className={styles.cardHeader}>
            <div className={styles.statusLights}>
              <span className={styles.lightRed} />
              <span className={styles.lightYellow} />
              <span className={styles.lightGreen} />
            </div>
            <div className={styles.titleBadge}>
              <span className={styles.pulseDot} />
              AST ENGINE
            </div>
          </div>

          <CalculatorDisplay
            expression={expression}
            result={isEvaluating ? 'Evaluating...' : result}
            isError={isError}
          />

          <CalculatorKeypad
            onDigit={handleDigit}
            onOperator={handleOperator}
            onDecimal={handleDecimal}
            onBackspace={handleBackspace}
            onClear={handleClear}
            onEvaluate={handleEvaluate}
          />
          
          <div className={styles.cardFooter}>
            <span>Single Source of Truth Evaluator</span>
          </div>
        </div>
      </div>
    </div>
  );
}
