const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/',async (req, res) => {
  // find all tags
  const tags = await Tag.findAll(
    {
    include: [
      { 
        model: Product, 
        as: 'products' 
      } 
    ]
  }
  );
  return res.json(tags);
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  const tagId = req.params.id

  const tag = await Tag.findOne({
    where: { id: tagId },
    include: [ 
      { 
        model: Product, 
        as: 'products' 
      }
    ] 
  });
 if (!tag) {
    console.log('Not found!');
    return res.status(404).send({message: 'Tag not found! :('})
  } else {
    return res.json(tag);
  }
  // be sure to include its associated Product data
});

router.post('/', async (req, res) => {
  // create a new tag
  const {tag_name} = req.body

  if(!tag_name) {
    return res.status(400).send({message: 'tag_name can not be null'})
  }
  if(!(typeof tag_name === 'string')) {
    return res.status(400).send({message: 'tag_name must be a string'})
  }

  const newTag = await Tag.create({tag_name});

  return res.json(newTag)

});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  const { tag_name } = req.body
  const tagId = req.params.id

  if(!tag_name) {
    return res.status(400).send({message: 'tag_name can not be null'})
  }

  if(!(typeof tag_name === 'string')) {
    return res.status(400).send({message: 'tag_name must be a string'})
  }

  const updatedTag = await Tag.update(
    {
      tag_name
    },
    {
      where: {
        id: tagId
      },
    }
    );
    return res.json(updatedTag)
});


router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  const tagId = req.params.id

  const deletedTag = await Tag.destroy(
    {
      where: {
        id: tagId
      },
    }
  );
  return res.json(deletedTag)
});

module.exports = router;
