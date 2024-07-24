const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const Product = require('./models/product')
const Farm = require('./models/farm')
const methodOverride = require('method-override')
const AppError = require('./AppError')

mongoose.connect('mongodb://127.0.0.1:27017/farmStand')
  .then(()=>{
    console.log("MONGOSH CONNECTED!!")
  })
  .catch(err =>{
    console.log("OH NO!!! MONGOSH ERROR")
    console.log(err)
  })

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

/* MIDDLE-WARES */
// for parsing data from req.body in post requests
app.use(express.urlencoded({ extended: true }))
// for using other methods than get and post in html forms
app.use(methodOverride('_method'))

// FARMS
app.get('/farms', async (req, res)=>{
  const farms = await Farm.find({})
  res.render('farm/index', {farms})
})

app.get('/farms/new', async(req, res)=>{
  res.render('farm/new')
})

app.post('/farms', async(req, res)=>{
  const farm = new Farm(req.body);
  await farm.save();
  res.redirect(`/farms`)
})

app.get('/farms/:id', async(req, res)=>{
  const farm = await Farm.findById(req.params.id).populate('products')
  console.log(farm)
  res.render('farm/show', {farm})
})

app.get('/farms/:id/products/new', (req, res)=>{
  const {id} = req.params;
  res.render('product/new', {categories, id })
})

app.post('/farms/:id/products', async(req, res)=>{
  const {id}= req.params;
  const farm = await Farm.findById(id)
  const { name, price, category } = req.body;
  const product = new Product({name, price, category});
  farm.products.push(product);
  product.farms = farm;
  await farm.save()
  await product.save()
  res.redirect(`/farms/${farm._id}`)
})

app.delete('/farms/:id', async(req, res)=>{
  const farm = await Farm.findByIdAndDelete(req.params.id);
  res.redirect('/farms')
})


// PRODUCTS
// Custom async error function
function wrapAsync(fn) {
  return function(req, res, next){
    fn(req, res, next).catch(e => next(e))
  }
}


const categories = ['fruit', 'vegetable', 'dairy']
// CREATE: new product
app.get('/products/new', (req, res)=>{
  res.render('product/new', {categories})
})


app.post('/products', wrapAsync(async (req, res, next)=>{
    const newProduct = new Product(req.body)
    await newProduct.save()
    res.redirect(`/products/${newProduct._id}`)
}))

// READ: show all products and by category
app.get('/products', wrapAsync(async (req, res, next)=>{
  const {category} = req.query;
  if(category){
    const products = await Product.find({category})
    res.render('product/index', {products, category})
  } else {
    const products = await Product.find({})
    res.render('product/index', {products, category: 'All'})
  }
  
}))

// READ: show product by id
app.get('/products/:id', wrapAsync(async (req, res, next)=>{
  const { id } = req.params
  const product = await Product.findById(id).populate('farms')
  if(!product){
    throw new AppError('Product not found', 404)
  }
  res.render('product/show', {product})
}))

// UPDATE: edit products
app.get('/products/:id/edit', wrapAsync(async(req, res, next)=>{
  const { id } = req.params
  const product = await Product.findById(id)
  if(!product){
    throw new AppError('Product not found', 404)
  }
  res.render('product/edit', {product, categories})
}))

app.put('/products/:id', wrapAsync(async(req, res, next)=>{
  const {id} = req.params;
  const update = await Product.findByIdAndUpdate(id, req.body, {runValidators: true, new: true} );
  res.redirect(`/products/${update._id}`)
}))

// DELETE: remove products
app.delete('/products/:id', wrapAsync(async(req, res, next)=>{
  const {id} = req.params;
  const deletedItem = await Product.findByIdAndDelete(id)
  res.redirect('/products')
}))

// Custom error function
app.use((err, req, res, next)=>{
  const { status= 500 , message= 'Oh boy, stop right there!!'} = err;
  res.status(status).send(message);
})

app.listen(3000, ()=>{
  console.log("Listening....")
})