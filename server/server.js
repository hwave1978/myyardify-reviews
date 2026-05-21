const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let currentHomeowner = null;

app.get("/", (req, res) => {
  res.send("MyYardify Reviews backend with MySQL is running");
});

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  const sql = `
    INSERT INTO homeowners (name, email, password)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Registration failed" });
    }

    currentHomeowner = {
      id: result.insertId,
      name,
      email
    };

    res.json(currentHomeowner);
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM homeowners WHERE email = ? AND password = ?";

  db.query(sql, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid login" });
    }

    const homeowner = results[0];

    currentHomeowner = {
      id: homeowner.id,
      name: homeowner.name,
      email: homeowner.email
    };

    res.json(currentHomeowner);
  });
});

app.get("/homeowner", (req, res) => {
  res.json(currentHomeowner);
});

app.post("/logout", (req, res) => {
  currentHomeowner = null;
  res.json({ message: "Logged out" });
});

app.get("/contractors", (req, res) => {
  const sql = `
    SELECT
      contractors.id,
      contractors.name,
      contractors.services,
      contractors.area,
      contractors.likes,
      reviews.id AS reviewId,
      reviews.homeowner_id,
      reviews.stars,
      reviews.price,
      reviews.comment,
      homeowners.name AS homeownerName,
      followed_contractors.id AS followId
    FROM contractors
    LEFT JOIN reviews
      ON contractors.id = reviews.contractor_id
    LEFT JOIN homeowners
      ON reviews.homeowner_id = homeowners.id
    LEFT JOIN followed_contractors
      ON contractors.id = followed_contractors.contractor_id
      AND followed_contractors.homeowner_id = ?
  `;

  const homeownerId = currentHomeowner ? currentHomeowner.id : 0;

  db.query(sql, [homeownerId], (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }

    const contractorsMap = {};

    results.forEach((row) => {
      if (!contractorsMap[row.id]) {
        contractorsMap[row.id] = {
          id: row.id,
          name: row.name,
          services: row.services,
          area: row.area,
          likes: row.likes,
          isFollowing: row.followId ? true : false,
          reviews: []
        };
      }

      if (row.reviewId) {
        contractorsMap[row.id].reviews.push({
          id: row.reviewId,
          homeownerId: row.homeowner_id,
          name: row.homeownerName,
          stars: row.stars,
          price: row.price,
          comment: row.comment
        });
      }
    });

    res.json(Object.values(contractorsMap));
  });
});

app.post("/contractors/:id/like", (req, res) => {
  const contractorId = req.params.id;

  const sql = `
    UPDATE contractors
    SET likes = likes + 1
    WHERE id = ?
  `;

  db.query(sql, [contractorId], (err) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json({ message: "Like added" });
  });
});

app.post("/contractors/:id/follow", (req, res) => {
  if (!currentHomeowner) {
    return res.status(401).json({ error: "Please log in first" });
  }

  const contractorId = req.params.id;

  const sql = `
    INSERT INTO followed_contractors (homeowner_id, contractor_id)
    SELECT ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM followed_contractors
      WHERE homeowner_id = ?
      AND contractor_id = ?
    )
  `;

  db.query(
    sql,
    [currentHomeowner.id, contractorId, currentHomeowner.id, contractorId],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({ message: "Contractor followed" });
    }
  );
});

app.post("/contractors/:id/unfollow", (req, res) => {
  if (!currentHomeowner) {
    return res.status(401).json({ error: "Please log in first" });
  }

  const contractorId = req.params.id;

  const sql = `
    DELETE FROM followed_contractors
    WHERE homeowner_id = ?
    AND contractor_id = ?
  `;

  db.query(sql, [currentHomeowner.id, contractorId], (err) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json({ message: "Contractor unfollowed" });
  });
});

app.get("/feed", (req, res) => {
  if (!currentHomeowner) {
    return res.status(401).json({ error: "Please log in first" });
  }

  const sql = `
    SELECT
      contractors.name AS contractorName,
      contractors.services,
      contractors.area,
      reviews.id AS reviewId,
      reviews.stars,
      reviews.price,
      reviews.comment,
      homeowners.name AS homeownerName
    FROM followed_contractors
    JOIN contractors
      ON followed_contractors.contractor_id = contractors.id
    JOIN reviews
      ON contractors.id = reviews.contractor_id
    JOIN homeowners
      ON reviews.homeowner_id = homeowners.id
    WHERE followed_contractors.homeowner_id = ?
    ORDER BY reviews.id DESC
  `;

  db.query(sql, [currentHomeowner.id], (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(results);
  });
});

app.post("/contractors/:id/review", (req, res) => {
  if (!currentHomeowner) {
    return res.status(401).json({ error: "Please log in first" });
  }

  const contractorId = req.params.id;
  const { stars, price, comment } = req.body;

  const sql = `
    INSERT INTO reviews
    (
      homeowner_id,
      contractor_id,
      stars,
      price,
      comment
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [currentHomeowner.id, contractorId, stars, price, comment],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({ message: "Review added" });
    }
  );
});

app.put("/contractors/:id/review/:reviewId", (req, res) => {
  if (!currentHomeowner) {
    return res.status(401).json({ error: "Please log in first" });
  }

  const reviewId = req.params.reviewId;
  const { stars, price, comment } = req.body;

  const sql = `
    UPDATE reviews
    SET
      stars = ?,
      price = ?,
      comment = ?
    WHERE id = ?
    AND homeowner_id = ?
  `;

  db.query(
    sql,
    [stars, price, comment, reviewId, currentHomeowner.id],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({ message: "Review updated" });
    }
  );
});

app.listen(PORT, () => {
  console.log(`MyYardify Reviews backend running on http://localhost:${PORT}`);
});