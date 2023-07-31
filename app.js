"use strict";

const express = require("express");
const cors = require("cors");

const { categories, categoryDetail } = require("./constants");
const { BadRequestError, NotFoundError } = require("./expressError");

const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(morgan("tiny"));

/** GET /api/categories
 *
 * Returns [ {id, title, clues_count}, ... ]
 *
 * Optional query param of "count"; defaults to 5 if omitted.
 *
*/
app.get("/api/categories", function (req, res, next) {
  const numOfCategories = req.query.count || 5;
  return res.json(categories.slice(0, numOfCategories));
});


/** GET /api/category?id=[categoryId]
 *
 * Returns { id, title, clues: [ clue, ...] }
 *  where each "clue" object contains { id, answer, question, ...}
 *
 * Required query param of category id, throws error if not provided.
 *
*/
app.get("/api/category", function (req, res, next) {
  const categoryId = req.query.id;
  if (categoryId === undefined) {
    throw new BadRequestError("Must pass in a query string parameter of id");
  }
  if (categoryDetail[categoryId] === undefined) {
    throw new BadRequestError("Invalid category id");
  }
  return res.json(categoryDetail[categoryId]);
});


/** Handle 404 errors; this matches everything. */
app.use(function (req, res, next) {
  throw new NotFoundError();
});


/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;