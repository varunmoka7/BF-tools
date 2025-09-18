import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Cache data in memory for production performance
let companiesCache: any = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // Max requests per window
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Input validation and sanitization
function validateRequest(request: NextRequest): { valid: boolean; error?: string } {
  const userAgent = request.headers.get('user-agent');

  // Basic security checks - relaxed for development
  if (!userAgent) {
    return { valid: false, error: 'Invalid user agent' };
  }
  
  // Check rate limiting
  const clientIP = request.ip || 'unknown';
  const now = Date.now();
  const clientRateLimit = rateLimitMap.get(clientIP);
  
  if (clientRateLimit) {
    if (now > clientRateLimit.resetTime) {
      // Reset rate limit window
      rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    } else if (clientRateLimit.count >= MAX_REQUESTS) {
      return { valid: false, error: 'Rate limit exceeded' };
    } else {
      clientRateLimit.count++;
    }
  } else {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  }
  
  return { valid: true };
}

export async function GET(request: NextRequest) {
  try {
    // Validate request
    const validation = validateRequest(request);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid request' },
        { status: 429 }
      );
    }

    // Check cache first
    const now = Date.now();
    if (companiesCache && (now - lastCacheUpdate) < CACHE_TTL) {
      return NextResponse.json(companiesCache, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
          'X-Cache': 'HIT',
          'X-Cache-Updated': new Date(lastCacheUpdate).toISOString()
        }
      });
    }

    // Read data from file (with security validation)
    const dataPath = path.join(process.cwd(), 'public/companies-with-coordinates.json');
    
    // Security: Validate file path
    if (!dataPath.includes('public/') || dataPath.includes('..')) {
      throw new Error('Invalid file path');
    }
    
    const fileContent = await fs.readFile(dataPath, 'utf8');
    const companies = JSON.parse(fileContent);
    
    // Validate data structure
    if (!Array.isArray(companies)) {
      throw new Error('Invalid data format');
    }
    
    // Update cache
    companiesCache = companies;
    lastCacheUpdate = now;

    // Return with caching headers
    return NextResponse.json(companies, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'X-Cache': 'MISS',
        'X-Cache-Updated': new Date(now).toISOString(),
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
      }
    });
    
  } catch (error) {
    console.error('Error reading companies data:', error);
    
    // Return cached data if available, even if expired
    if (companiesCache) {
      return NextResponse.json(companiesCache, {
        headers: {
          'Cache-Control': 'public, max-age=60',
          'X-Cache': 'STALE',
          'X-Cache-Updated': new Date(lastCacheUpdate).toISOString()
        }
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to load companies data' },
      { status: 500 }
    );
  }
}

// Clean up rate limiting data periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);
