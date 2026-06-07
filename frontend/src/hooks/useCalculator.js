import { useCallback, useState } from 'react';
import { useCalculatorContext } from '../context/CalculatorContext';
import { calculatorService } from '../services/calculatorService';

/**
 * useCalculator - Custom hook implementing calculator actions.
 * Backend acts as the single source of truth for expression evaluation.
 */
export default function useCalculator() {
  const {
    expression,
    setExpression,
    result,
    setResult,
    isError,
    setIsError,
    clearAll,
  } = useCalculatorContext();
  const [isEvaluating, setIsEvaluating] = useState(false);

  const operators = ['+', '-', '×', '÷'];

  const handleDigit = useCallback((digit) => {
    if (isError) {
      clearAll();
    }
    setExpression((prev) => {
      // Avoid leading zero issues (e.g. 05 -> 5) unless starting decimal
      if (prev === '0') return digit;
      return prev + digit;
    });
  }, [isError, clearAll, setExpression]);

  const handleOperator = useCallback((op) => {
    if (isError) {
      clearAll();
      return;
    }
    setExpression((prev) => {
      if (!prev) {
        if (op === '-') return '-'; // allow leading negative
        return '';
      }
      const lastChar = prev.slice(-1);
      if (operators.includes(lastChar)) {
        // Replace previous operator with the new one
        return prev.slice(0, -1) + op;
      }
      return prev + op;
    });
  }, [isError, clearAll, setExpression]);

  const handleDecimal = useCallback(() => {
    if (isError) {
      clearAll();
    }
    setExpression((prev) => {
      if (!prev) return '0.';
      const lastChar = prev.slice(-1);
      if (operators.includes(lastChar)) {
        return prev + '0.';
      }
      
      // Prevent duplicate decimals within the same number
      const parts = prev.split(/[\+\-×÷]/);
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes('.')) {
        return prev;
      }
      return prev + '.';
    });
  }, [isError, clearAll, setExpression]);

  const handleBackspace = useCallback(() => {
    if (isError) {
      clearAll();
      return;
    }
    setExpression((prev) => {
      if (!prev) return '';
      return prev.slice(0, -1);
    });
  }, [isError, clearAll, setExpression]);

  const handleEvaluate = useCallback(async () => {
    if (!expression || isError) return;
    
    // Prevent evaluating if expression ends with an operator
    const lastChar = expression.slice(-1);
    if (operators.includes(lastChar)) return;

    setIsEvaluating(true);
    setIsError(false);
    try {
      const { data } = await calculatorService.evaluate(expression);
      if (data.is_error) {
        setResult(data.result || 'Error');
        setIsError(true);
      } else {
        setResult(data.result);
      }
    } catch (err) {
      console.error('Evaluation failed:', err);
      setResult('Error');
      setIsError(true);
    } finally {
      setIsEvaluating(false);
    }
  }, [expression, isError, setResult, setIsError]);

  return {
    expression,
    result,
    isError,
    isEvaluating,
    handleDigit,
    handleOperator,
    handleDecimal,
    handleBackspace,
    handleClear: clearAll,
    handleEvaluate,
  };
}
