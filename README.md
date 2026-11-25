# ReviewHub

## Overview
ReviewHub helps people explore movies, books, products, and places through community reviews.

**Problem:** Reviews are spread across different platforms, making items difficult to compare.

**Goal:** Provide one place to browse items, check ratings, and eventually share reviews.

The first completed feature is the Browse Items page.

## Core Features
- Browse items by viewing their titles, categories, and descriptions.
- See average ratings and review counts.
- Navigate between pages.
- View the catalog on desktop and mobile.
- Handle loading, errors, and items without reviews.

Registration, login, and review submission are planned features.

## Tech Stack
- **Frontend:** JavaScript, React, CSS, Vite
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Tools:** npm, pgAdmin

## folder structure

```text
reviewhub/
├── src/                
├── server/
│   ├── db.js           
│   ├── database.sql     
│   ├── setup.js         
│   └── index.js         
├── package.json         
└── vite.config.js      
