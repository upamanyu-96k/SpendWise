import { assertEnv, env } from './config/env.js';
import { connectDb } from './config/db.js';
import app from './app.js';

assertEnv();
await connectDb();
app.listen(env.port, () => console.log(`SpendWise API listening on http://localhost:${env.port}`));
