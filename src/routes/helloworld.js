/**
 * helloworld.js: Handle base routes for application
 */

const joi = require('joi');
const logger = require('../utils/logger');
const errors = require('../utils/errors');

// Schema for Route HTTP Request Input
const helloSchema = joi.object().keys({
  name: joi.string().required().max(256).error(new Error('name is required and must be less than 256 characters')),
});

module.exports = {
  getHello: (req, res, next) => {
    // Exit early for lambda warm requests. IP always provided on requests through API Gateway
    if (!req.ip) {
      return res.send();
    }

    // Check HTTP Input matches expectations
    const { error } = joi.validate(req.query, helloSchema, { abortEarly: false });
    if (error) {
      return errors.sendInvalidArgsResponse(res, error.message);
    }

    // Logic for constructing hello message
    const { name } = req.query;
    logger.debug(`Parsed name: ${name} from query params`, null, req);
    const helloMsg = `Hello ${name}!`;

    // Construct HTTP Response
    return res.json({ message: helloMsg });
  },
};
