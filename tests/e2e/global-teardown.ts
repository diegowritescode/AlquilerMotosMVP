import { cleanupE2EData } from "./helpers/cleanup";

/** Runs once after the whole suite — removes E2E-created rows (guarded). */
export default async function globalTeardown() {
  try {
    const result = await cleanupE2EData();
    if (!result.ran) {
      console.log(`[cleanup] Omitido: ${result.reason}`);
      return;
    }
    console.log("[cleanup] Registros E2E eliminados:", result.deleted);
  } catch (err) {
    console.error("[cleanup] Error:", err);
  }
}
