package com.interior.service;

import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Safe expression evaluator for template engine.
 * Supports arithmetic, comparisons, boolean ops, and functions (ceil, floor, min, max).
 * Uses whitelist-based tokenization and recursive descent parsing.
 */
@Service
public class ExpressionEvaluatorService {

  public Double evaluateNumeric(String expr, Map<String, Double> vars) {
    if (expr == null || expr.trim().isEmpty()) {
      throw new ExpressionException("Expression is empty");
    }
    try {
      List<Token> tokens = tokenize(expr, vars);
      Parser parser = new Parser(tokens);
      return parser.parseExpression();
    } catch (Exception e) {
      throw new ExpressionException("Error evaluating expression '" + expr + "': " + e.getMessage(), e);
    }
  }

  public Boolean evaluateBoolean(String expr, Map<String, Double> vars) {
    if (expr == null || expr.trim().isEmpty()) {
      throw new ExpressionException("Expression is empty");
    }
    try {
      List<Token> tokens = tokenize(expr, vars);
      Parser parser = new Parser(tokens);
      return parser.parseBooleanExpression();
    } catch (Exception e) {
      throw new ExpressionException("Error evaluating boolean expression '" + expr + "': " + e.getMessage(), e);
    }
  }

  private List<Token> tokenize(String expr, Map<String, Double> vars) {
    List<Token> tokens = new ArrayList<>();
    int i = 0;
    while (i < expr.length()) {
      char c = expr.charAt(i);

      // Skip whitespace
      if (Character.isWhitespace(c)) {
        i++;
        continue;
      }

      // Numbers
      if (Character.isDigit(c) || c == '.') {
        StringBuilder sb = new StringBuilder();
        while (i < expr.length() && (Character.isDigit(expr.charAt(i)) || expr.charAt(i) == '.')) {
          sb.append(expr.charAt(i++));
        }
        tokens.add(new Token(TokenType.NUMBER, Double.parseDouble(sb.toString())));
        continue;
      }

      // Variables and functions
      if (Character.isLetter(c) || c == '_') {
        StringBuilder sb = new StringBuilder();
        while (i < expr.length() && (Character.isLetterOrDigit(expr.charAt(i)) || expr.charAt(i) == '_')) {
          sb.append(expr.charAt(i++));
        }
        String name = sb.toString();

        // Check if it's a function
        if (i < expr.length() && expr.charAt(i) == '(') {
          tokens.add(new Token(TokenType.FUNCTION, name));
        } else {
          // It's a variable - resolve it
          if (!vars.containsKey(name)) {
            throw new ExpressionException("Variable '" + name + "' not found in context");
          }
          tokens.add(new Token(TokenType.NUMBER, vars.get(name)));
        }
        continue;
      }

      // Operators and symbols
      if (i + 1 < expr.length()) {
        String twoChar = expr.substring(i, i + 2);
        TokenType type = getOperatorType(twoChar);
        if (type != null) {
          tokens.add(new Token(type, twoChar));
          i += 2;
          continue;
        }
      }

      String oneChar = String.valueOf(c);
      TokenType type = getOperatorType(oneChar);
      if (type != null) {
        tokens.add(new Token(type, oneChar));
        i++;
        continue;
      }

      throw new ExpressionException("Unexpected character: " + c);
    }
    return tokens;
  }

  private TokenType getOperatorType(String op) {
    return switch (op) {
      case "+" -> TokenType.PLUS;
      case "-" -> TokenType.MINUS;
      case "*" -> TokenType.MULTIPLY;
      case "/" -> TokenType.DIVIDE;
      case "(" -> TokenType.LPAREN;
      case ")" -> TokenType.RPAREN;
      case "," -> TokenType.COMMA;
      case ">=" -> TokenType.GTE;
      case "<=" -> TokenType.LTE;
      case "==" -> TokenType.EQ;
      case "!=" -> TokenType.NEQ;
      case ">" -> TokenType.GT;
      case "<" -> TokenType.LT;
      case "&&" -> TokenType.AND;
      case "||" -> TokenType.OR;
      default -> null;
    };
  }

  enum TokenType {
    NUMBER, FUNCTION, PLUS, MINUS, MULTIPLY, DIVIDE, LPAREN, RPAREN, COMMA,
    GT, LT, GTE, LTE, EQ, NEQ, AND, OR
  }

  static class Token {
    TokenType type;
    Object value;

    Token(TokenType type, Object value) {
      this.type = type;
      this.value = value;
    }
  }

  class Parser {
    List<Token> tokens;
    int pos = 0;

    Parser(List<Token> tokens) {
      this.tokens = tokens;
    }

