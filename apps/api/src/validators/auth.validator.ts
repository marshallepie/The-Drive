import Joi from 'joi'
import { UserRole } from '../types'

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
  }),
  firstName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'First name must be at least 2 characters',
    'string.max': 'First name cannot exceed 100 characters',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Last name must be at least 2 characters',
    'string.max': 'Last name cannot exceed 100 characters',
    'any.required': 'Last name is required',
  }),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .default('PUBLIC'),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().allow('').messages({
    'string.pattern.base': 'Please provide a valid phone number',
  }),
  dealershipName: Joi.string().max(200).when('role', {
    is: 'DEALER',
    then: Joi.required().messages({ 'any.required': 'Dealership name is required for dealer accounts' }),
    otherwise: Joi.optional().allow(''),
  }),
  dealershipLicense: Joi.string().max(100).optional().allow(''),
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
})

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
})
