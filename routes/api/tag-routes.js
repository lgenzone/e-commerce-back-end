const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint


router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
 try {
  const tags = await Tag.findAll({
    include: [
      { model: Product,
         attributes: 
         ['id',
          'product_name',
          'price',
          'stock',
          'category_id'
        ], 
        through: { 
          attributes: [] 
        }
      },
    ],
    attributes: {
      exclude: [
        'categoryId',
       'createdAt',
        'updatedAt'
      ]
    }
  });
  res.json(tags);
 } catch (err) {
  res.status(500).json(err);
 }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
 try {
  const tags = await Tag.findByPk(req.params.id,
    {
      include: [
        { model: Product, 
        attributes: [
          'id',
          'product_name',
          'price',
          'stock',
          'category_id'
        ],
      through: {
        attributes: []
      }
    },
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    });
    if (!tags) {
      return res.status(404).json({ message: `${req.params.id} not found`});
    }
  res.json(tags);
 } catch (err) {
  res.status(500).json(err);
 }
});



router.post('/', async (req, res) => {
  // create a new tag
  try {
    const newTag = await Tag.create(req.body);
    res.status(200).json(newTag);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
try {
  const tagId = req.params.id;
  const [rowsAffected, updateTags] = await Tag.update(req.body, { 
    where: { id:tagId }, 
    returning: true 
  });
    if (rowsAffected === 0) {
      return res.status(404).json({ message: `Tag with ID ${tagId} not found` });
    }
    const [updateTag] = updateTags;
    return res.status(200).json(updateTag);
} catch (err) {
  return res.status(500).json(err);
}
});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try {
    const tagId = req.params.id;
    const deleteTag = await Tag.destroy({
      where: 
      {
        id: tagId
      }
    });
    if (!deleteTag) {
      return res.status(404).json({ message: `Tag with ID ${tagId} not found`});
    }
    return res.status(200).json({ message: `Tag with ID ${tagId} successfully created`})
  } catch (err) {
    return res.status.json(err)
  }
});

module.exports = router;
