/**
 * @swagger
 * /tasks/{taskId}:
 *   put:
 *     summary: Update a task by ID
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
 *                 example: "Updated project outline"
 *                 description: Task title (3-100 characters)
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Updated project requirements"
 *                 description: Optional task description (max 500 characters)
 *               status:
 *                 type: string
 *                 enum: [to_do, in_progress, done]
 *                 example: in_progress
 *                 description: Updated task status
 *               due-day:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 31
 *                 example: 20
 *                 description: Day component of due date (1-31)
 *               due-month:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *                 example: 12
 *                 description: Month component of due date (1-12)
 *               due-year:
 *                 type: integer
 *                 minimum: 1900
 *                 maximum: 2100
 *                 example: 2023
 *                 description: Year component of due date (1900-2100)
 *               due-hour:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 23
 *                 example: 15
 *                 description: Hour component of due time (0-23)
 *               due-minutes:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 59
 *                 example: 45
 *                 description: Minutes component of due time (0-59)
 *     responses:
 *       302:
 *         description: Redirects to /tasks on successful update
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *             example: "/tasks"
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
 *                         example: "Title must be between 3 and 100 characters long."
 *                       param:
 *                         type: string
 *                         example: "title"
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */

const express = require("express");
const Database = require("../config/db");
const { body, param, validationResult } = require("express-validator");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const formData = req.session.formData || null;
    req.session.formData = null;

    res.status(200).render("create-task.njk", {
      task: formData?.task || {},
      errors: formData ? formData.errors : [],
    });
  } catch (err) {
    res.status(500).render('not-found.njk', {
      title: 'Error',
      message: process.env.NODE_ENV === 'test' ? err.message : undefined,
    });
    console.error("Failed to get task from database: ", err);
  }
});

module.exports = router;
