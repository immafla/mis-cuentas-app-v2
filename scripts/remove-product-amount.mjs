/**
 * Migración: elimina el campo `amount` de la colección `products`.
 *
 * Uso:
 *   node scripts/remove-product-amount.mjs
 *
 * Requisitos:
 *   - Archivo .env.local en la raíz del proyecto con MONGODB_URI definido
 *   - mongoose instalado (ya está en las dependencias del proyecto)
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

let MONGODB_URI = "";
try {
  const envContent = readFileSync(resolve(root, ".env.local"), "utf8");
  const match = envContent.match(/^MONGODB_URI=(.+)$/m);
  if (match) {
    const candidate = match[1].trim();
    const quoted = /^(["'])(.*)\1$/.exec(candidate);
    MONGODB_URI = quoted ? quoted[2].trim() : candidate;
  }
} catch {
  console.error("❌ No se encontró .env.local en la raíz del proyecto.");
  process.exit(1);
}

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI no está definido en .env.local");
  process.exit(1);
}

console.log("🔗 Conectando a MongoDB...");
await mongoose.connect(MONGODB_URI, { dbName: "MisCuentasApp" });
console.log("✅ Conectado.\n");

const collection = mongoose.connection.collection("products");

const documentsWithAmount = await collection.countDocuments({
  amount: { $exists: true },
});

console.log(`📦 Productos con campo amount: ${documentsWithAmount}`);

if (documentsWithAmount === 0) {
  console.log("✅ Nada que migrar. Ningún documento tiene amount.");
  await mongoose.disconnect();
  process.exit(0);
}

const result = await collection.updateMany(
  { amount: { $exists: true } },
  { $unset: { amount: "" } },
);

console.log("\n✅ Migración completa:");
console.log(`   - Documentos encontrados: ${result.matchedCount}`);
console.log(`   - Documentos actualizados: ${result.modifiedCount}`);

const remaining = await collection.countDocuments({ amount: { $exists: true } });

if (remaining === 0) {
  console.log("✅ Verificación OK: no quedan documentos con amount.");
} else {
  console.warn(`⚠️  Aún quedan ${remaining} documento(s) con amount.`);
}

await mongoose.disconnect();
console.log("\n🔌 Desconectado. ¡Migración finalizada!");
