import { describe, expect, it } from "vitest";
import { BlockPayError, buildUrl, Transport } from "../src/transport.js";

describe("buildUrl", () => {
  it("joins relative paths with the base url", () => {
    expect(buildUrl("https://example.com", "/api/v1/foo")).toBe(
      "https://example.com/api/v1/foo",
    );
    expect(buildUrl("https://example.com/", "api/v1/foo")).toBe(
      "https://example.com/api/v1/foo",
    );
  });

  it("appends query params and skips undefined values", () => {
    const url = buildUrl("https://example.com", "/foo", {
      a: "1",
      b: undefined,
      c: 0,
      d: false,
    });
    const u = new URL(url);
    expect(u.searchParams.get("a")).toBe("1");
    expect(u.searchParams.has("b")).toBe(false);
    expect(u.searchParams.get("c")).toBe("0");
    expect(u.searchParams.get("d")).toBe("false");
  });
});

describe("Transport", () => {
  it("throws BlockPayError when apiKey is missing", () => {
    expect(() => new Transport({ apiKey: "" })).toThrow(BlockPayError);
  });

  it("normalises a trailing slash in baseUrl", async () => {
    let captured = "";
    const t = new Transport({
      apiKey: "k",
      baseUrl: "https://api.example.com/",
      fetch: (async (input: RequestInfo | URL) => {
        captured = typeof input === "string" ? input : input.toString();
        return new Response("{}", {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }) as typeof fetch,
    });
    await t.request("/ping");
    expect(captured).toBe("https://api.example.com/ping");
  });
});
