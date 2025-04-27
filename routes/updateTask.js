/**
 * @swagger
 * /tasks/{taskId}:
 *   put:
 *     summary: Update a task by ID
 *     description: Updates an existing task with the given ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         description: Numeric ID of the task to update
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
 *                 example: "Updated project"
 *                 description: Task title (3-100 chars)
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Updated project description"
 *                 description: Optional task description (max 500 chars)
 *               status:
 *                 type: string
 *                 enum: ["TODO", "IN_PROGRESS", "DONE"]
 *                 example: "IN_PROGRESS"
 *                 description: Task status
 *               due-day:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 31
 *                 example: 15
 *                 description: Day of due date (1-31)
 *               due-month:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *                 example: 12
 *                 description: Month of due date (1-12)
 *               due-year:
 *                 type: integer
 *                 minimum: 2000
 *                 maximum: 2100
 *                 example: 2023
 *                 description: Year of due date (2000-2100)
 *               due-hour:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 24
 *                 example: 14
 *                 description: Hour of due time (0-24)
 *               due-minutes:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 60
 *                 example: 30
 *                 description: Minutes of due time (0-60)
 *     responses:
 *       302:
 *         description: Redirects to /tasks on success or to update form on validation error
 *       400:
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
 *                         example: "Title must be between 3 and 100 characters"
 *                       param:
 *                         type: string
 *                         example: "title"
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Task not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 *                 message:
 *                   type: string
 *                   example: "Detailed error (visible in test environment)"
 */

const express = require("express");
const Database = require("../config/db");
const { body, param, validationResult } = require("express-validator");
const router = express.Router({ mergeParams: true });

router.put(["/", ""],
  [
    param("taskId")
      .isInt({ gt: 0 })
      .withMessage("Task ID must be a positive integer."),

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
      .isInt({ min: 2000, max: 2100 })
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
        const { "due-day": day, "due-month": month, "due-year": year, "due-hour": hour, "due-minutes": minute } = req.body;
        const dueDate = `${String(year)}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
        if (isNaN(Date.parse(dueDate))) {
          throw new Error("Due date must be a valid date.");
        }
        req.body.due = new Date(dueDate);
        return true;
      }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let db = new Database();
      let result = await db.getTask(req.params.taskId);
      
      req.session.formData = {
        task: {
          id: result.rows[0].id,
          title: result.rows[0].title,
          description: result.rows[0].description,
          status: result.rows[0].status,
          due: {
            day: result.rows[0].due.getDate(),
            month: result.rows[0].due.getMonth() + 1,
            year: result.rows[0].due.getFullYear(),
            hour: result.rows[0].due.getHours(),
            minute: result.rows[0].due.getMinutes(),
          },
        },
        errors: errors.array(),
      };
      return res.redirect(`/updateTaskForm/${req.params.taskId}`);
    }

    const { "due-day": day, "due-month": month, "due-year": year, "due-hour": hour, "due-minutes": minute } = req.body;
    const dueDate = `${String(year)}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
    const date = new Date(dueDate);
    const data = req.body;
    try {
      let db = new Database();
      let result = await db.updateTask(
        req.params.taskId,
        data.title,
        data.description, 
        data.status, 
        date,
      );
      if (result.rowCount > 0) {
        res.status(200).redirect("/tasks");
      } else {
        res.status(404).json({error: 'Task not found'});
      }
    } catch (err) {
      res.status(500).json({
        error: 'Internal server error', 
        message: process.env.NODE_ENV === 'test' ? err.message : undefined
      })
      console.error('Failed to get task from database: ', err);
    }
});

module.exports = router;
