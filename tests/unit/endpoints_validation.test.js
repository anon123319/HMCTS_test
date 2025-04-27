const { mockRequest, mockResponse } = require('jest-mock-req-res');
const { validationResult, body, param } = require('express-validator');

describe('createTask Validation Tests', () => {
  const runMiddleware = async (req, middleware) => {
    const res = mockResponse();
    const next = jest.fn();
    await middleware(req, res, next);
    return { req, res, next };
  };

  it('should validate title length (too short)', async () => {
    const req = mockRequest({ body: { title: 'A' } });
    const middleware = body('title')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Title must be between 3 and 100 characters long.');
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(errors.array()[0].msg).toBe(
      'Title must be between 3 and 100 characters long.',
    );
  });

  it('should validate title length (too long)', async () => {
    const req = mockRequest({ body: { title: 'A'.repeat(101) } });
    const middleware = body('title')
      .trim()
      .isLength({ max: 100 })
      .withMessage('Title must be between 3 and 100 characters long.');
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(errors.array()[0].msg).toBe(
      'Title must be between 3 and 100 characters long.',
    );
  });

  it('should validate description length', async () => {
    const req = mockRequest({ body: { description: 'A'.repeat(501) } });
    const middleware = body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be less than 501 characters.');
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(errors.array()[0].msg).toBe(
      'Description must be less than 501 characters.',
    );
  });

  it('should validate status value', async () => {
    const req = mockRequest({ body: { status: 'INVALID' } });
    const middleware = body('status')
      .trim()
      .toUpperCase()
      .isIn(['TODO', 'IN_PROGRESS', 'DONE'])
      .withMessage('Status must be one of TODO, IN_PROGRESS, DONE.');
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(errors.array()[0].msg).toBe(
      'Status must be one of TODO, IN_PROGRESS, DONE.',
    );
  });

  it('should validate due-day', async () => {
    const req = mockRequest({ body: { 'due-day': '32' } });
    const middleware = body('due-day')
      .notEmpty()
      .withMessage('Due day is required.')
      .bail()
      .isInt({ min: 1, max: 31 })
      .withMessage('Due day must be a number between 1 and 31.');
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(errors.array()[0].msg).toBe(
      'Due day must be a number between 1 and 31.',
    );
  });

  it('should validate due-month', async () => {
    const req = mockRequest({ body: { 'due-month': '13' } });
    const middleware = body('due-month')
      .notEmpty()
      .withMessage('Due month is required.')
      .bail()
      .isInt({ min: 1, max: 12 })
      .withMessage('Due month must be a number between 1 and 12.');
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(errors.array()[0].msg).toBe(
      'Due month must be a number between 1 and 12.',
    );
  });

  it('should validate due-year', async () => {
    const req = mockRequest({ body: { 'due-year': '1800' } });
    const middleware = body('due-year')
      .notEmpty()
      .withMessage('Due year is required.')
      .bail()
      .isInt({ min: 1900, max: 2100 })
      .withMessage('Due year must be a number between 2000 and 2100.');
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(errors.array()[0].msg).toBe(
      'Due year must be a number between 2000 and 2100.',
    );
  });

  it('should validate due-hour', async () => {
    const req = mockRequest({ body: { 'due-hour': '25' } });
    const middleware = body('due-hour')
      .notEmpty()
      .withMessage('Due hour is required.')
      .bail()
      .isInt({ min: 0, max: 24 })
      .withMessage('Due hour must be between 0 and 24.');
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(errors.array()[0].msg).toBe('Due hour must be between 0 and 24.');
  });

  it('should validate due-minutes', async () => {
    const req = mockRequest({ body: { 'due-minutes': '61' } });
    const middleware = body('due-minutes')
      .notEmpty()
      .withMessage('Due minutes is required.')
      .bail()
      .isInt({ min: 0, max: 60 })
      .withMessage('Due minutes must be between 0 and 60.');
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(errors.array()[0].msg).toBe('Due minutes must be between 0 and 60.');
  });

  it('should validate due date format', async () => {
    const req = mockRequest({
      body: { 'due-day': '36', 'due-month': '02', 'due-year': '2025' },
    });
    const middleware = body().custom((value, { req }) => {
      const { 'due-day': day, 'due-month': month, 'due-year': year } = req.body;
      const dueDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      if (isNaN(Date.parse(dueDate))) {
        throw new Error('Due date must be a valid date.');
      }
      req.body.due = new Date(dueDate);
      return true;
    });
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(errors.array()[0].msg).toBe('Due date must be a valid date.');
  });
});

