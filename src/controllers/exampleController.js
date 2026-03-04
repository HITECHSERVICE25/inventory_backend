const Example = require('../models/Example');
const logger  = require('../utils/logger');

// @desc    Get all examples
// @route   GET /api/v1/examples
exports.getExamples = async (req, res, next) => {
  try {
    logger.info('Fetching all examples', {
      method: req.method,
      url: req.originalUrl,
      query: req.query
    });

    const examples = await Example.find();
    
    logger.debug('Successfully fetched examples', {
      count: examples.length,
      executionTime: `${Date.now() - req.startTime}ms`
    });

    res.status(200).json({
      success: true,
      count: examples.length,
      data: examples
    });

  } catch (err) {
    logger.error('Error fetching examples', {
      error: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl
    });
    next(err);
  }
};

// @desc    Create example
// @route   POST /api/v1/examples
exports.createExample = async (req, res, next) => {
  try {
    logger.info('Creating new example', {
      method: req.method,
      url: req.originalUrl,
      body: process.env.NODE_ENV === 'development' ? req.body : '***REDACTED***'
    });

    const example = await Example.create(req.body);
    
    logger.debug('Example created successfully', {
      exampleId: example._id,
      executionTime: `${Date.now() - req.startTime}ms`
    });

    res.status(201).json({
      success: true,
      data: example
    });

  } catch (err) {
    logger.error('Error creating example', {
      error: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
      validationErrors: err.errors ? Object.keys(err.errors) : null
    });
    next(err);
  }
};