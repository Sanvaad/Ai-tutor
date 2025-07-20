export function safeEval(expr: string): string {
  try {
    // Remove any potentially dangerous characters and operations
    const sanitized = expr.replace(/[^0-9+\-*/.() \s]/g, '');
    
    // Use Function constructor to safely evaluate mathematical expressions
    const result = Function(`"use strict"; return (${sanitized})`)();
    
    if (typeof result === 'number' && !isNaN(result)) {
      return result.toString();
    } else {
      return 'Invalid calculation result';
    }
  } catch (error) {
    return `Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}