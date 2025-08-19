/**
 * Global error handling middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../../types/waste';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error for debugging
  console.error(`Error ${statusCode}: ${message}`, {
    error: err,
    request: {
      method: req.method,
      url: req.url,
      body: req.body,
      query: req.query,
      params: req.params
    }
  });

  const errorResponse: ErrorResponse = {
    success: false,
    error: message,
    code: statusCode,
    timestamp: new Date()
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response) => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: `Route ${req.originalUrl} not found`,
    code: 404,
    timestamp: new Date()
  };

  res.status(404).json(errorResponse);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};