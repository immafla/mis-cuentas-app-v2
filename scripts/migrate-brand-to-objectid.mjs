/**
 * Migración: convierte el campo `brand` en la colección `products`
 * de string (ID como texto) a ObjectId.
 *
 * Uso:
 *   node scripts/migrate-brand-to-objectid.mjs
 *
 * Requisitos:
 *   - Archivo .env.local en la raíz del proyecto con MONGODB_URI definido
 *   - mongoose instalado (ya está en las dependencias del proyecto)
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// ── Leer MONGODB_URI desde .env.local ─────────────────────────────────────────
let MONGODB_URI = "";
try {
  const envContent = readFileSync(resolve(root, ".env.local"), "utf8");
  const match = envContent.match(/^MONGODB_URI=(.+)$/m);
  if (match) MONGODB_URI = match[1].trim().replace(/^["']|["']$/g, "");
} catch {
  console.error("❌ No se encontró .env.local en la raíz del proyecto.");
  process.exit(1);
}

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI no está definido en .env.local");
  process.exit(1);
}

// ── Conectar ───────────────────────────────────────────────────────────────────
console.log("🔗 Conectando a MongoDB...");
await mongoose.connect(MONGODB_URI, { dbName: "MisCuentasApp" });
console.log("✅ Conectado.\n");

const collection = mongoose.connection.collection("products");

// ── 1. Contar productos con brand como string ─────────────────────────────────
const totalString = await collection.countDocuments({
  $expr: { $eq: [{ $type: "$brand" }, "string"] },
});

console.log(`📦 Productos con brand como string: ${totalString}`);

if (totalString === 0) {
  console.log("✅ Nada que migrar. Todos los brands ya son ObjectId.");
  await mongoose.disconnect();
  process.exit(0);
}

// ── 2. Previsualizar algunos documentos antes de migrar ───────────────────────
const samples = await collection
  .find({ $expr: { $eq: [{ $type: "$brand" }, "string"] } })
  .limit(3)
  .project({ name: 1, brand: 1 })
  .toArray();

console.log("\n🔍 Muestra de documentos a migrar:");
samples.forEach((p) =>
  console.log(`   - "${p.name}"  brand actual: "${p.brand}"  (${typeof p.brand})`),
);

// ── 3. Filtrar solo los que tienen un string válido como ObjectId ──────────────
// (evita error si algún brand fuera un texto libre no convertible)
const validDocs = await collection
  .find({ $expr: { $eq: [{ $type: "$brand" }, "string"] } })
  .project({ _id: 1, brand: 1 })
  .toArray();

const validIds = validDocs
  .map((d) => d._id)
  .filter((_, i) => mongoose.Types.ObjectId.isValid(validDocs[i].brand));

const invalidCount = validDocs.length - validIds.length;
if (invalidCount > 0) {
  console.warn(
    `\n⚠️  ${invalidCount} producto(s) tienen un brand string que NO es un ObjectId válido.`,
  );
  console.warn("   Esos documentos NO serán migrados. Revísalos manualmente.");
}

if (validIds.length === 0) {
  console.log("✅ No hay documents válidos para migrar.");
  await mongoose.disconnect();
  process.exit(0);
}

// ── 4. Ejecutar la migración con pipeline de agregación ───────────────────────
console.log(`\n🚀 Migrando ${validIds.length} producto(s)...`);

const result = await collection.updateMany({ _id: { $in: validIds } }, [
  {
    $set: {
      brand: { $toObjectId: "$brand" },
    },
  },
]);

console.log(`\n✅ Migración completa:`);
console.log(`   - Documentos encontrados: ${result.matchedCount}`);
console.log(`   - Documentos actualizados: ${result.modifiedCount}`);

// ── 5. Verificación post-migración ────────────────────────────────────────────
const stillString = await collection.countDocuments({
  _id: { $in: validIds },
  $expr: { $eq: [{ $type: "$brand" }, "string"] },
});

if (stillString === 0) {
  console.log("✅ Verificación OK: ningún producto migrado tiene brand como string.");
} else {
  console.warn(
    `⚠️  ${stillString} producto(s) aún tienen brand como string después de la migración.`,
  );
}

await mongoose.disconnect();
console.log("\n🔌 Desconectado. ¡Migración finalizada!");
