const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas.js');
const { isLoggedIn , storeReturnTo , isAuthor,validateCampground } = require('../middleware.js');
const campgrounds = require('../controllers/campgrounds.js');
const campground = require('../models/campground');

const multer  = require('multer')
const { storage } = require('../cloudinary/index.js');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'),validateCampground, catchAsync(campgrounds.createCampground))
    
router.get('/new',isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get( catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor,upload.array('image') , validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor,catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit',isLoggedIn,isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;