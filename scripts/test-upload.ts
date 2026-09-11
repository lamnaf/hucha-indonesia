import { config } from "dotenv";
import { storeUploadedImage } from "../src/domain/media/upload-image";

// Load environment variables from .env
config();

async function test() {
  // 1x1 transparent PNG base64
  const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const buffer = Buffer.from(base64Png, "base64");
  const file = new File([buffer], "test.png", { type: "image/png" });

  console.log("Testing upload...");
  const res = await storeUploadedImage(file);
  console.log("Result:", res);
}

test().catch(console.error);