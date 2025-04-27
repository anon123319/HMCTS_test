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
 *               - due
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "Updated task title"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Updated task description"
 *               status:
 *                 type: string
 *                 enum: ["TODO", "IN_PROGRESS", "DONE"]
 *                 example: "IN_PROGRESS"
 *               due:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-12-31T23:59:59Z"
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *                 due:
 *                   type: string
 *                   format: date-time
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
const router = express.Router();

router.get("/",
  async (req, res, next) => {
    try {
      const formData = req.session.formData || null;
      req.session.formData = null;

      res.status(200).render("create-task.njk", {
        task: formData?.task || {},
        errors: formData ? formData.errors : [],
      });
    } catch (err) {
      res.status(500).json({
        error: 'Internal server error', 
        message: process.env.NODE_ENV === 'test' ? err.message : undefined
      })
      console.error('Failed to get task from database: ', err);
    }
});

module.exports = router;
