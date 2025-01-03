const ExpressError = require('./utils/ExpressError.js');
const { campgroundSchema } = require('./schemas.js');
const Campground = require('./models/campground');
const Review = require('./models/review')
const { reviewSchema } = require('./schemas.js');

const isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        //eg since req.path = /new if we goto new campground
        //but the original path we need is in req.originalUrl i.e, /campgrounds/new
        req.session.returnTo = req.originalUrl;
        req.flash('error','You must be signed in !');
        return res.redirect('/login');
    }
    next(); 
}

const storeReturnTo = (req,res,next) => {
    if(req.session.returnTo){
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}
const validateCampground = (req,res,next) => {
    
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',') ;
        next( new ExpressError(msg, 400));
    } else{
        next();
    }
}

const isAuthor = async(req,res,next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to edit this campground !');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

const isReviewAuthor = async(req,res,next) => {
    const {id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to delete this review!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

const validateReview = (req,res,next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',') ;
        next( new ExpressError(msg, 400));
    }else{
        next();
    }
}


module.exports ={ isLoggedIn , storeReturnTo ,validateCampground,isAuthor, validateReview, isReviewAuthor} ;

