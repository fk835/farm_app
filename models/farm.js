const mongoose = require('mongoose');
const {Schema} = mongoose;
const Product = require('./product');

const farmSchema = new Schema({
  name : {
    type: String,
    required: (true, "Farm Name is required")
  },
  city: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: (true, "Email Required")
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }
  ]
})

farmSchema.post('findOneAndDelete', async function (farm) {
  if(farm.products.length){
    const res = await Product.deleteMany({ _id: { $in: farm.products } })
  }
})

const Farm = mongoose.model('Farm', farmSchema);

module.exports = Farm; 