import ast
import operator
import logging
from typing import Any

logger = logging.getLogger(__name__)

# Supported safe operators
SAFE_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.USub: operator.neg,
    ast.UAdd: lambda x: x,
}

class CalculatorService:
    @staticmethod
    def _safe_eval(node: Any) -> float | int:
        """Recursively parses AST and evaluates using whitelisted operators only."""
        if hasattr(ast, 'Num') and isinstance(node, ast.Num):  # Compatibility for older Python versions
            return node.n
        elif isinstance(node, ast.Constant):  # Python 3.8+
            if isinstance(node.value, (int, float)):
                return node.value
            raise ValueError(f"Unsupported constant type: {type(node.value)}")
        elif isinstance(node, ast.BinOp):
            left = CalculatorService._safe_eval(node.left)
            right = CalculatorService._safe_eval(node.right)
            op_type = type(node.op)
            if op_type in SAFE_OPERATORS:
                # Prevent division by zero
                if op_type == ast.Div and right == 0:
                    raise ZeroDivisionError("Division by zero")
                return SAFE_OPERATORS[op_type](left, right)
            raise ValueError(f"Unsupported binary operator: {op_type}")
        elif isinstance(node, ast.UnaryOp):
            operand = CalculatorService._safe_eval(node.operand)
            op_type = type(node.op)
            if op_type in SAFE_OPERATORS:
                return SAFE_OPERATORS[op_type](operand)
            raise ValueError(f"Unsupported unary operator: {op_type}")
        raise ValueError(f"Unsupported syntax: {type(node)}")

    @staticmethod
    def evaluate(expression: str) -> tuple[str, bool]:
        """
        Safely evaluates mathematical expression.
        Returns a tuple: (result_str, is_error).
        """
        try:
            # Normalize visual division and multiplication signs
            sanitized = expression.replace("×", "*").replace("÷", "/").strip()
            
            if not sanitized:
                return "0", False

            tree = ast.parse(sanitized, mode="eval")
            res = CalculatorService._safe_eval(tree.body)
            
            # Clean floating point approximations and formats
            if isinstance(res, (int, float)):
                res = round(res, 10)
                if isinstance(res, float) and res.is_integer():
                    res = int(res)
                    
            return str(res), False
        except ZeroDivisionError:
            return "Error: Division by zero", True
        except Exception as e:
            logger.warning(f"Failed to evaluate expression: {expression}. Error: {e}")
            return "Error", True

    @staticmethod
    def validate(expression: str) -> tuple[bool, str | None]:
        """
        Validates mathematical expression structure.
        """
        try:
            sanitized = expression.replace("×", "*").replace("÷", "/").strip()
            if not sanitized:
                return True, None
            tree = ast.parse(sanitized, mode="eval")
            CalculatorService._safe_eval(tree.body)
            return True, None
        except Exception as e:
            return False, str(e)
