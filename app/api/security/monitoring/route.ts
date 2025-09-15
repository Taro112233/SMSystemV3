// app/api/security/monitoring/route.ts - FIXED NEXT.JS ROUTE HANDLER EXPORTS
import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import arcjet, { shield } from "@arcjet/next";
import { 
  logSecurityEvent,
  getSecurityEvents,
  getSecurityEventsInRange,
  getSecurityStats,
  type SecurityEvent
} from '@/lib/security-logger';

// Basic protection for monitoring endpoint
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [shield({ mode: "LIVE" })],
});

interface SecurityStats {
  total24h: number;
  totalLastHour: number;
  rateLimitBlocks: number;
  botBlocks: number;
  shieldBlocks: number;
  uniqueIPs: number;
  mostActiveIP: string | null;
  mostActiveIPCount: number;
}

interface TimelineEntry {
  hour: string;
  count: number;
  types: Record<string, number>;
}

interface TopItem {
  ip?: string;
  path?: string;
  count: number;
}

interface SecurityData {
  stats: SecurityStats;
  timeline: TimelineEntry[];
  topBlockedIPs: TopItem[];
  topTargetedPaths: TopItem[];
  eventsByType: Record<string, number>;
  recentEvents: Array<{
    timestamp: string;
    type: string;
    ip: string;
    path: string;
    userAgent?: string;
  }>;
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

    // Get events from utility
    const allEvents = getSecurityEvents();
    const recentEvents = allEvents.filter(e => e.timestamp >= oneDayAgo);
    const lastHourEvents = allEvents.filter(e => e.timestamp >= oneHourAgo);

    // Get comprehensive stats
    const statsData = getSecurityStats({ start: oneDayAgo, end: now });

    // Recent events timeline (last 24 hours, grouped by hour)
    const timeline: TimelineEntry[] = Array.from({ length: 24 }, (_, i) => {
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
    const stats: SecurityStats = {
      total24h: recentEvents.length,
      totalLastHour: lastHourEvents.length,
      rateLimitBlocks: statsData.eventsByType.rate_limit || 0,
      botBlocks: statsData.eventsByType.bot_blocked || 0,
      shieldBlocks: statsData.eventsByType.shield_blocked || 0,
      uniqueIPs: statsData.uniqueIPs,
      mostActiveIP: statsData.topIPs[0]?.ip || null,
      mostActiveIPCount: statsData.topIPs[0]?.count || 0
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

    const responseData: SecurityData = {
      stats,
      timeline,
      topBlockedIPs: statsData.topIPs,
      topTargetedPaths: statsData.topPaths,
      eventsByType: statsData.eventsByType,
      recentEvents: recentEventsList
    };

    return NextResponse.json({
      success: true,
      data: responseData,
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

// Define interfaces for POST request body
interface LogEventAction {
  action: 'log_event';
  type: SecurityEvent['type'];
  ip: string;
  path: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

interface GetLiveStatsAction {
  action: 'get_live_stats';
}

type SecurityAction = LogEventAction | GetLiveStatsAction;

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

    const body: SecurityAction = await request.json();

    if (body.action === 'log_event') {
      // Log a security event - extract only the fields we need
      const eventData = {
        type: body.type,
        ip: body.ip,
        path: body.path,
        userAgent: body.userAgent,
        details: body.details
      };
      logSecurityEvent(eventData);
      return NextResponse.json({ success: true, message: 'Event logged' });
    }

    if (body.action === 'get_live_stats') {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      const recentEvents = getSecurityEventsInRange(fiveMinutesAgo, now);
      
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