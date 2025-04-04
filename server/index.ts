import 'dotenv/config'; // Load environment variables from .env file
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const findFreePort = async (startPort: number): Promise<number> => {
    const { createServer } = await import('net');
    
    return new Promise((resolve) => {
      const server = createServer();
      server.on('error', () => {
        resolve(findFreePort(startPort + 1));
      });
      
      server.listen(startPort, '127.0.0.1', () => {
        server.close(() => {
          resolve(startPort);
        });
      });
    });
  };

  const tryPort = async (port: number): Promise<number> => {
    try {
      await new Promise((resolve, reject) => {
        server.listen({
          port,
          host: "0.0.0.0",
          reusePort: true,
        }, () => resolve(null)).on('error', reject);
      });
      return port;
    } catch (err) {
      if (port < 5010) {
        return tryPort(port + 1);
      }
      throw err;
    }
  };

  try {
    const port = await tryPort(5000);
    log(`serving on port ${port}`);
    
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.warn("\x1b[33m%s\x1b[0m", "WARNING: Gemini API key is not configured!");
      console.warn("\x1b[33m%s\x1b[0m", "AI features will not work properly.");
      console.warn("\x1b[33m%s\x1b[0m", "Please set the GEMINI_API_KEY in .env file.");
      console.warn("\x1b[33m%s\x1b[0m", "Visit: https://makersuite.google.com/app/apikey to get your API key.");
    } else {
      console.log("\x1b[32m%s\x1b[0m", "Gemini API key is configured. AI features should work properly.");
    }
  } catch (err) {
    // If port 5000 is in use, find the next available port up to 5010
    const freePort = await findFreePort(5001);
    const port = await tryPort(freePort);
    log(`Port 5000 was in use. Now serving on port ${port}`);
    
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.warn("\x1b[33m%s\x1b[0m", "WARNING: Gemini API key is not configured!");
      console.warn("\x1b[33m%s\x1b[0m", "AI features will not work properly.");
      console.warn("\x1b[33m%s\x1b[0m", "Please set the GEMINI_API_KEY in .env file.");
      console.warn("\x1b[33m%s\x1b[0m", "Visit: https://makersuite.google.com/app/apikey to get your API key.");
    } else {
      console.log("\x1b[32m%s\x1b[0m", "Gemini API key is configured. AI features should work properly.");
    }
  }
})();
