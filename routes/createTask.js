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
 *                 description: Task title (3-100 characters)
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Outline the project requirements"
 *                 description: Optional task description (max 500 characters)
 *               status:
 *                 type: string
 *                 enum: [to_do, in_progress, done]
 *                 default: to_do
 *                 example: to_do
 *                 description: Current status of the task
 *               due-day:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 31
 *                 example: 15
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
 *                 example: 14
 *                 description: Hour component of due time (0-23)
 *               due-minutes:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 59
 *                 example: 30
 *                 description: Minutes component of due time (0-59)
 *     responses:
 *       302:
 *         description: Redirects to /tasks on successful creation
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *             example: "/tasks"
 *       400:
 *         description: Invalid request data
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
 *                       location:
 *                         type: string
 *                         example: "body"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to create task in database"
 */

const express = require('express');
const Database = require('../config/db');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.post(
  '/',
  [
    body('title')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Title must be between 3 and 100 characters long.')
      .isLength({ max: 100 })
      .withMessage('Title must be between 3 and 100 characters long.'),

    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be less than 501 characters.'),

    body('status')
      .trim()
      .isIn(['to_do', 'in_progress', 'done'])
      .withMessage('Status must be one of to do, in progress or done.'),

    body('due-day')
      .notEmpty()
      .withMessage('Due day is required.')
      .bail()
      .isInt({ min: 1, max: 31 })
      .withMessage('Due day must be a number between 1 and 31.'),

    body('due-month')
      .notEmpty()
      .withMessage('Due month is required.')
      .bail()
      .isInt({ min: 1, max: 12 })
      .withMessage('Due month must be a number between 1 and 12.'),

    body('due-year')
      .notEmpty()
      .withMessage('Due year is required.')
      .bail()
      .isInt({ min: 1900, max: 2100 })
      .withMessage('Due year must be a number between 2000 and 2100.'),

    body('due-hour')
      .notEmpty()
      .withMessage('Due hour is required.')
      .bail()
      .isInt({ min: 0, max: 24 })
      .withMessage('Due hour must be between 0 and 24.'),

    body('due-minutes')
      .notEmpty()
      .withMessage('Due minutes is required.')
      .bail()
      .isInt({ min: 0, max: 60 })
      .withMessage('Due minutes must be between 0 and 60.'),

    body().custom((value, { req }) => {
      const { 'due-day': day, 'due-month': month, 'due-year': year } = req.body;
      const dueDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      if (Number.isNaN(Date.parse(dueDate))) {
        throw new Error('Due date must be a valid date.');
      }
      req.body.due = new Date(dueDate);
      return true;
    }),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    let monthVal;

    if (Number.isInteger(req.body['due-month'] + 1)) {
      monthVal = req.body['due-month'] + 1;
    } else monthVal = req.body['due-month'];

    if (!errors.isEmpty()) {
      req.session.formData = {
        task: {
          id: req.body.id,
          title: req.body.title,
          description: req.body.description,
          status: req.body.status,
          due: {
            day: req.body['due-day'],
            month: monthVal,
            year: req.body['due-year'],
            hour: req.body['due-hour'],
            minutes: req.body['due-minutes'],
          },
        },
        errors: errors.array(),
      };
      return res.redirect('/createTaskForm');
    }
    const {
      'due-day': day,
      'due-month': month,
      'due-year': year,
      'due-hour': hour,
      'due-minutes': minute,
    } = req.body;

    const dueDate = `${String(year)}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
    const due = new Date(dueDate);
    const data = req.body;
    try {
      const db = new Database();
      const result = await db.addTask(
        data.title,
        data.description,
        data.status,
        due,
      );
      if (result.rowCount > 0) {
        res.redirect('/tasks');
      } else {
        res.status(404).render('not-found.njk');
      }
    } catch (err) {
      res.status(500).render('not-found.njk', {
        title: 'Error',
        message: process.env.NODE_ENV === 'test' ? err.message : undefined,
      });
      console.error('Failed to create task in database: ', err);
    }
  },
);

module.exports = router;
