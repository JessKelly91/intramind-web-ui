/**
 * File validation utilities for upload functionality
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Allowed file types for document upload
 */
export const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/gif': ['.gif'],
};

/**
 * Default max file size (10MB)
 */
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts.pop()!.toLowerCase()}` : '';
}

/**
 * Get allowed extensions as array
 */
export function getAllowedExtensions(): string[] {
  return Object.values(ALLOWED_FILE_TYPES).flat();
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes?: string[]): FileValidationResult {
  const allowed = allowedTypes || getAllowedExtensions();
  const extension = getFileExtension(file.name);

  // Check by extension
  if (allowed.includes(extension)) {
    return { valid: true };
  }

  // Check by MIME type
  if (file.type && Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
    return { valid: true };
  }

  return {
    valid: false,
    error: `File type not allowed. Supported types: ${allowed.join(', ')}`
  };
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSize?: number): FileValidationResult {
  const max = maxSize || DEFAULT_MAX_FILE_SIZE;

  if (file.size > max) {
    const maxMB = Math.round(max / 1024 / 1024);
    const fileMB = (file.size / 1024 / 1024).toFixed(2);
    return {
      valid: false,
      error: `File too large (${fileMB}MB). Maximum size: ${maxMB}MB`
    };
  }

  return { valid: true };
}

/**
 * Validate file (type and size)
 */
export function validateFile(
  file: File,
  allowedTypes?: string[],
  maxSize?: number
): FileValidationResult {
  // Validate type
  const typeResult = validateFileType(file, allowedTypes);
  if (!typeResult.valid) {
    return typeResult;
  }

  // Validate size
  const sizeResult = validateFileSize(file, maxSize);
  if (!sizeResult.valid) {
    return sizeResult;
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file icon emoji based on extension
 */
export function getFileIcon(filename: string): string {
  const ext = getFileExtension(filename);

  const iconMap: Record<string, string> = {
    '.pdf': '📄',
    '.doc': '📝',
    '.docx': '📝',
    '.ppt': '📊',
    '.pptx': '📊',
    '.txt': '📃',
    '.md': '📋',
    '.png': '🖼️',
    '.jpg': '🖼️',
    '.jpeg': '🖼️',
    '.gif': '🖼️',
  };

  return iconMap[ext] || '📎';
}
