const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task API",
      version: "1.0.0",
      description: "API for managing tasks",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

module.exports = options;
