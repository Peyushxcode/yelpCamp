const sanitizeHtml = require('sanitize-html');
const BaseJoi = require('joi');

// if(!req.body.campground) throw new ExpressError('Invalid Campground Data' , 400);
    //above line of code can work but...it gets a bit clunky..
    //like if(!req.body.capmground.price)....
    //if(!req.body.campground.description)....
    //so we use Joi to validate the data

const extension = (Joi) => ({
    type: 'string',
    base: Joi.string(),
    messages:{
        'string.escapeHTML':'{{#label}} must not include HTML tags !',
    },
    rules:{
        escapeHTML:{
            validate(value,helpers){
                const cleanValue = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {}
                });
                if(cleanValue !== value) return helpers.error('string.escapeHTML',{ value })
                    return cleanValue;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price:Joi.number().required().min(0),
        location:Joi.string().required().escapeHTML(),
        description:Joi.string().required().escapeHTML(),
        // image:Joi.string().required()
        
    }).required(),
    deleteImages:Joi.array()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating:Joi.number().required().min(1).max(5),
        body:Joi.string().required().escapeHTML()
    }).required()
})