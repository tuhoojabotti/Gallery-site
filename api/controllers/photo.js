module.exports = function (restify, Photo) {
	var async = require('async');
	var routes = {};

	// List all photos.
	routes.index = function index(req, res) {
		Photo.all(function (err, photos) {
			//photos.reverse();
			if (err) { return next(err); }
			// Calculate rating for each photo.
			async.map(photos, function (photo, done) {
				photo.averageRating(function (err, rating) {
					photo.rating = rating || 0;
					done(err, photo);
				});
			}, function (err, result) {
				res.send(err || result);
			});
			//res.send(err || photos);
		});
	};

	// Get a single image by id.
	routes.show = function show(req, res, next) {
		// TODO: validate id as Number.
		Photo.findOne({id: req.params.id}, function (err, photo) {
			if (!photo) { return next(new restify.NotFoundError('Requested photo not found.')); }
			// Populate rating.
			photo.averageRating(function (err, rating) {
				photo.rating = rating;
				res.send(photo);
			});
		});
	};

	routes.destroy = function destroy(req, res, next) {
		Photo.findOne({id: req.params.id}, function (err, photo) {
			if (!photo) { return next(new restify.NotFoundError('Requested photo not found.')); }
			photo.destroy(function (err) {
				res.send(err || 204);
			});
		});
	}

	routes.create = function create(req, res, next) {
		var data = {
			path: req.params.url,
			name: req.params.name,
			description: req.params.description,
			width: req.params.width,
			height: req.params.height,
			folder_id: 1
		};

		photo = Photo.create(data);
		photo.save(function (err) {
			res.send(err || 204);
		});
	}

	routes.save = function save(req, res, next) {
		Photo.findOne({id: req.params.id}, function (err, photo) {
			if (!photo) { return next(new restify.NotFoundError('Requested photo not found.')); }
			console.log(photo, req.params);
			photo.name = req.params.name;
			photo.description = req.params.description;
			photo.save(function (err) {
				res.send(err || 204);
			});
		});
	}

	return routes;
};