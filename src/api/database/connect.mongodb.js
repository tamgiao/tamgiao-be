"use strict";

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectString = process.env.DB_URI;

class Database {
    constructor() {
        this.connect();
    }

    //connect
    connect(type = "mongodb") {
        mongoose
            .connect(connectString, { maxPoolSize: 50 })
            .then(() => {
                console.log(`Connected to MongoDB Database`);
            })
            .catch((err) => {
                console.log("❌ Error Connect: ", err);
            });
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

const instanceMongoDb = Database.getInstance();

export default instanceMongoDb;
