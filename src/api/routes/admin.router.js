import express from "express";
import {authenticateUser} from "../middlewares/auth.middleware.js";

import {AdminController} from '../controllers/index.js'

const accountRouter = express.Router();

accountRouter.get("/allaccount", authenticateUser, AdminController.getAllAccount);
accountRouter.post("/addaccount", authenticateUser, AdminController.addAccount);
accountRouter.put("/updateaccount/:id", authenticateUser, AdminController.updateAccount);
accountRouter.delete("/deleteaccount/:id", authenticateUser, AdminController.deleteAccount);

export default accountRouter;
