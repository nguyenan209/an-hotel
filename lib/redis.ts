import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: 'kasrLt3A3WFIBNEhKJrRPQ7qA7cLjRFR',
    socket: {
        host: 'redis-19888.crce185.ap-seast-1-1.ec2.redns.redis-cloud.com',
        port: 19888
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