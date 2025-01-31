const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req,res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path: "reviews", populate:{path: "author"}});
    if(!listing) {
        req.flash("error", "The Listing that you're trying to access doesnot exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
};

module.exports.createListings = async(req,res,next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      }).send()


    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing has been created!");
    res.redirect("/listings");
};

module.exports.editForm = async(req,res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "The Listing that you're trying to access doesnot exist!");
        res.redirect("/listings");
    }
    let orgImg = listing.image.url;
    orgImg = orgImg.replace("/upload", "/upload/h_300");
    res.render("listings/edit.ejs", {listing, orgImg});
};


module.exports.updateListing = async(req,res) => {
    let {id} = req.params;
    let listing =  await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }

    req.flash("success", "Listing has been updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destoryListing = async(req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("deleted", "Lisitng has been deleted!");
    res.redirect("/listings");
}
