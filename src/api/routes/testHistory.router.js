import express from "express";

import { TestHistoryController } from "../controllers/index.js";
const testHistoryRouter = express.Router();

testHistoryRouter.get("/:userId/:testId", TestHistoryController.getUserAnswerForQuestion); 
testHistoryRouter.post("/submit/:userId/:testId", TestHistoryController.submitTest);

export default testHistoryRouter;