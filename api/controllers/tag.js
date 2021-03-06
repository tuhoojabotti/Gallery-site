module.exports = function (restify, Tag, Photo, TagReference) {
	var async = require('async');
	var routes = {};

	// List all tags.
	routes.index = function index(req, res) {
		Tag.all(function (err, tags) {
			res.send(err || tags);
		});
	};

	routes.show = function show(req, res, next) {
		Tag.findOne({name: req.params.name}, function (err, tag) {
			if (!tag) { return next(new restify.NotFoundError('Requested photo not found.')); }

			tag.populatePhotos(function (err) {
				res.send(err || tag);
			});
		});
	};

	routes.create = function create(req, res, next) {
		// Create a new TagReference.
		var ref = TagReference.create();

		Photo.findOne({id: req.params.id}, function (err, photo) {
			next.ifError(err);

			ref.setPhoto(photo); // Set the photo.

			Tag.findOrCreate({name: req.params.name}, function (err, tag) {
				next.ifError(err);

				// Save tag to get id for it.
				tag.save(function (err) {
					next.ifError(err);

					ref.setTag(tag); // Set the tag.
					ref.save(res.respondValid); // Persist the reference to the database.
				});
			});
		});
	};

	routes.unlink = function unlink(req, res, next) {
		Tag.findOne({name: req.params.name}, function (err, tag) {
			next.ifError(err);
			if (!tag) { return next(new restify.NotFoundError('Requested tag does not exist.')); }

			TagReference.findOne({photo_id: req.params.id, tag_id: tag.id}, function (err, ref) {
				next.ifError(err);
				if (!ref) { return next(new restify.NotFoundError('Requested tag not found for this image.')); }
				ref.destroy(function (err) {
					res.send(err || 204);
				});
			});

		});
	};

	routes.save = function save(req, res, next) {
		Tag.findOne({id: req.params.id}, function (err, tag) {
			next.ifError(err);
			if (!tag) { return next(new restify.NotFoundError('Requested tag not found.')); }
			tag.name = req.params.name;
			tag.save(res.respondValid);
		});
	}

	routes.destroy = function destroy(req, res, next) {
		Tag.findOne({id: req.params.id}, function (err, tag) {
			next.ifError(err);
			if (!tag) { return next(new restify.NotFoundError('Requested tag not found.')); }
			tag.destroy(function (err) {
				res.send(err || 204);
			});
		});
	}

	return routes;
};