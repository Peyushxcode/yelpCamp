const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;
const User = require('./user');

//https://res.cloudinary.com/dbkx46l2t/image/upload/w_200/v1734311302/YelpCamp/mudyuday2a83gmbmqaz7.png

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: {
        type: String
    },
    images: [ImageSchema],
    price: {
        type: Number
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    geometry: {
        type: {
            type: String, // "Point" for GeoJSON
            enum: ['Point'], // Restrict to "Point" type
            required: true
        },
        coordinates: {
            type: [Number], // Array of numbers [longitude, latitude]
            required: true
        }
    }
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this.id}">${this.title}</a><strong>
    <p>${this.description.substring(0,20)}...</p>`
})

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})


module.exports = mongoose.model('Campground', CampgroundSchema);