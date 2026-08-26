export class ResponseUtil {
  public static success(data: any, message = 'Operation successful', meta?: any) {
    return {
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
      timestamp: new Date().toISOString(),
    };
  }

  public static error(message = 'An error occurred', statusCode = 500, details?: any) {
    return {
      success: false,
      message,
      statusCode,
      ...(details ? { details } : {}),
      timestamp: new Date().toISOString(),
    };
  }
}
