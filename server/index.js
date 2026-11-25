import express from "express";
import { pool } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 3001);

app.disable("x-powered-by");

function readPositiveInteger(value, fallback, maximum) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const number = Number(value);

  if (!Number.isSafeInteger(number) || number > maximum) {
    return null;
  }

  return number;
}

app.get("/api/items", async (req, res) => {
  const page = readPositiveInteger(req.query.page, 1, 1_000_000);
  const limit = readPositiveInteger(req.query.limit, 12, 100);

  if (page === null || limit === null) {
    return res.status(400).json({
      error: {
        code: "INVALID_PAGINATION",
        message:
          "Page must be a whole number from 1 to 1000000. Limit must be from 1 to 100.",
      },
    });
  }

  const offset = (page - 1) * limit;

  const countResult = await pool.query(`
    SELECT COUNT(*)::INTEGER AS total
    FROM items
  `);

  const itemsResult = await pool.query(
    `
      SELECT
        i.id,
        i.title,
        i.description,
        c.name AS category,
        ROUND(AVG(r.rating), 1)::DOUBLE PRECISION AS "averageRating",
        COUNT(r.id)::INTEGER AS "reviewCount"
      FROM items i
      JOIN categories c ON c.id = i.category_id
      LEFT JOIN reviews r ON r.item_id = i.id
      GROUP BY i.id, c.name
      ORDER BY i.created_at DESC, i.id DESC
      LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  const total = countResult.rows[0].total;

  res.json({
    items: itemsResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

app.use("/api", (req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "API endpoint not found.",
    },
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    error: {
      code: "SERVER_ERROR",
      message: "Unable to load items right now. Please try again.",
    },
  });
});

try {
  await pool.query("SELECT 1");

  app.listen(port, "127.0.0.1", () => {
    console.log(`ReviewHub API: http://127.0.0.1:${port}`);
  });
} catch (error) {
  console.error("Could not connect to the database:", error.message);
  await pool.end();
  process.exitCode = 1;
}