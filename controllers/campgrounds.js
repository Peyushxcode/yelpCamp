const Campground = require('../models/campground');
const cloudinary = require('cloudinary').v2;
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds: campgrounds });
    // console.log('Sending response...');
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
    // console.log('Sending response...');
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Succesfully made a new campground !')
    res.redirect(`/campgrounds/${campground._id}`)
    // console.log('Sending response...');
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author',
        }
    }).populate('author');
    // console.log(campground);
    if (!campground) {
        req.flash('error', 'Cannot find that campground !');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
    // console.log('Sending response...');
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground !');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
    // console.log('Sending response...');
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true, runValidators: true });
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
campground.geometry = geoData.features[0].geometry;
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...images);
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
       await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    await campground.save();
    req.flash('success', 'Succesfully updated a campground !')
    res.redirect(`/campgrounds/${campground._id}`)
    // console.log('Sending response...');
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Succesfully deleted a campground !')
    res.redirect('/campgrounds')
    // console.log('Sending response...');
}