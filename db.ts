import { Database } from "bun:sqlite";

export const db = new Database("./linkdb.sqlite", { create: true });
