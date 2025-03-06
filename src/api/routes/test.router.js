import express from "express";

import { TestController } from "../controllers/index.js";
const testRouter = express.Router();

testRouter.get("/:id", TestController.findTestsById); 
testRouter.post("/create/:categoryId", TestController.createTest);

export default testRouter;