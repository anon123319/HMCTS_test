/**
 * @swagger
 * /tasks/{taskId}:
 *   get:
 *     summary: Get task details for editing
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
 *         description: Task data retrieved successfully (renders edit form)
 *       400:
 *         description: Invalid task ID
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
 *                       location:
 *                         type: string
 *                         example: "params"
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
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
        res.status(404).render('not-found.njk');
      }
    } catch (err) {
      res.status(500).render('not-found.njk', {
        title: 'Error',
        message: process.env.NODE_ENV === 'test' ? err.message : undefined,
      });
      console.error('Failed to get task from database: ', err);
    }
  },
);

module.exports = router;
