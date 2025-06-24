# My Express App

This is a simple Express application built with TypeScript. It serves as a starting point for building web applications using the Express framework.

## Features

- TypeScript support
- Basic routing setup
- Middleware integration

## Project Structure

```
my-express-app
├── src
│   ├── app.ts               # Entry point of the application
│   ├── controllers          # Contains controller files
│   │   └── index.ts         # Index controller
│   ├── routes               # Contains route files
│   │   └── index.ts         # Route setup
│   └── types                # Contains type definitions
│       └── index.ts         # Type definitions for Request and Response
├── package.json             # NPM package configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

## Installation

To install the dependencies, run:

```
npm install
```

## Running the Application

To start the application, use the following command:

```
npm start
```

## License

This project is licensed under the MIT License.

## Railway Deployment

### Steps to Deploy on Railway
1. Push your code to GitHub.
2. Go to [Railway](https://railway.app/) and create a new project.
3. Link your GitHub repository to Railway.
4. Add the Redis plugin from the Railway dashboard.
5. Railway will automatically inject the `REDIS_URL` and `PORT` environment variables.
6. Set the start command to `npm start` (already set in your `package.json`).
7. Deploy!

### Notes
- No Dockerfile or docker-compose.yml is needed for Railway.
- For local development, use the `.env` file.
- Make sure `.env` is in your `.gitignore`.