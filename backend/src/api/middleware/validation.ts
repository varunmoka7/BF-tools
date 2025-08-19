/**
 * Request validation middleware
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
        code: 400,
        timestamp: new Date()
      });
    }
    
    req.query = value;
    next();
  };
};

export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
        code: 400,
        timestamp: new Date()
      });
    }
    
    req.body = value;
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
        code: 400,
        timestamp: new Date()
      });
    }
    
    req.params = value;
    next();
  };
};