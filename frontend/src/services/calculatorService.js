import api from './api';

export const calculatorService = {
  evaluate: (expression, clientResult) =>
    api.post('/calculator/evaluate', { expression, client_result: clientResult }),
  validate: (expression) =>
    api.post('/calculator/validate', { expression }),
};
