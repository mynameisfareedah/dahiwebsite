/**
 * Admin Panel Type Definitions
 * This file contains JSDoc type definitions for the admin panel
 */

/**
 * @typedef {Object} AdminUser
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} [fullName] - User full name
 * @property {string} [role] - User role
 * @property {string} [avatar_url] - User avatar URL
 */

/**
 * @typedef {Object} AuthSession
 * @property {AdminUser} user - Current user
 * @property {string} access_token - Access token
 * @property {string} refresh_token - Refresh token
 * @property {number} expires_in - Token expiration time
 */

/**
 * @typedef {Object} AdminNotification
 * @property {string} id - Notification ID
 * @property {string} type - Notification type (info, success, warning, error)
 * @property {string} title - Notification title
 * @property {string} [message] - Notification message
 * @property {number} [timestamp] - Timestamp
 */

export {};
