/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - status
 *               - due-day
 *               - due-month
 *               - due-year
 *               - due-hour
 *               - due-minutes
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "Project outline"
 *                 description: Task title (3-100 chars)
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Outline the project"
 *                 description: Optional task description (max 500 chars)
 *               status:
 *                 type: string
 *                 enum: ["TODO", "IN_PROGRESS", "DONE"]
 *                 example: "TODO"
 *                 description: Task status
 *               "due-day":
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 31
 *                 example: 15
 *                 description: Day of due date (1-31)
 *               "due-month":
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *                 example: 12
 *                 description: Month of due date (1-12)
 *               "due-year":
 *                 type: integer
 *                 minimum: 1900
 *                 maximum: 2100
 *                 example: 2023
 *                 description: Year of due date (1900-2100)
 *               "due-hour":
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 24
 *                 example: 23
 *                 description: Hour of due time (0-24)
 *               "due-minutes":
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 60
 *                 example: 59
 *                 description: Minutes of due time (0-60)
 *     responses:
 *       302:
 *         description: Redirects to /tasks on success
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Title must be between 3 and 100 characters long."
 *                       param:
 *                         type: string
 *                         example: "title"
 *       500:
 *         description: Internal server error
 */

const express = require("express");
const Database = require("../config/db");
const {body, validationResult} = require("express-validator");
const router = express.Router();

router.post("/", 
  [
    body("title")
    .trim()
    .isLength({ min: 3})
    .withMessage("Title must be between 3 and 100 characters long.")
    .isLength({ max: 100 })
    .withMessage("Title must be between 3 and 100 characters long."),
    
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must be less than 501 characters."),

    body("status")
      .trim()
      .toUpperCase()
      .isIn(["TODO", "IN_PROGRESS", "DONE"])
      .withMessage("Status must be one of TODO, IN_PROGRESS, DONE."),

      body("due-day")
      .notEmpty()
      .withMessage("Due day is required.")
      .bail()
      .isInt({ min: 1, max: 31 })
      .withMessage("Due day must be a number between 1 and 31."),

    body("due-month")
      .notEmpty()
      .withMessage("Due month is required.")
      .bail()
      .isInt({ min: 1, max: 12 })
      .withMessage("Due month must be a number between 1 and 12."),

    body("due-year")
      .notEmpty()
      .withMessage("Due year is required.")
      .bail()
      .isInt({ min: 1900, max: 2100 })
      .withMessage("Due year must be a number between 2000 and 2100."),

    body("due-hour")
      .notEmpty()
      .withMessage("Due hour is required.")
      .bail()
      .isInt({ min: 0, max: 24 })
      .withMessage("Due hour must be between 0 and 24."),

    body("due-minutes")
      .notEmpty()
      .withMessage("Due minutes is required.")
      .bail()
      .isInt({ min: 0, max: 60 })
      .withMessage("Due minutes must be between 0 and 60."),

    body()
      .custom((value, { req }) => {
        const { "due-day": day, "due-month": month, "due-year": year } = req.body;
        const dueDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        if (isNaN(Date.parse(dueDate))) {
          throw new Error("Due date must be a valid date.");
        }
        req.body.due = new Date(dueDate);
        return true;
      }),
  ],
  
  async (req, res, next) => {
    const errors = validationResult(req);
    let monthVal;

    if (Number.isInteger((req.body["due-month"]) + 1)) {
      monthVal = req.body["due-month"] + 1;
    } else monthVal = req.body["due-month"];

    if (!errors.isEmpty()) {
      req.session.formData = {
        task: {
          id: req.body.id,
          title: req.body.title,
          description: req.body.description,
          status: req.body.status,
          due: {
            day: req.body["due-day"],
            month: monthVal,
            year: req.body["due-year"],
            hour: req.body["due-hour"],
            minutes: req.body["due-minutes"],
          },
        },
        errors: errors.array(),
      };
      return res.redirect(`/createTaskForm`);
    }

    const data = req.body;
    try {
      let db = new Database();
      let result = await db.addTask(
        data.title,
        data.description, 
        data.status, 
        data.due
      );
      if (result.rowCount > 0) {
        res.redirect('/tasks');
      } else {
        res.status(404).json({error: 'Task not created'});
      }
    } catch (err) {
      res.status(500).json({
        error: 'Internal server error', 
        message: process.env.NODE_ENV === 'test' ? err.message : undefined
      })
      console.error('Failed to create task in database: ', err);
    }
  }
);

module.exports = router;