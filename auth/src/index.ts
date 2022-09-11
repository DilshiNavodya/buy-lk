import { readFileSync } from 'fs';
import https from 'https';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './routes/routes';
import HttpException from './models/http-exception.model';

const fileUpload = require('express-fileupload');

const app = express();

/**
 * App Configuration
 */

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(routes);

app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'Buy LK auth API is running on /api' });
});

/* eslint-disable */
app.use(
  (
    err: Error | HttpException,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // @ts-ignore
    if (err && err.name === 'UnauthorizedError') {
      return res.status(401).json({
        status: 'error',
        message: 'missing authorization credentials',
      });
      // @ts-ignore
    } else if (err && err.errorCode) {
      // @ts-ignore
      res.status(err.errorCode).json(err.message);
      console.error(err);
    } else if (err) {
      res.status(500).json(err.message);
      console.error(err);
    }
  }
);

/**
 * Server activation
 */

const PORT = process.env.PORT || 8181;

if (process.env.ENVIRONMENT === 'PRODUCTION') {
  const privateKey = readFileSync(process.env.CERT_PATH + '/privkey.pem');
  const certificate = readFileSync(process.env.CERT_PATH + '/fullchain.pem');

  https
    .createServer(
      {
        key: privateKey,
        cert: certificate,
      },
      app
    )
    .listen(PORT, () => {
      console.info(`server up on port ${PORT}`);
    });
} else {
  app.listen(PORT, () => {
    console.info(`server up on port ${PORT}`);
  });
}
