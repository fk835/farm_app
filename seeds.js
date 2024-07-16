const mongoose = require('mongoose');
const Product = require('./models/product')

mongoose.connect('mongodb://127.0.0.1:27017/farmStand')
  .then(()=>{
    console.log("MONGOSH CONNECTED!!")
  })
  .catch(err =>{
    console.log("OH NO!!! MONGOSH ERROR")
    console.log(err)
  })


const allProducts = [
  {
    name: 'banana',
    price: 3,
    category: 'fruit'
  },
  {
    name: 'tomato',
    price: 10,
    category: 'vegetable'
  },
  {
    name: 'onion',
    price: 2,
    category: 'vegetable'
  },
  {
    name: 'mango',
    price: 12,
    category: 'fruit'
  },
  {
    name: 'guava',
    price: 8,
    category: 'fruit'
  }
]

Product.insertMany(allProducts)
  .then((res)=>{
    console.log(res)
  })
  .catch((err)=>{
    console.log(err)
  })