export abstract class BaseException extends Error {
    public readonly statusCode: number;
    public readonly details?: any;
  
    constructor(
      message: string,
      statusCode: number = 400,
      details?: any
    ) {
      super(message); 
      this.name = this.constructor.name;
      this.statusCode = statusCode;
      this.details = details;
      
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  