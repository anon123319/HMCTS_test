/**
 * @swagger
 * /tasks/{taskId}:
 *   delete:
 *     summary: Delete a task by ID
 *     description: Deletes an existing task with the given ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         description: Numeric ID of the task to delete
 *     responses:
 *       302:
 *         description: Redirects to /tasks on successful deletion
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
 *                         example: "Task ID must be a positive integer"
 *                       param:
 *                         type: string
 *                         example: "taskId"
 *       404:
 *         description: Task not found or not deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Task not deleted"
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
const { param, validationResult } = require("express-validator");
const router = express.Router({ mergeParams: true });

router.delete("/", 
  [
    param("taskId")
      .isInt({ gt: 0 })
      .withMessage("Task ID must be a positive integer."),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try {
    let db = new Database();
    let result = await db.deleteTask(
      req.params.taskId,
    );
    if (result.rowCount === 1) {
      res.status(200).redirect("/tasks");
    } else {
      res.status(404).json({error: 'Task not deleted'});
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
