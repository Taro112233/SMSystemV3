// app/api/security/monitoring/route.ts - ARCJET MONITORING DASHBOARD
import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import arcjet, { shield } from "@arcjet/next";

// Basic protection for monitoring endpoint
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [shield({ mode: "LIVE" })],
});

// Simple in-memory storage for security events (in production, use Redis/Database)
const securityEvents: Array<{
  timestamp: Date;
  type: 'rate_limit' | 'bot_blocked' | 'shield_blocked' | 'hosting_ip';
  ip: string;
  path: string;
  userAgent?: string;
  details?: any;
}> = [];

// Function to add security event (call this from middleware/API routes)
export function logSecurityEvent(event: {
  type: 'rate_limit' | 'bot_blocked' | 'shield_blocked' | 'hosting_ip';
  ip: string;
  path: string;
  userAgent?: string;
  details?: any;
}) {
  securityEvents.push({
    timestamp: new Date(),
    ...event
  });
  
  // Keep only last 1000 events in memory
  if (securityEvents.length > 1000) {
    securityEvents.splice(0, securityEvents.length - 1000);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Protect this endpoint
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Require authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Only allow organization owners/admins to view security data
    // (In production, add proper role checking)

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Filter recent events
    const recentEvents = securityEvents.filter(e => e.timestamp >= oneDayAgo);
    const lastHourEvents = securityEvents.filter(e => e.timestamp >= oneHourAgo);

    // Group by type
    const eventsByType = recentEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top blocked IPs
    const ipCounts = recentEvents.reduce((acc, event) => {
      acc[event.ip] = (acc[event.ip] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topBlockedIPs = Object.entries(ipCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    // Most targeted paths
    const pathCounts = recentEvents.reduce((acc, event) => {
      acc[event.path] = (acc[event.path] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topTargetedPaths = Object.entries(pathCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    // Recent events timeline (last 24 hours, grouped by hour)
    const timeline = Array.from({ length: 24 }, (_, i) => {
      const hourStart = new Date(now.getTime() - (i + 1) * 60 * 60 * 1000);
      const hourEnd = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      const eventsInHour = recentEvents.filter(e => 
        e.timestamp >= hourStart && e.timestamp < hourEnd
      );

      return {
        hour: hourStart.toISOString(),
        count: eventsInHour.length,
        types: eventsInHour.reduce((acc, event) => {
          acc[event.type] = (acc[event.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
    }).reverse(); // Most recent first

    // Security stats
    const stats = {
      total24h: recentEvents.length,
      totalLastHour: lastHourEvents.length,
      rateLimitBlocks: eventsByType.rate_limit || 0,
      botBlocks: eventsByType.bot_blocked || 0,
      shieldBlocks: eventsByType.shield_blocked || 0,
      uniqueIPs: Object.keys(ipCounts).length,
      mostActiveIP: topBlockedIPs[0]?.ip || null,
      mostActiveIPCount: topBlockedIPs[0]?.count || 0
    };

    // Recent events (last 50)
    const recentEventsList = recentEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50)
      .map(event => ({
        timestamp: event.timestamp.toISOString(),
        type: event.type,
        ip: event.ip,
        path: event.path,
        userAgent: event.userAgent?.substring(0, 100) // Truncate long user agents
      }));

    return NextResponse.json({
      success: true,
      data: {
        stats,
        timeline,
        topBlockedIPs,
        topTargetedPaths,
        eventsByType,
        recentEvents: recentEventsList
      },
      generatedAt: now.toISOString()
    });

  } catch (error) {
    console.error('Security monitoring error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch security data' 
    }, { status: 500 });
  }
}

// Endpoint to get real-time security status
export async function POST(request: NextRequest) {
  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { action, ...eventData } = await request.json();

    if (action === 'log_event') {
      // Log a security event
      logSecurityEvent(eventData);
      return NextResponse.json({ success: true, message: 'Event logged' });
    }

    if (action === 'get_live_stats') {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      const recentEvents = securityEvents.filter(e => e.timestamp >= fiveMinutesAgo);
      
      return NextResponse.json({
        success: true,
        data: {
          last5Minutes: recentEvents.length,
          activeThreats: recentEvents.filter(e => 
            e.type === 'rate_limit' || e.type === 'bot_blocked'
          ).length,
          timestamp: now.toISOString()
        }
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Invalid action' 
    }, { status: 400 });

  } catch (error) {
    console.error('Security action error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process request' 
    }, { status: 500 });
  }
}