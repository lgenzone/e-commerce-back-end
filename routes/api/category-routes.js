const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  try {
    const categories = await Category.findAll({
      attributes: {
      
      },
      include: {
        // included associated Product module
        model: Product,
        attributes: {
          // exclude the created, updated, and categoryId timestamps
          exclude: [
            'createdAt',
            'updatedAt',
            'categoryId'
          ]
        }
      }
    });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json(err);
  }
});

// find one category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: {
        model: Product,
        attributes: {
          exclude: [
            'createdAt',
            'updatedAt',
            'categoryId'
          ]
        }
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(category);
  } catch (err) {
    res.status(500).json(err);
  }
});

  // create a new category
  router.post('/', async (req, res) => {
    try {
      const newCategory = await Category.create({
        category_name: req.body.category_name
      });
    
    res.status(200).json(newCategory);
    } catch (err) {
    res.status(500).json(err);
    }
  });
  

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  try {
    const categoryId = req.params.id;
    const [rowsAffected, updatedCategories] = await Category.update(req.body,{ 
      where: {
         id: categoryId
        }, 
        returning: true 
      });
      if (rowsAffected === 0) {
        return res.status(404).json({ message: `Category with ID ${categoryId} not found` });
      }
      const [updatedCategory] = updatedCategories;
      return res.status(200).json(updatedCategory);
  } catch (err) {
    return res.status(500).json(err);
  }
});


router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const categoryId = req.params.id;
    const deletedCategory = await Category.destroy({ 
      where: { 
        id: categoryId
      }
    });
    if (!deletedCategory) {
      return res.status(404).json({ message: `Category with ID ${categoryId} not found`});
    }
    return res.status(200).json({ message: `Category with ID ${categoryId} has been successfully deleted` });
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
