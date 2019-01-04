import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export const ENVIRONMENT = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 3000;
