import { Redis } from '@upstash/redis'
import dotenv from 'dotenv';
dotenv.config();


const redis = new Redis({
 url: process.env.REDIS_URL ,
})


redisClient.on('error', (err) => console.error('❌ Redis Error:', err));
await redisClient.connect();


export default redisClient;




