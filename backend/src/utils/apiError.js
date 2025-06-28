/**
 * Custom error class for standardized API error responses
 * Extends the native JavaScript Error class
 */

  /**
   * Create a new API error instance
   * @param {number} statusCode - HTTP status code for the error response
   * @param {string} [message="An unexpected error occurred."] - Human-readable error message
   * @param {Array} [errors=[]] - Additional error details or validation errors
   * @param {string} [stack=""] - Optional stack trace string (for error propagation)
   */

class ApiError extends Error {

  constructor(
    statusCode,
    message = "An unexpected error occurred.",
    errors = [],
    stack = ""
  ) {
    // Call the parent Error class constructor
    super(message);

    // Initialize error response properties
    this.statusCode = statusCode;  // HTTP status code
    this.data = null;             // Always null for errors (consistent with success responses)
    this.message = message;       // Human-readable error message
    this.success = false;        // Always false for error responses
    this.errors = errors;        // Array of error details (e.g., validation errors)

    /**
     * Handle stack trace:
     * - If stack is provided (when re-throwing errors), use the existing stack
     * - Otherwise, capture a new stack trace (excluding this constructor)
     */
    if (stack) {
      this.stack = stack;  // Preserve original stack trace
    } else {
      // Capture stack trace using V8's Error.captureStackTrace
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };