const { describe, it, expect, beforeEach } = require("@jest/globals"); // Optional: for strict environments
const AppError = require("../utils/appError");
const {
  createOne,
  getOne,
  updateOne,
  deleteOne,
  getAll,
  getAllAgg,
  singularCreateAndUpdate,
} = require("../utils/factoryMethods");

describe("Factory Methods", () => {
  let fakeModel, req, res, next;

  beforeEach(() => {
    // Reset the fake model and mocks before each test
    fakeModel = {};
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  // ---------- createOne ------------
  describe("createOne", () => {
    beforeEach(() => {
      req.body = {
        name: "Test User",
        email: "test@example.com",
        password: "password",
      };
      fakeModel.create = jest.fn();
    });

    it("should create a document and send a 201 response", async () => {
      const fakeDoc = { _id: "123", ...req.body };
      fakeModel.create.mockResolvedValue(fakeDoc);

      const middleware = createOne(fakeModel);
      await middleware(req, res, next);

      expect(fakeModel.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: fakeDoc,
      });
    });

    it("should call next with an error if create fails", async () => {
      const error = new Error("Test Error");
      fakeModel.create.mockRejectedValue(error);

      const middleware = createOne(fakeModel);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ---------- getOne ------------
  describe("getOne", () => {
    beforeEach(() => {
      req.params = { id: "123" };
      // For getOne, fakeModel.findById will be our mocked method.
      fakeModel.findById = jest.fn();
    });

    it("should return a document when found", async () => {
      const fakeDoc = { _id: "123", name: "Test User" };
      fakeModel.findById.mockResolvedValue(fakeDoc);

      const middleware = getOne(fakeModel);
      await middleware(req, res, next);

      expect(fakeModel.findById).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: fakeDoc,
      });
    });

    it("should call next with AppError when document is not found", async () => {
      fakeModel.findById.mockResolvedValue(null);

      const middleware = getOne(fakeModel);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      // Check that the error is an instance of AppError with 404 status
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
    });

    it("should call next with an error if findById fails", async () => {
      const error = new Error("Find Error");
      fakeModel.findById.mockRejectedValue(error);

      const middleware = getOne(fakeModel);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ---------- updateOne ------------
  describe("updateOne", () => {
    beforeEach(() => {
      req.params = { id: "123" };
      req.body = { name: "Updated Name" };
      fakeModel.findByIdAndUpdate = jest.fn();
    });

    it("should update a document and return a 200 response", async () => {
      const fakeDoc = { _id: "123", name: "Updated Name" };
      fakeModel.findByIdAndUpdate.mockResolvedValue(fakeDoc);

      const middleware = updateOne(fakeModel);
      await middleware(req, res, next);

      expect(fakeModel.findByIdAndUpdate).toHaveBeenCalledWith(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: fakeDoc,
      });
    });

    it("should call next with AppError if document not found", async () => {
      fakeModel.findByIdAndUpdate.mockResolvedValue(null);

      const middleware = updateOne(fakeModel);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
    });

    it("should call next with an error if update fails", async () => {
      const error = new Error("Update Error");
      fakeModel.findByIdAndUpdate.mockRejectedValue(error);

      const middleware = updateOne(fakeModel);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ---------- deleteOne ------------
  describe("deleteOne", () => {
    beforeEach(() => {
      req.params = { id: "123" };
      fakeModel.findByIdAndDelete = jest.fn();
    });

    it("should delete a document and send a 204 response", async () => {
      const fakeDoc = { _id: "123" };
      fakeModel.findByIdAndDelete.mockResolvedValue(fakeDoc);

      const middleware = deleteOne(fakeModel);
      await middleware(req, res, next);

      expect(fakeModel.findByIdAndDelete).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: null,
      });
    });

    it("should call next with AppError if document not found", async () => {
      fakeModel.findByIdAndDelete.mockResolvedValue(null);

      const middleware = deleteOne(fakeModel);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
    });

    it("should call next with an error if delete fails", async () => {
      const error = new Error("Delete Error");
      fakeModel.findByIdAndDelete.mockRejectedValue(error);

      const middleware = deleteOne(fakeModel);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ---------- getAll ------------
  describe("getAll", () => {
    beforeEach(() => {
      // Simulate query parameters if needed
      req.query = {
        sort: "name",
        page: "1",
        limit: "2",
      };

      // Create a fake chainable query
      const fakeDocs = [{ _id: "1" }, { _id: "2" }];
      const fakeQuery = {
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        // Define then as a function that takes resolve and reject, and immediately resolves
        then: (resolve, reject) => resolve(fakeDocs),
      };

      fakeModel.find = jest.fn(() => fakeQuery);
    });

    it("should return all documents with proper pagination, sorting, and filtering", async () => {
      const middleware = getAll(fakeModel);
      await middleware(req, res, next);

      expect(fakeModel.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      // We expect 2 documents as per our fakeDocs
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        results: 2,
        data: [{ _id: "1" }, { _id: "2" }],
      });
    });

    it("should call next with an error if find fails", async () => {
      const error = new Error("Find Error");
      fakeModel.find.mockImplementation(() => {
        throw error;
      });
      const middleware = getAll(fakeModel);
      await middleware(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ---------- getAllAgg ------------
  describe("getAllAgg", () => {
    beforeEach(() => {
      req.query = {}; // Not used typically
      fakeModel.aggregate = jest.fn();
    });

    it("should return aggregated documents", async () => {
      const fakeAggDocs = [{ _id: "group1", total: 5 }];
      fakeModel.aggregate.mockResolvedValue(fakeAggDocs);

      const middleware = getAllAgg(fakeModel, [
        { $group: { _id: "$groupField", total: { $sum: 1 } } },
      ]);
      await middleware(req, res, next);

      expect(fakeModel.aggregate).toHaveBeenCalledWith([
        { $group: { _id: "$groupField", total: { $sum: 1 } } },
      ]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        results: fakeAggDocs.length,
        data: fakeAggDocs,
      });
    });

    it("should call next with an error if aggregate fails", async () => {
      const error = new Error("Aggregate Error");
      fakeModel.aggregate.mockRejectedValue(error);

      const middleware = getAllAgg(fakeModel, []);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ---------- singularCreateAndUpdate ------------
  describe("singularCreateAndUpdate", () => {
    beforeEach(() => {
      req.body = { key: "value" };
      req.criteria = { uniqueField: "test" };

      fakeModel.findOneAndUpdate = jest.fn();
    });

    it("should update the document if it exists", async () => {
      const existingDoc = { _id: "123", uniqueField: "test", key: "oldValue" };
      const updatedDoc = { _id: "123", uniqueField: "test", key: "value" };

      fakeModel.findOneAndUpdate.mockResolvedValue(updatedDoc);

      const middleware = singularCreateAndUpdate(
        fakeModel,
        { uniqueField: "test" },
        req.body
      );
      await middleware(req, res, next);

      expect(fakeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { uniqueField: "test" },
        req.body,
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: updatedDoc,
      });
    });

    it("should create the document if it does not exist", async () => {
      const createdDoc = { _id: "456", uniqueField: "test", key: "value" };

      fakeModel.findOneAndUpdate.mockResolvedValue(createdDoc);

      const middleware = singularCreateAndUpdate(
        fakeModel,
        { uniqueField: "test" },
        req.body
      );
      await middleware(req, res, next);

      expect(fakeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { uniqueField: "test" },
        req.body,
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: createdDoc,
      });
    });

    it("should call next with an error if create/update fails", async () => {
      const error = new Error("Error in singularCreateAndUpdate");
      fakeModel.findOneAndUpdate.mockRejectedValue(error);

      const middleware = singularCreateAndUpdate(
        fakeModel,
        { uniqueField: "test" },
        req.body
      );
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
