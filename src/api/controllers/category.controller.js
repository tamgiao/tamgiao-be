import Categories from "../models/category.model.js";
import Tests from "../models/test.model.js";

const findAllCategories = async (req, res, next) => {
  try {
    const categories = await Categories.find();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching users: ", error);
    next(error); 
  }
};

const findTestsByCategoyId = async (req, res, next) => {
  try {
    const test = await Tests.find({category: req.params.categoryId }).exec(); 
    res.json(test);
  } catch (error) {
    console.error("Error fetching users: ", error);
    next(error); 
  }
};

const getCateNameByCateId = async (req, res, next) => {
  try {
    const category = await Categories.findById(req.params.categoryId).exec(); 
    res.json({categoryName: category.categoryName});
  } catch (error) {
    console.error("Error fetching users: ", error);
    next(error); 
  }
};

export default { 
    findAllCategories,
    findTestsByCategoyId,
    getCateNameByCateId
};
