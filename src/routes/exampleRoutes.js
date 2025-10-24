const express = require('express');
const router = express.Router();
const { getExamples, createExample } = require('../controllers/exampleController');
const { validateCreateExample } = require('../middlewares/validationMiddleWare');

router.route('/')
  .get(getExamples)
  .post(validateCreateExample, createExample);

module.exports = router;