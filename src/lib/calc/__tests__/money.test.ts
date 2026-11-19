import { describe, expect, it } from "vitest";
import { formatMoney, parseNumber, roundMoney, smallestCentSatisfying, subMoney, sumMoney } from "../money";

describe("roundMoney", () => {
  it("rounds half away from zero without float drift", () => {
    expect(roundMoney(1.005)).toBe(1.01);
    expect(roundMoney(2.675)).toBe(2.68);
    expect(roundMoney(0.285)).toBe(0.29);
    expect(roundMoney(-1.005)).toBe(-1.01);
    expect(roundMoney(10)).toBe(10);
  });
  it("returns NaN for non-finite input", () => {
    expect(roundMoney(Infinity)).toBeNaN();
  });
});

describe("sumMoney / subMoney", () => {
  it("adds and subtracts in whole cents", () => {
    expect(sumMoney(0.1, 0.2)).toBe(0.3);
    expect(subMoney(30, 3.3)).toBe(26.7);
    expect(subMoney(1, 0.9)).toBe(0.1);
  });
});

describe("parseNumber", () => {
  it("treats blank as null and junk as NaN", () => {
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("   ")).toBeNull();
    expect(parseNumber("abc")).toBeNaN();
    expect(parseNumber("1.2.3")).toBeNaN();
  });
  it("accepts thousands separators and decimals", () => {
    expect(parseNumber("1,250.50")).toBe(1250.5);
    expect(parseNumber(".5")).toBe(0.5);
    expect(parseNumber("0")).toBe(0);
    expect(parseNumber("-3")).toBe(-3);
  });
});

describe("formatMoney", () => {
  it("formats per currency and avoids negative zero", () => {
    expect(formatMoney(1234.5, "USD")).toBe("$1,234.50");
    expect(formatMoney(1234.5, "GBP")).toBe("£1,234.50");
    expect(formatMoney(-0, "USD")).toBe("$0.00");
  });
});

describe("smallestCentSatisfying", () => {
  it("finds the first cent where a monotone predicate turns true", () => {
    expect(smallestCentSatisfying((x) => x >= 12.34, 0, 100)).toBe(12.34);
    expect(smallestCentSatisfying((x) => x * 3 >= 10, 0, 100)).toBe(3.34);
    expect(smallestCentSatisfying(() => false, 0, 10)).toBeNull();
  });
});
