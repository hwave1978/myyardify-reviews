const {
  isValidStarRating,
  isValidPriceRating,
} = require("./reviewUtils");

test("accepts a valid 5-star rating", () => {
  expect(isValidStarRating(5)).toBe(true);
});

test("rejects an invalid 10-star rating", () => {
  expect(isValidStarRating(10)).toBe(false);
});

test("accepts a valid price rating", () => {
  expect(isValidPriceRating(3)).toBe(true);
});

test("rejects an invalid price rating", () => {
  expect(isValidPriceRating(10)).toBe(false);
});