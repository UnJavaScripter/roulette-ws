import crypto from "crypto"
import dotenv from 'dotenv';

dotenv.config();

const AUTH_TOKEN = process.env.AUTH_TOKEN

function getRandomElement(array) {
  const randomIndex = crypto.randomInt(0, array.length);
  return array[randomIndex];
}

function isAuthorized(req, res, next) {
  if (req.headers.authorization !== `Bearer ${AUTH_TOKEN}`) {
    return next(401)
  } else {
    return next()
  }
}

export {getRandomElement, isAuthorized};