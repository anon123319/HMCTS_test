const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const nunjucks = require('nunjucks');
const methodOverride = require('method-override');

const dotenv = require('dotenv');

dotenv.config();

const session = require('express-session');

const app = express();
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  }),
);

const createRouter = require('./routes/createTask');
const getTaskRouter = require('./routes/getTask');
const showAllTasksRouter = require('./routes/showAllTasks');
const updateTaskRouter = require('./routes/updateTask');
const deleteTaskRouter = require('./routes/deleteTask');
const updateTaskFormRouter = require('./routes/updateTaskForm');
const createTaskFormRouter = require('./routes/createTaskForm');
const swaggerOptions = require('./config/swagger');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  methodOverride((req) => {
    if (req.body && typeof req.body === 'object') {
      return req.body._method;
    }
    return null;
  }),
);

const specs = swaggerJsdoc(swaggerOptions);

nunjucks.configure(['node_modules/govuk-frontend/dist', './views'], {
  autoescape: true,
  express: app,
});

app.use(helmet());
app.use(cors());

if (process.env.NODE_ENV === 'dev') {
  app.use(morgan('dev'));
} else if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('tiny'));
}

app.use(cookieParser());
app.use(express.static('public'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/createTask', createRouter);
app.use('/createTaskForm', createTaskFormRouter);
app.use('/updateTaskForm/:taskId', updateTaskFormRouter);
app.use('/updateTask/:taskId', updateTaskRouter);
app.use('/deleteTask/:taskId', deleteTaskRouter);
app.use('/getTask/:taskId', getTaskRouter);
app.use('/tasks', showAllTasksRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500).render('not-found.njk', {
    title: 'Error',
    message: err.message,
  });
});

module.exports = app;
