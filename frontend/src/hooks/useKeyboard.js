import { useEffect } from 'react';

/**
 * useKeyboard - Custom hook for keyboard support.
 * Maps keyboard keydown events to calculator functions.
 */
export default function useKeyboard({
  handleDigit,
  handleOperator,
  handleDecimal,
  handleBackspace,
  handleClear,
  handleEvaluate,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore keypresses if focusing input boxes (like user profile fields)
      if (
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA' ||
        document.activeElement.isContentEditable
      ) {
        return;
      }

      const { key } = e;

      if (/[0-9]/.test(key)) {
        e.preventDefault();
        handleDigit(key);
      } else if (key === '.' || key === ',') {
        e.preventDefault();
        handleDecimal();
      } else if (key === '+') {
        e.preventDefault();
        handleOperator('+');
      } else if (key === '-') {
        e.preventDefault();
        handleOperator('-');
      } else if (key === '*' || key.toLowerCase() === 'x') {
        e.preventDefault();
        handleOperator('×');
      } else if (key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (key === 'Escape') {
        e.preventDefault();
        handleClear();
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEvaluate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    handleDigit,
    handleOperator,
    handleDecimal,
    handleBackspace,
    handleClear,
    handleEvaluate,
  ]);
}
