//Code to prepare express app

import path from 'path';
import bodyParser from 'body-parser';
import express from 'express';
import dotenv from 'dotenv';
import router from './routes/primer.js'; //import app's routes
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();

const PORT = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticDir = path.join(__dirname, "public");


app.use(bodyParser.json());
app.use("/", router);
app.use("/public", express.static(staticDir));

app.listen(PORT);
console.log(`Please open a web browser at http://localhost:${PORT}`);