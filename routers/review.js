const express = require('express');
const router = express.Router({ mergeParams: true });
//The { mergeParams: true } option in express.Router is only required if you need to access route parameters from the parent router in your child or nested router.
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { reviewSchema } = require('../schemas.js');
const Review = require('../models/review')
const { validateReview,isLoggedIn, isReviewAuthor } = require('../middleware.js');
const reviews = require('../controllers/reviews.js');

router.post('/',isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId',isLoggedIn,isReviewAuthor ,catchAsync(reviews.deleteReview));

module.exports = router;