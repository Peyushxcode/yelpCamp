const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
const cities = require('./cities');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log("Mongo open connection !")
    }).catch(e => {
        console.log("Error in connection", e);
    })

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 200) + 10;
        const camp = new Campground({
            //your user id
            author: '675d00839ad2c84ee1e29ba2',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dbkx46l2t/image/upload/v1734178245/YelpCamp/fej9tynssl6sdl6hn9td.jpg',
                  filename: 'YelpCamp/fej9tynssl6sdl6hn9td'
                },
                {
                    url: 'https://res.cloudinary.com/dbkx46l2t/image/upload/v1734178246/YelpCamp/ehpciov6ag2xfmafz4yc.png',
                  filename: 'YelpCamp/ehpciov6ag2xfmafz4yc'
                }
            ],
            description: '  Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere in amet laudantium eos, dolor saepe possimus facilis eveniet reiciendis est accusantium porro hic, magni unde voluptatibus impedit? Quo, ab fugit.',
            price,
            geometry:{
                type:"Point",
                coordinates:[
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ] 
            }
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})