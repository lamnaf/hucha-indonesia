import { createServer } from "node:http";
import next from "next";

// Load environment variables from .env if present (cPanel can also set these
// directly via the Node.js App interface — both approaches work).
import "dotenv/config";

const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOSTNAME || "0.0.0.0";
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, hostname, () => {
    console.log(`> HuCha Indonesia ready on http://${hostname}:${port}`);
  });
});
