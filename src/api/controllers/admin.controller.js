import User from "../models/user.model.js";

// Get all accounts
const getAllAccount = async (req, res) => {
    try {
        const listAcount = await User.find({}, {
            _id: 1,
            email: 1,
            fullName: 1,
            password: 1,
            phone: 1,
            gender: 1,
            address: 1,
            dob: 1,
            profileImg: 1,
            status: 1,
            role: 1,
        });

        res.status(200).json(listAcount);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

// Add a new account
const addAccount = async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

// Update an account
const updateAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

// Delete an account
const deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

export default {
    getAllAccount,
    addAccount,
    updateAccount,
    deleteAccount
};
