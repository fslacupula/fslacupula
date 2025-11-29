/**
 * Test de ejemplo - Verificar que Jest funciona correctamente
 */

import { describe, it, expect } from "@jest/globals";

describe("Jest Setup Test", () => {
  it("should pass basic assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("should support async/await", async () => {
    const result = await Promise.resolve("test");
    expect(result).toBe("test");
  });

  it("should have environment variables configured", () => {
    expect(process.env.NODE_ENV).toBe("test");
    expect(process.env.JWT_SECRET).toBeDefined();
  });

  it("should support object matchers", () => {
    const user = {
      id: 1,
      name: "Test User",
      email: "test@test.com",
    };

    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("email", "test@test.com");
    expect(user).toMatchObject({
      name: "Test User",
    });
  });

  it("should support array matchers", () => {
    const items = [1, 2, 3, 4, 5];

    expect(items).toHaveLength(5);
    expect(items).toContain(3);
    expect(items).toEqual(expect.arrayContaining([2, 4]));
  });
});
