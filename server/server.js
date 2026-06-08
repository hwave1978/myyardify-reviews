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
  const homeownerId = currentHomeowner ? currentHomeowner.id : 0;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  const contractorSql = `
    SELECT
      contractors.id,
      contractors.name,
      contractors.services,
      contractors.area,
      contractors.likes,
      followed_contractors.id AS followId,
      likes.id AS likeId
    FROM contractors
    LEFT JOIN followed_contractors
      ON contractors.id = followed_contractors.contractor_id
      AND followed_contractors.homeowner_id = ?
    LEFT JOIN likes
      ON contractors.id = likes.contractor_id
      AND likes.homeowner_id = ?
    ORDER BY contractors.id
    LIMIT ? OFFSET ?
  `;

  db.query(contractorSql, [homeownerId, homeownerId, limit, offset], (err, contractorRows) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (contractorRows.length === 0) {
      return res.json([]);
    }

    const contractorIds = contractorRows.map((contractor) => contractor.id);
    const placeholders = contractorIds.map(() => "?").join(",");

    const reviewSql = `
      SELECT
        reviews.id AS reviewId,
        reviews.contractor_id,
        reviews.homeowner_id,
        reviews.stars,
        reviews.price,
        reviews.comment,
        homeowners.name AS homeownerName
      FROM reviews
      LEFT JOIN homeowners
        ON reviews.homeowner_id = homeowners.id
      WHERE reviews.contractor_id IN (${placeholders})
      ORDER BY reviews.id DESC
      LIMIT 50
    `;

    db.query(reviewSql, contractorIds, (reviewErr, reviewRows) => {
      if (reviewErr) {
        return res.status(500).json(reviewErr);
      }

      const contractorsMap = {};

      contractorRows.forEach((row) => {
        contractorsMap[row.id] = {
          id: row.id,
          name: row.name,
          services: row.services,
          area: row.area,
          likes: row.likes,
          isFollowing: row.followId ? true : false,
          isLiked: row.likeId ? true : false,
          reviews: []
        };
      });

      reviewRows.forEach((row) => {
        if (contractorsMap[row.contractor_id]) {
          contractorsMap[row.contractor_id].reviews.push({
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
});

app.post("/contractors/:id/like", (req, res) => {
  if (!currentHomeowner) {
    return res.status(401).json({ error: "Please log in first" });
  }

  const contractorId = req.params.id;
  const homeownerId = currentHomeowner.id;

  const insertLikeSql = `
    INSERT INTO likes (homeowner_id, contractor_id)
    VALUES (?, ?)
  `;

  db.query(insertLikeSql, [homeownerId, contractorId], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "You already liked this contractor" });
      }

      return res.status(500).json(err);
    }

    const updateContractorSql = `
      UPDATE contractors
      SET likes = likes + 1
      WHERE id = ?
    `;

    db.query(updateContractorSql, [contractorId], (updateErr) => {
      if (updateErr) {
        return res.status(500).json(updateErr);
      }

      res.json({ message: "Like added" });
    });
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
    FROM reviews
    JOIN contractors
      ON reviews.contractor_id = contractors.id
    JOIN homeowners
      ON reviews.homeowner_id = homeowners.id
    ORDER BY reviews.id DESC
    LIMIT 100
  `;

  console.time("feed query");

db.query(sql, (err, results) => {
  console.timeEnd("feed query");

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