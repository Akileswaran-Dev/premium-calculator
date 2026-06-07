import CalcButton from '../CalcButton/CalcButton';
import styles from './CalculatorKeypad.module.css';

export default function CalculatorKeypad({
  onDigit,
  onOperator,
  onDecimal,
  onBackspace,
  onClear,
  onEvaluate,
}) {
  return (
    <div className={styles.keypad}>
      {/* Row 1: Controls & Divide/Multiply */}
      <CalcButton value="C" onClick={onClear} variant="clear" />
      <CalcButton value="⌫" onClick={onBackspace} variant="function" ariaLabel="backspace" />
      <CalcButton value="÷" onClick={() => onOperator('÷')} variant="operator" />
      <CalcButton value="×" onClick={() => onOperator('×')} variant="operator" />

      {/* Row 2: 7-8-9 & Subtract */}
      <CalcButton value="7" onClick={() => onDigit('7')} />
      <CalcButton value="8" onClick={() => onDigit('8')} />
      <CalcButton value="9" onClick={() => onDigit('9')} />
      <CalcButton value="-" onClick={() => onOperator('-')} variant="operator" />

      {/* Row 3: 4-5-6 & Add */}
      <CalcButton value="4" onClick={() => onDigit('4')} />
      <CalcButton value="5" onClick={() => onDigit('5')} />
      <CalcButton value="6" onClick={() => onDigit('6')} />
      <CalcButton value="+" onClick={() => onOperator('+')} variant="operator" />

      {/* Row 4: 1-2-3 & Equals (Double Height Wrapper) */}
      <CalcButton value="1" onClick={() => onDigit('1')} />
      <CalcButton value="2" onClick={() => onDigit('2')} />
      <CalcButton value="3" onClick={() => onDigit('3')} />
      
      {/* Equals spanning two rows vertically */}
      <div className={styles.doubleHeight}>
        <CalcButton value="=" onClick={onEvaluate} variant="equals" />
      </div>

      {/* Row 5: 0 (Double Width Wrapper) & Decimal */}
      <div className={styles.doubleWidth}>
        <CalcButton value="0" onClick={() => onDigit('0')} />
      </div>
      <CalcButton value="." onClick={onDecimal} />
    </div>
  );
}