    Token current() {
      return pos < tokens.size() ? tokens.get(pos) : null;
    }

    Token consume() {
      return tokens.get(pos++);
    }

    boolean match(TokenType type) {
      Token t = current();
      return t != null && t.type == type;
    }

    // Boolean expression: or
    boolean parseBooleanExpression() {
      return parseOr();
    }

    boolean parseOr() {
      boolean left = parseAnd();
      while (match(TokenType.OR)) {
        consume();
        boolean right = parseAnd();
        left = left || right;
      }
      return left;
    }

    boolean parseAnd() {
      boolean left = parseComparison();
      while (match(TokenType.AND)) {
        consume();
        boolean right = parseComparison();
        left = left && right;
      }
      return left;
    }

    boolean parseComparison() {
      double left = parseExpression();
      Token t = current();
      if (t != null && (t.type == TokenType.GT || t.type == TokenType.LT ||
                        t.type == TokenType.GTE || t.type == TokenType.LTE ||
                        t.type == TokenType.EQ || t.type == TokenType.NEQ)) {
        TokenType op = consume().type;
        double right = parseExpression();
        return switch (op) {
          case GT -> left > right;
          case LT -> left < right;
          case GTE -> left >= right;
          case LTE -> left <= right;
          case EQ -> Math.abs(left - right) < 0.0001;
          case NEQ -> Math.abs(left - right) >= 0.0001;
          default -> throw new ExpressionException("Invalid comparison operator");
        };
      }
      return left != 0; // Non-zero is true
    }

    // Numeric expression: addition and subtraction
    double parseExpression() {
      double result = parseTerm();
      while (true) {
        if (match(TokenType.PLUS)) {
          consume();
          result += parseTerm();
        } else if (match(TokenType.MINUS)) {
          consume();
          result -= parseTerm();
        } else {
          break;
        }
      }
      return result;
    }

    // Multiplication and division
    double parseTerm() {
      double result = parseFactor();
      while (true) {
        if (match(TokenType.MULTIPLY)) {
          consume();
          result *= parseFactor();
        } else if (match(TokenType.DIVIDE)) {
          consume();
          double divisor = parseFactor();
          if (divisor == 0) throw new ExpressionException("Division by zero");
          result /= divisor;
        } else {
          break;
        }
      }
      return result;
    }

    // Factors: numbers, functions, parentheses
    double parseFactor() {
      Token t = current();
      if (t == null) throw new ExpressionException("Unexpected end of expression");

      // Unary minus
      if (match(TokenType.MINUS)) {
        consume();
        return -parseFactor();
      }

      // Number
      if (match(TokenType.NUMBER)) {
        return (Double) consume().value;
      }

      // Parentheses
      if (match(TokenType.LPAREN)) {
        consume();
        double result = parseExpression();
        if (!match(TokenType.RPAREN)) throw new ExpressionException("Missing closing parenthesis");
        consume();
        return result;
      }

      // Function
      if (match(TokenType.FUNCTION)) {
        String funcName = (String) consume().value;
        if (!match(TokenType.LPAREN)) throw new ExpressionException("Function requires parentheses");
        consume();

        List<Double> args = new ArrayList<>();
        if (!match(TokenType.RPAREN)) {
          args.add(parseExpression());
          while (match(TokenType.COMMA)) {
            consume();
            args.add(parseExpression());
          }
        }

        if (!match(TokenType.RPAREN)) throw new ExpressionException("Missing closing parenthesis in function");
        consume();

        return evaluateFunction(funcName, args);
      }

      throw new ExpressionException("Unexpected token: " + t.type);
    }

    double evaluateFunction(String name, List<Double> args) {
      return switch (name.toLowerCase()) {
        case "ceil" -> {
          if (args.size() != 1) throw new ExpressionException("ceil requires 1 argument");
          yield Math.ceil(args.get(0));
        }
        case "floor" -> {
          if (args.size() != 1) throw new ExpressionException("floor requires 1 argument");
          yield Math.floor(args.get(0));
        }
        case "min" -> {
          if (args.size() != 2) throw new ExpressionException("min requires 2 arguments");
          yield Math.min(args.get(0), args.get(1));
        }
        case "max" -> {
          if (args.size() != 2) throw new ExpressionException("max requires 2 arguments");
          yield Math.max(args.get(0), args.get(1));
        }
        default -> throw new ExpressionException("Unknown function: " + name);
      };
    }
  }

  public static class ExpressionException extends RuntimeException {
    public ExpressionException(String message) {
      super(message);
    }
    public ExpressionException(String message, Throwable cause) {
      super(message, cause);
    }
  }
}

