const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint




router.get('/', async (req, res) => {
  // find all categories
  const categories = await Category.findAll( 
    {
      include: [
        { 
          model: Product, 
          as: 'products' 
        } 
      ] 
    }
  );
  return res.json(categories);
  // be sure to include its associated Products
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  const categoryId = req.params.id
  
  const category = await Category.findOne({
      where: { id: categoryId },
      include: [ 
        { 
          model: Product, 
          as: 'products' 
        }
      ] 
    });
  if (!category) {
    console.log('Not found!');
    return res.status(404).send({message: 'Category not found! :('})
  } else {
    return res.json(category);
  }
  // be sure to include its associated Products
});

router.post('/', async (req, res) => {
  // create a new category
  const { category_name } = req.body

  if(!category_name) {
    return res.status(400).send({message: 'categoryName can not be null'})
  }

  if(!(typeof category_name === 'string')) {
    return res.status(400).send({message: 'categoryName must be a string'})
  }

  const newCategory = await Category.create({category_name});

  return res.json(newCategory)
  
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  const { category_name } = req.body
  const categoryId = req.params.id

  if(!category_name) {
    return res.status(400).send({message: 'category_name can not be null'})
  }

  if(!(typeof category_name === 'string')) {
    return res.status(400).send({message: 'category_name must be a string'})
  }

  const updatedCategory = await Category.update(
    {
      category_name
    },
    {
      where: {
        id: categoryId
      },
    }
  );
  return res.json(updatedCategory)
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  const categoryId = req.params.id

  const deletedCategory = await Category.destroy(
    {
      where: {
        id: categoryId
      },
    }
  );
  return res.json(deletedCategory)
});

module.exports = router;
