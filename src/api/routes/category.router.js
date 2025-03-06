import express from "express";

import { CategoryController } from "../controllers/index.js";
const categoryRouter = express.Router();

categoryRouter.get("/getCategories", CategoryController.findAllCategories); 
categoryRouter.get("/getTest/:categoryId", CategoryController.findTestsByCategoyId);
categoryRouter.get("/getName/:categoryId", CategoryController.getCateNameByCateId);

export default categoryRouter;