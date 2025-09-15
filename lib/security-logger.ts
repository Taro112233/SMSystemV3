// lib/security-logger.ts - Security Event Logging Utility
// InvenStock - Centralized Security Event Management

// Define proper interfaces for security events
interface SecurityEventBase {
  timestamp: Date;
  ip: string;
  path: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

interface RateLimitEvent extends SecurityEventBase {
  type: 'rate_limit';
}

interface BotBlockedEvent extends SecurityEventBase {
  type: 'bot_blocked';
}

interface ShieldBlockedEvent extends SecurityEventBase {
  type: 'shield_blocked';
}

interface HostingIPEvent extends SecurityEventBase {
  type: 'hosting_ip';
}

export type SecurityEvent = RateLimitEvent | BotBlockedEvent | ShieldBlockedEvent | HostingIPEvent;

// Simple in-memory storage for security events (in production, use Redis/Database)
const securityEvents: SecurityEvent[] = [];

/**
 * Log a security event to memory storage
 * In production, this should write to Redis/Database for persistence
 */
export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
  securityEvents.push({
    timestamp: new Date(),
    ...event
  });
  
  // Keep only last 1000 events in memory
  if (securityEvents.length > 1000) {
    securityEvents.splice(0, securityEvents.length - 1000);
  }
}

/**
 * Get all security events (for monitoring dashboard)
 */
export function getSecurityEvents(): SecurityEvent[] {
  return [...securityEvents]; // Return copy to prevent mutations
}

/**
 * Get security events within a date range
 */
export function getSecurityEventsInRange(startDate: Date, endDate: Date): SecurityEvent[] {
  return securityEvents.filter(event => 
    event.timestamp >= startDate && event.timestamp <= endDate
  );
}

/**
 * Get security events of specific type
 */
export function getSecurityEventsByType(type: SecurityEvent['type']): SecurityEvent[] {
  return securityEvents.filter(event => event.type === type);
}

/**
 * Clear all security events (for testing/reset)
 */
export function clearSecurityEvents(): void {
  securityEvents.length = 0;
}

/**
 * Get security statistics
 */
export function getSecurityStats(timeRange: { start: Date; end: Date }) {
  const eventsInRange = getSecurityEventsInRange(timeRange.start, timeRange.end);
  
  const eventsByType = eventsInRange.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ipCounts = eventsInRange.reduce((acc, event) => {
    acc[event.ip] = (acc[event.ip] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pathCounts = eventsInRange.reduce((acc, event) => {
    acc[event.path] = (acc[event.path] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalEvents: eventsInRange.length,
    eventsByType,
    uniqueIPs: Object.keys(ipCounts).length,
    topIPs: Object.entries(ipCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count })),
    topPaths: Object.entries(pathCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }))
  };
}

// Production-ready functions for Redis/Database integration
// TODO: Implement these when moving to production

/**
 * Log security event to persistent storage (Redis/Database)
 * This should replace logSecurityEvent in production
 */
export async function logSecurityEventPersistent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
  // TODO: Implement Redis/Database logging
  // await redis.lpush('security:events', JSON.stringify({ ...event, timestamp: new Date() }));
  // await redis.ltrim('security:events', 0, 999); // Keep last 1000 events
  
  // For now, fallback to memory
  logSecurityEvent(event);
}

/**
 * Get security events from persistent storage
 */
export async function getSecurityEventsPersistent(limit = 100): Promise<SecurityEvent[]> {
  // TODO: Implement Redis/Database retrieval
  // const events = await redis.lrange('security:events', 0, limit - 1);
  // return events.map(e => JSON.parse(e));
  
  // For now, fallback to memory
  return getSecurityEvents().slice(0, limit);
}

/**
 * Export types for use in other files
 */
export type {
  SecurityEventBase,
  RateLimitEvent,
  BotBlockedEvent,
  ShieldBlockedEvent,
  HostingIPEvent
};