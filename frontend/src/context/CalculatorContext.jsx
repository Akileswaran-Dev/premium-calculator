import { createContext, useContext, useState, useCallback } from 'react';

const CalculatorContext = createContext(null);

/**
 * CalculatorContext — manages all calculator display and expression state.
 * The actual evaluation logic is in useCalculator hook (Phase 3).
 */
export function CalculatorProvider({ children }) {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [isError, setIsError] = useState(false);
  const [mode, setMode] = useState('standard'); // 'standard' | 'scientific'
  const [history, setHistory] = useState([]);

  const clearAll = useCallback(() => {
    setExpression('');
    setResult('0');
    setIsError(false);
  }, []);

  const addHistoryEntry = useCallback((entry) => {
    setHistory((prev) => [entry, ...prev].slice(0, 50));
  }, []);

  const value = {
    expression,
    setExpression,
    result,
    setResult,
    isError,
    setIsError,
    mode,
    setMode,
    history,
    addHistoryEntry,
    clearAll,
  };

  return (
    <CalculatorContext.Provider value={value}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculatorContext() {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error('useCalculatorContext must be used within a CalculatorProvider');
  }
  return context;
}
