BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username VARCHAR(30) NOT NULL
    CHECK (username ~ '^[A-Za-z0-9_]{3,30}$'),
  email VARCHAR(254) NOT NULL
    CHECK (email = LOWER(BTRIM(email))),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique
  ON users (LOWER(username));

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique
  ON users (LOWER(email));

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(40) NOT NULL
    CHECK (
      name = BTRIM(name)
      AND CHAR_LENGTH(name) > 0
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS categories_name_unique
  ON categories (LOWER(name));

CREATE TABLE IF NOT EXISTS items (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_by INTEGER NOT NULL
    REFERENCES users(id) ON DELETE RESTRICT,
  category_id INTEGER NOT NULL
    REFERENCES categories(id) ON DELETE RESTRICT,
  title VARCHAR(120) NOT NULL
    CHECK (
      title = BTRIM(title)
      AND CHAR_LENGTH(title) > 0
    ),
  description VARCHAR(2000) NOT NULL
    CHECK (
      description = BTRIM(description)
      AND CHAR_LENGTH(description) BETWEEN 10 AND 2000
    ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS items_category_title_unique
  ON items (category_id, LOWER(title));

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL
    REFERENCES users(id) ON DELETE RESTRICT,
  item_id INTEGER NOT NULL
    REFERENCES items(id) ON DELETE RESTRICT,
  rating SMALLINT NOT NULL
    CHECK (rating BETWEEN 1 AND 5),
  body TEXT NOT NULL
    CHECK (
      body = BTRIM(body)
      AND CHAR_LENGTH(body) BETWEEN 10 AND 2000
    ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, item_id)
);

CREATE INDEX IF NOT EXISTS reviews_item_id_index
  ON reviews (item_id);

INSERT INTO users (username, email, password_hash)
VALUES
  ('alex', 'alex@example.com', '!login-disabled'),
  ('sam', 'sam@example.com', '!login-disabled')
ON CONFLICT DO NOTHING;

INSERT INTO categories (name)
VALUES
  ('Movies'),
  ('Books'),
  ('Products'),
  ('Places')
ON CONFLICT DO NOTHING;

INSERT INTO items (created_by, category_id, title, description)
SELECT u.id, c.id, sample.title, sample.description
FROM (
  VALUES
    (
      'Movies',
      'Interstellar',
      'A science fiction film about space exploration, family, and time.'
    ),
    (
      'Books',
      'The Hobbit',
      'A fantasy adventure following Bilbo Baggins on an unexpected journey.'
    ),
    (
      'Products',
      'Sony WH-1000XM5',
      'Wireless over-ear headphones with active noise cancellation.'
    ),
    (
      'Places',
      'Central Park',
      'A public park in Manhattan with walking paths and open green spaces.'
    )
) AS sample(category, title, description)
JOIN categories c ON c.name = sample.category
JOIN users u ON u.username = 'alex'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (user_id, item_id, rating, body)
SELECT u.id, i.id, sample.rating, sample.body
FROM (
  VALUES
    (
      'alex',
      'Movies',
      'Interstellar',
      5,
      'An engaging story with memorable visuals and music.'
    ),
    (
      'sam',
      'Movies',
      'Interstellar',
      4,
      'Enjoyed the space exploration and emotional story.'
    ),
    (
      'alex',
      'Books',
      'The Hobbit',
      5,
      'A fun adventure with memorable characters throughout.'
    ),
    (
      'sam',
      'Books',
      'The Hobbit',
      5,
      'An enjoyable fantasy book that I would read again.'
    ),
    (
      'alex',
      'Products',
      'Sony WH-1000XM5',
      4,
      'Comfortable headphones with useful noise cancellation.'
    )
) AS sample(username, category, title, rating, body)
JOIN users u ON u.username = sample.username
JOIN categories c ON c.name = sample.category
JOIN items i
  ON i.title = sample.title
  AND i.category_id = c.id
ON CONFLICT DO NOTHING;

COMMIT;