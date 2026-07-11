/**
 * Standardized success response shape so the client can rely on a
 * consistent envelope: { success, statusCode, message, data }.
 */
export class ApiResponse {
  constructor(statusCode, data = null, message = 'Success') {
    this.success = statusCode < 400
    this.statusCode = statusCode
    this.message = message
    this.data = data
  }
}
