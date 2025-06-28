/*
 * Standardized success response class for API endpoints
 * Provides consistent structure for successful responses
 */
class ApiResponse {

  constructor(statusCode, data, message = "Success") {
    // Initialize response properties
    this.statusCode = statusCode;  // HTTP status code
    this.data = data;             // Response payload (object, array, etc.)
    this.message = message;       // Human-readable success message
    
    /*
     * Automatically determine success status:
     * - true for status codes < 400 (successful responses)
     * - false for status codes >= 400 (though ApiError should be used for errors)
     */
    this.success = statusCode < 400;
  }
}

export { ApiResponse };