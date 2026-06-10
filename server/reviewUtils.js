function isValidStarRating(stars) {
  return Number.isInteger(stars) && stars >= 1 && stars <= 5;
}

function isValidPriceRating(price) {
  return Number.isInteger(price) && price >= 1 && price <= 4;
}

module.exports = { isValidStarRating, isValidPriceRating };