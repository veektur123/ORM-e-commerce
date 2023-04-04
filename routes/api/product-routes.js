const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  const products = await Product.findAll(
    {
      include: [
        Category,
        Tag

      ]
    }
  );
  return res.json(products);
  // be sure to include its associated Category and Tag data
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  const productId = req.params.id

  const product = await Product.findOne({
    where: { id: productId },
    include: [ 
      { 
        model: Category,Tag,
        as: 'categories', as: 'tags'
      }
    ]    
  });
  if (!product) {
    console.log('Not found!');
    return res.status(404).send({message: 'Product not found! :('})  
  } else {
    return res.json(product);
  }
  
  // be sure to include its associated Category and Tag data
});

// create new product
router.post('/', async (req, res) => {
  const {product_name, price, stock, category_id, tagIds} = req.body
  
  if(!product_name || !price || !stock ) {
    return res.status(400).send({message: 'product_name, price, and stock can not be null'})
  }
  
  const parsedPrice = parseInt(price)
  const parsedStock = parseInt(stock)
  const parsedCategoryId = parseInt(category_id)
  if(parsedPrice === NaN || parsedStock === NaN) {
    return res.status(400).send({message: 'price and stock must be numbers'})
  }

  if(category_id && parsedCategoryId === NaN){
    return res.status(400).send({message: 'category_id must be a number'})
  }

  const createdProduct = await Product.create({product_name, price: parsedPrice, stock: parsedStock, category_id: category_id ? parsedCategoryId : null});
  if (tagIds?.length) {
    const productTagIdArr = tagIds.map((tag_id) => {
      return {
        product_id: createdProduct.id,
        tag_id,
      };
    });
    await ProductTag.bulkCreate(productTagIdArr);
    const productWithTags = await Product.findOne({
      where: {
        id: createdProduct.id
      },
      include: Tag
    })
    return res.json(productWithTags)
  }

  return res.json(createdProduct)
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
  const productId = req.params.id

  const deletedProduct = await Tag.destroy(
    {
      where: {
        id: productId
      },
    }
  );
  return res.json(deletedProduct)
});

module.exports = router;
