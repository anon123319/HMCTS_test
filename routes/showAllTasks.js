/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: List of tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   title:
 *                     type: string
 *                     example: "Complete project"
 *                   description:
 *                     type: string
 *                     example: "Finish all remaining tasks"
 *                   status:
 *                     type: string
 *                     enum: [to_do, in_progress, done]
 *                     example: in_progress
 *                   due:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-12-31T23:59:59Z"
 *       404:
 *         description: No tasks found
 *       500:
 *         description: Internal server error
 */

const express = require('express');
const Database = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = new Database();
    const result = await db.getAllTasks();
    res.status(200).render('tasks.njk', { tasks: result.rows || [] });
  } catch (err) {
    res.status(500).render('not-found.njk', {
      title: 'Error',
      message: process.env.NODE_ENV === 'test' ? err.message : undefined,
    });
    console.error('Failed to get all tasks from database: ', err);
  }
});

module.exports = router;
