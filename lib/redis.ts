import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: process.env.NEXT_PUBLIC_REDIS_PASSWORD,
    socket: {
        host: process.env.NEXT_PUBLIC_REDIS_HOST || '',
        port: parseInt(process.env.NEXT_PUBLIC_REDIS_PORT || '0')
    }
});

let isConnected = false;

export async function getRedisClient() {
    if (!isConnected) {
        await client.connect();
        isConnected = true;
    }
    return client;
}

export default client; 