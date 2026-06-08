const db = require("./db");

const comments = [
  "Great work and easy to communicate with.",
  "Showed up on time and cleaned everything up.",
  "The yard looks much better than before.",
  "Fair price and solid quality.",
  "Very professional and reliable.",
  "Helped us get the yard ready for summer.",
  "Good communication and fast service.",
  "I would hire them again.",
  "The crew was friendly and respectful.",
  "Work was completed as expected."
];

const totalReviews = 10000;

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let inserted = 0;

for (let i = 0; i < totalReviews; i++) {
  const homeownerId = 1;
  const contractorId = 1;
  const stars = randomNumber(1, 5);
  const price = "$".repeat(randomNumber(1, 4));
  const comment = comments[randomNumber(0, comments.length - 1)];

  const sql = `
    INSERT INTO reviews (homeowner_id, contractor_id, stars, price, comment)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [homeownerId, contractorId, stars, price, comment], (err) => {
    if (err) {
      console.log("Insert failed:", err.message);
      return;
    }

    inserted++;

    if (inserted === totalReviews) {
      console.log(`Inserted ${totalReviews} fake reviews.`);
      db.end();
    }
  });
}