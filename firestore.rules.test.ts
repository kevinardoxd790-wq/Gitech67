import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import fs from "fs";

const RULES = fs.readFileSync("firestore.rules", "utf8");
const VALID_PROOF = "a".repeat(64);
const WRONG_PROOF = "b".repeat(64);

export async function runDirtyDozenChecks() {
  const testEnv = await initializeTestEnvironment({
    projectId: "gotech-sv-rules-test",
    firestore: { rules: RULES },
  });

  try {
    const anon = testEnv.unauthenticatedContext().firestore();

    // 1. Read knas_access denied
    await assertFails(anon.collection("admin_settings").doc("knas_access").get());
    // 2. List admin_settings denied
    await assertFails(anon.collection("admin_settings").get());
    // 3. Read admin_auth_checks denied
    await assertFails(anon.collection("admin_auth_checks").doc("session").get());
    // 4. Write catalog product without atomic proof denied
    await assertFails(
      anon.collection("catalog_products").doc("bluetooth-5-0").set({
        name: "Test",
        description: "Test",
        image: "https://example.com/a.png",
        price: 10,
        published: true,
        updatedAt: new Date(),
      })
    );
    // 5. Write admin_auth_checks with wrong proof denied
    await assertFails(
      anon.collection("admin_auth_checks").doc("session").set({
        proof: WRONG_PROOF,
        updatedAt: new Date(),
      })
    );
    // 6. Shadow field on knas_access denied
    await assertFails(
      anon.collection("admin_settings").doc("knas_access").set({
        verifierHash: VALID_PROOF,
        updatedAt: new Date(),
        extraField: "shadow",
      })
    );
    // 7. Public read of published product allowed
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection("catalog_products").doc("bluetooth-5-0").set({
        name: "Bluetooth",
        description: "Desc",
        image: "https://example.com/a.png",
        price: 9.5,
        published: true,
        updatedAt: new Date(),
      });
    });
    await assertSucceeds(anon.collection("catalog_products").doc("bluetooth-5-0").get());
    // 8. Disallow arbitrary non-URL/non-data-URI image scheme on product writes
    await assertFails(
      anon.collection("catalog_products").doc("bluetooth-5-0").set({
        name: "Bluetooth",
        description: "Desc",
        image: "javascript:alert(1)",
        price: 9.5,
        published: true,
        deleted: false,
        updatedAt: new Date(),
      })
    );
    // 9. Public read of custom product with category/stock allowed when published
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection("catalog_products").doc("audifonos-pro-1").set({
        name: "Audífonos Pro",
        description: "Sonido HD",
        image: "https://example.com/headphones.png",
        price: 14.99,
        category: "Audio",
        stock: 10,
        badge: "🆕 NUEVO",
        isCustom: true,
        published: true,
        deleted: false,
        updatedAt: new Date(),
      });
    });
    await assertSucceeds(anon.collection("catalog_products").doc("audifonos-pro-1").get());
  } finally {
    await testEnv.cleanup();
  }
}
