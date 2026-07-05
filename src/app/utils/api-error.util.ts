import { HttpErrorResponse } from '@angular/common/http';

export interface ApiValidationErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

export function extractApiErrorMessage(error: HttpErrorResponse): string | null {
  const body = error.error;
  if (!body) {
    return null;
  }
  if (typeof body === 'string') {
    return body;
  }
  if (typeof body === 'object') {
    const validation = body as ApiValidationErrorBody;
    if (validation.errors) {
      const messages = Object.values(validation.errors)
        .flat()
        .filter((message): message is string => typeof message === 'string' && message.length > 0);
      if (messages.length > 0) {
        return messages.join(' ');
      }
    }
    if (typeof validation.message === 'string') {
      return validation.message;
    }
  }
  return null;
}
