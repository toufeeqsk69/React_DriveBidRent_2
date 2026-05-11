import morgan from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DB_OPTIMIZED } from "../app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDirectory = path.join(__dirname, "..", "logs");

if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory, { recursive: true });
}

function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getAccessLogPath() {
    return path.join(logsDirectory, `access-${getTodayString()}.log`);
}

function getErrorLogPath() {
    return path.join(logsDirectory, `error.log`);
}


morgan.token("username", (req) => {
    return req.user
        ? req.user.firstName || req.user.email || "anonymous"
        : "guest";
});

morgan.token("usertype", (req) => {
    return req.user ? req.user.role || req.user.userType || "none" : "none";
});

morgan.token("userid", (req) => {
    return req.user ? req.user._id?.toString() || req.user.id?.toString() || "-" : "-";
});

morgan.token("body", (req) => {
    if (
        req.originalUrl.includes("login") ||
        req.originalUrl.includes("register") ||
        req.originalUrl.includes("password") ||
        req.originalUrl.includes("forgot") ||
        req.originalUrl.includes("reset")
    ) {
        return "[REDACTED]";
    }

    try {
        return req.body && Object.keys(req.body).length > 0
            ? JSON.stringify(req.body)
            : "-";
    } catch {
        return "-";
    }
});

morgan.token("ip", (req) => {
    return (
        req.ip ||
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        "-"
    );
});

// Custom token: DB optimization status
morgan.token("db_optimized", () => DB_OPTIMIZED);

// Access log format — shows response time + DB optimization flag
morgan.format(
    "detailed",
    ":date[iso]  :method  :url  :status  :response-time ms  │  db=:db_optimized  user=:username  type=:usertype  id=:userid  ip=:ip"
);

function createWriteStream(logPath) {
    return {
        write: (message) => {
            fs.appendFile(logPath, message, (err) => {
                if (err) {
                    console.error("Failed to write to log file:", err);
                }
            });
        }
    };
}

const accessFileStream = createWriteStream(getAccessLogPath());
const errorFileStream = createWriteStream(getErrorLogPath());

// NOTE: No `immediate: true` — logs AFTER the response so :response-time is populated
export const accessLogger = morgan("detailed", {
    stream: accessFileStream
});

export const errorLogger = morgan("detailed", {
    skip: (req, res) => res.statusCode < 400,
    stream: errorFileStream
});

export const devLogger = morgan("dev", {
    // Skip all routes — logs go to access log files only, keeping console clean for Redis logs
    skip: () => true,
});

export const logger = (req, res, next) => {
    accessLogger(req, res, (err) => {
        if (err) return next(err);
        errorLogger(req, res, next);
    });
};