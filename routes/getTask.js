/**
 * @swagger
 * /tasks/{taskId}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         description: Numeric ID of the task to retrieve
 *     responses:
 *       200:
 *         description: Task retrieved successfully (renders HTML view)
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
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const db = new Database();
      const result = await db.getTask(req.params.taskId);
      if (result.rowCount > 0) {
        res.status(200).render('task.njk', {
          task: {
            id: result.rows[0].id,
            title: result.rows[0].title,
            description: result.rows[0].description,
            status: result.rows[0].status,
            due: new Date(result.rows[0].due).toLocaleString('en-GB', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }),
          },
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
