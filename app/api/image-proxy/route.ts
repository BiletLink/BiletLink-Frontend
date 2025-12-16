import { NextRequest, NextResponse } from 'next/server';

// Simple 1x1 transparent PNG as placeholder
const PLACEHOLDER_PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
);

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return new NextResponse(PLACEHOLDER_PNG, {
            headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
        });
    }

    try {
        // Only allow biletix.com images
        const url = new URL(imageUrl);
        if (!url.hostname.includes('biletix.com')) {
            return new NextResponse(PLACEHOLDER_PNG, {
                headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
            });
        }

        // Add timeout with AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(imageUrl, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.biletix.com/',
                'Accept': 'image/*,*/*;q=0.8',
            },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return new NextResponse(PLACEHOLDER_PNG, {
                headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
            });
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400', // Cache for 1 day
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        // Return placeholder on any error (timeout, network, etc.)
        return new NextResponse(PLACEHOLDER_PNG, {
            headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
        });
    }
}
