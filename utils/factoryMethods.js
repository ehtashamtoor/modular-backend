const AppError = require("../utils/appError");

exports.createOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

exports.getOne = (Model, popOptions) => async (req, res, next) => {
  try {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      // Use the custom AppError
      return next(new AppError("Document not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("Document not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("Document not found", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAll = (Model) => async (req, res, next) => {
  try {
    const queryObj = { ...req.query };
    console.log("queryObj", queryObj);

    const excludedFields = ["page", "sort", "limit", "fields"];

    excludedFields.forEach((ele) => delete queryObj[ele]);

    // console.log("excludedFields", excludedFields);

    // Advanced filtering (gte, gt, lte, lt etc)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // console.log("queryStr", queryStr);

    let query = Model.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      console.log("req.query.sort", req.query.sort);
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Field limiting (optional)
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // Adding Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    const docs = await query;

    res.status(200).json({
      status: "success",
      results: docs.length,
      data: docs,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllAgg =
  (Model, aggregationPipeline = []) =>
  async (req, res, next) => {
    try {
      const docs = await Model.aggregate(aggregationPipeline);
      res.status(200).json({
        status: "success",
        results: docs.length,
        data: docs,
      });
    } catch (error) {
      next(error);
    }
  };

exports.singularCreateAndUpdate =
  (Model, criteria, data) => async (req, res, next) => {
    try {
      const doc = await Model.findOneAndUpdate(criteria, data, {
        new: true,
        upsert: true, // Creates doc if not found
        runValidators: true,
        setDefaultsOnInsert: true,
      });

      res.status(200).json({
        status: "success",
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  };
