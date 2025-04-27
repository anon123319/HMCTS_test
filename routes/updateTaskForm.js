/**
 * @swagger
 * /tasks/{taskId}:
 *   get:
 *     summary: Get task details for editing
 *     description: Retrieves task details to populate an edit form. Includes validation errors if present in session.
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         description: Numeric ID of the task to edit
 *     responses:
 *       200:
 *         description: Task data retrieved successfully (renders edit-task.njk template)
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *             description: Rendered edit form with task data and any validation errors
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: Clears formData session after rendering
 *       400:
 *         description: Invalid task ID format
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
 *                         example: "Task ID must be a positive integer"
 *                       param:
 *                         type: string
 *                         example: "taskId"
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

const express = require('express');
const { param, validationResult } = require('express-validator');
const Database = require('../config/db');

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  [
    param('taskId')
      .isInt({ gt: 0 })
      .withMessage('Task ID must be a positive integer.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let dueError;
    errors.array().forEach((err) => {
      if (err.param === 'due') {
        dueError = err.msg;
      }
    });
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const formData = req.session.formData || null;
      req.session.formData = null;
      const db = new Database();
      const result = await db.getTask(req.params.taskId);
      if (result.rowCount > 0) {
        const taskData = formData
          ? formData.task
          : {
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
          };

        res.status(200).render('edit-task.njk', {
          task: taskData,
          errors: formData ? formData.errors : [],
        });
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    } catch (err) {
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'test' ? err.message : undefined,
      });
      console.error('Failed to get task from database: ', err);
    }
  },
);

module.exports = router;
