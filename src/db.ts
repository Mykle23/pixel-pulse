import { resolve } from "node:path";
import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { env } from "./config/env.js";

const raw = env.databaseUrl;

// Strip the "file:" prefix so we can resolve relative paths from project root
const relative = raw.replace(/^file:/, "");
const absolute = resolve(relative);

const adapter = new PrismaLibSql({ url: `file:${absolute}` });

export const prisma = new PrismaClient({ adapter });
