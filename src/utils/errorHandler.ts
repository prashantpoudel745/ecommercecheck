/**
 * Frontend Error Handler
 * Converts technical error messages to user-friendly messages while preserving backend server validation & business messages.
 */
import { extractErrorMessage } from './notify';

export const getApiErrorMessage = (error: any, fallback = 'Something went wrong. Please try again.'): string => {
  return extractErrorMessage(error, fallback);
};

export const getUserFriendlyErrorMessage = (error: any): string => {
  if (!error) return 'Something went wrong. Please try again.';

  // If backend provided a specific business error message, prioritize it
  const extracted = extractErrorMessage(error, '');
  if (
    extracted &&
    !extracted.toLowerCase().includes('request failed with status code') &&
    !extracted.toLowerCase().includes('internal server error') &&
    extracted !== 'Something went wrong. Please try again.' &&
    extracted !== 'An error occurred'
  ) {
    return extracted;
  }

  const errorMessage = error?.message || error?.toString() || '';
  const lowerMessage = errorMessage.toLowerCase();

  // Network errors
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('failed to fetch') ||
    lowerMessage.includes('econnrefused')
  ) {
    return 'Network error. Please check your connection and try again.';
  }

  // Timeout errors
  if (lowerMessage.includes('timeout') || lowerMessage.includes('took too long')) {
    return 'Request took too long. Please try again.';
  }

  // Authentication errors
  if (
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('not authenticated') ||
    lowerMessage.includes('invalid token')
  ) {
    return 'Please log in again to continue.';
  }

  // Permission errors
  if (
    lowerMessage.includes('forbidden') ||
    lowerMessage.includes('permission denied') ||
    lowerMessage.includes('not allowed')
  ) {
    return 'You do not have permission to perform this action.';
  }

  // Validation errors
  if (
    lowerMessage.includes('validation') ||
    lowerMessage.includes('required') ||
    lowerMessage.includes('invalid input')
  ) {
    return 'Please check your input and try again.';
  }

  // Duplicate/already exists errors
  if (
    lowerMessage.includes('duplicate') ||
    lowerMessage.includes('already exists') ||
    lowerMessage.includes('unique')
  ) {
    return 'This entry already exists. Please use a different value.';
  }

  // Not found errors
  if (
    lowerMessage.includes('not found') ||
    lowerMessage.includes('does not exist')
  ) {
    return 'The requested item was not found.';
  }

  // Inventory/stock errors
  if (
    lowerMessage.includes('insufficient') ||
    lowerMessage.includes('out of stock') ||
    lowerMessage.includes('not available')
  ) {
    return 'The requested item is not available. Please check inventory.';
  }

  // File upload errors
  if (
    lowerMessage.includes('file') ||
    lowerMessage.includes('upload') ||
    lowerMessage.includes('size')
  ) {
    return 'Unable to process the file. Please try again with a different file.';
  }

  // Database/server errors
  if (
    lowerMessage.includes('server') ||
    lowerMessage.includes('database') ||
    lowerMessage.includes('500')
  ) {
    return 'An error occurred on the server. Please try again later.';
  }

  // Default message
  return 'Something went wrong. Please try again.';
};

export const handleFetchError = (error: any): string => {
  return getUserFriendlyErrorMessage(error);
};
