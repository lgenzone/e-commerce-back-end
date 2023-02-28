const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products and include their associated Category and Tag data
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: Tag, attributes: ['id', 'name'], through: { atributes: [] } }
      ],
      attributes: {
        // exclude categoryId, created, and updated
        exclude: ['categoryId', 'createdAt', 'updatedAt']
      }
    });
    res.json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  try {
    const products = await Product.findAll({
      // include associated Category and Tag data for each product
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: Tag, attributes: ['id', 'name'], through: { atributes: [] } }
      ],
      attributes: {
        // exclude categoryId, created, and updated
        exclude: ['categoryId', 'createdAt', 'updatedAt']
      }
    });
    res.json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});


router.post('/', async (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  try {
    // create new product
    const newProduct = await Product.create(req.body);
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: newProduct.id,
          tag_id,
        };
      });
      // bulk create all productTagId objects
      await ProductTag.bulkCreate(productTagIdArr);
    }
     const productData = await Product.findByPk(newProduct.id, {
      include: [{ model: Category}, { model: Tag, through: { attributes: [] } }]
     });
     res.status(200).json({ productData });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
    }
  });



// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const deletedProduct = await Product.destroy({
      where: {
        id: req.params.id
      },
    });
    if (deletedProduct === 0) {
      res.status(400).json('No products exist with that ID');
      return;
    };
    res.status(200).json({ message: 'Product successfully deleted' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
