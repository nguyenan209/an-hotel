import { NextResponse } from "next/server";
import { getRedisClient } from '@/lib/redis';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  if (!email || !token) {
    return NextResponse.json({ valid: false, error: 'Missing email or token' }, { status: 400 });
  }

  const redis = await getRedisClient();
  const redisKey = `register_token:${email}`;
  const storedToken = await redis.get(redisKey);
  
  console.log(storedToken, token);

  if (storedToken && storedToken === token) {
    return NextResponse.json({ valid: true });
  } else {
    return NextResponse.json({ valid: false });
  }
} 