describe('deleteTask/getTask Validation Tests', () => {
  const runMiddleware = async (req, middleware) => {
    const res = mockResponse();
    const next = jest.fn();
    await middleware(req, res, next);
    return { req, res, next };
  };

  it('should validate taskId as a positive integer (valid case)', async () => {
    const req = mockRequest({ params: { taskId: '1' } });
    const middleware = param('taskId')
      .isInt({ gt: 0 })
      .withMessage('Task ID must be a positive integer.');
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(true);
  });

  it('should return an error if taskId is not provided', async () => {
    const req = mockRequest({ params: {} });
    const middleware = param('taskId')
      .isInt({ gt: 0 })
      .withMessage('Task ID must be a positive integer.');
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(errors.array()[0].msg).toBe('Task ID must be a positive integer.');
  });

  it('should return an error if taskId is not a number', async () => {
    const req = mockRequest({ params: { taskId: 'abc' } });
    const middleware = param('taskId')
      .isInt({ gt: 0 })
      .withMessage('Task ID must be a positive integer.');
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(errors.array()[0].msg).toBe('Task ID must be a positive integer.');
  });

  it('should return an error if taskId is a negative number', async () => {
    const req = mockRequest({ params: { taskId: '-5' } });
    const middleware = param('taskId')
      .isInt({ gt: 0 })
      .withMessage('Task ID must be a positive integer.');
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(errors.array()[0].msg).toBe('Task ID must be a positive integer.');
  });

  it('should return an error if taskId is zero', async () => {
    const req = mockRequest({ params: { taskId: '0' } });
    const middleware = param('taskId')
      .isInt({ gt: 0 })
      .withMessage('Task ID must be a positive integer.');
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(errors.array()[0].msg).toBe('Task ID must be a positive integer.');
  });
});

describe('updateTask Validation Tests', () => {
  const runMiddleware = async (req, middleware) => {
    const res = mockResponse();
    const next = jest.fn();
    await middleware(req, res, next);
    return { req, res, next };
  };

  it('should validate due-day (invalid case)', async () => {
    const req = mockRequest({ body: { 'due-day': '32' } });
    const middleware = body('due-day')
      .notEmpty()
      .withMessage('Due day is required.')
      .bail()
      .isInt({ min: 1, max: 31 })
      .withMessage('Due day must be a number between 1 and 31.');
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(errors.array()[0].msg).toBe(
      'Due day must be a number between 1 and 31.',
    );
  });

  it('should validate due-month (invalid case)', async () => {
    const req = mockRequest({ body: { 'due-month': '13' } });
    const middleware = body('due-month')
      .notEmpty()
      .withMessage('Due month is required.')
      .bail()
      .isInt({ min: 1, max: 12 })
      .withMessage('Due month must be a number between 1 and 12.');
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(errors.array()[0].msg).toBe(
      'Due month must be a number between 1 and 12.',
    );
  });

  it('should validate due-year (invalid case)', async () => {
    const req = mockRequest({ body: { 'due-year': '1800' } });
    const middleware = body('due-year')
      .notEmpty()
      .withMessage('Due year is required.')
      .bail()
      .isInt({ min: 2000, max: 2100 })
      .withMessage('Due year must be a number between 2000 and 2100.');
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(errors.array()[0].msg).toBe(
      'Due year must be a number between 2000 and 2100.',
    );
  });

  it('should validate due-hour (invalid case)', async () => {
    const req = mockRequest({ body: { 'due-hour': '25' } });
    const middleware = body('due-hour')
      .notEmpty()
      .withMessage('Due hour is required.')
      .bail()
      .isInt({ min: 0, max: 24 })
      .withMessage('Due hour must be between 0 and 24.');
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(errors.array()[0].msg).toBe('Due hour must be between 0 and 24.');
  });

  it('should validate due-minutes (invalid case)', async () => {
    const req = mockRequest({ body: { 'due-minutes': '61' } });
    const middleware = body('due-minutes')
      .notEmpty()
      .withMessage('Due minutes is required.')
      .bail()
      .isInt({ min: 0, max: 60 })
      .withMessage('Due minutes must be between 0 and 60.');
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(errors.array()[0].msg).toBe('Due minutes must be between 0 and 60.');
  });

  it('should validate due date format (invalid case)', async () => {
    const req = mockRequest({
      body: {
        'due-day': '35',
        'due-month': '02',
        'due-year': '2025',
        'due-hour': '10',
        'due-minutes': '30',
      },
    });
    const middleware = body().custom((value, { req }) => {
      const {
        'due-day': day,
        'due-month': month,
        'due-year': year,
        'due-hour': hour,
        'due-minutes': minute,
      } = req.body;
      const dueDate = `${String(year)}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
      if (Number.isNaN(Date.parse(dueDate))) {
        throw new Error('Due date must be a valid date.');
      }
      req.body.due = new Date(dueDate);
      return true;
    });
    await runMiddleware(req, middleware);
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(errors.array()[0].msg).toBe('Due date must be a valid date.');
  });
});
