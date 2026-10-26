// Seeds a sample restaurant (admin user) with menu items into the local DB.
// Usage: node seed.js
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
const User = require('./models/user.model');
const Menu = require('./models/menu.model');

const owner = {
  username: 'Demo Owner',
  email: 'owner@spicegarden.test',
  phone: '9876543210',
  role: 'admin',
  password: 'SpiceGarden@123',
  passwordConfirm: 'SpiceGarden@123',
  restroName: 'Spice Garden',
  restroAddress: '12 MG Road, Bengaluru',
};http://localhost:5174/history

const img = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=70`;

const items = [
  {
    name: 'Paneer Tikka',
    description: 'Cottage cheese cubes marinated in spiced yogurt, grilled in a tandoor.',
    price: 249,
    category: 'appetizer',
    preparationTime: 15,
    stock: 30,
    isSpecial: true,
    image: img('photo-1567188040759-fb8a883dc6d8'),
    ingredients: ['paneer', 'yogurt', 'capsicum', 'onion', 'spices'],
    variants: [
      { name: 'Half', price: 149, stock: 20 },
      { name: 'Full', price: 249, stock: 30 },
    ],
  },
  {
    name: 'Butter Chicken',
    description: 'Tender chicken in a rich, creamy tomato and butter gravy.',
    price: 349,
    category: 'main course',
    preparationTime: 25,
    stock: 25,
    isSpecial: true,
    discount: 10,
    image: img('photo-1603894584373-5ac82b2ae398'),
    ingredients: ['chicken', 'butter', 'tomato', 'cream', 'spices'],
    variants: [
      { name: 'Half', price: 219, stock: 15 },
      { name: 'Full', price: 349, stock: 25 },
    ],
  },
  {
    name: 'Veg Biryani',
    description: 'Fragrant basmati rice slow-cooked with seasonal vegetables and saffron.',
    price: 229,
    category: 'main course',
    preparationTime: 20,
    stock: 40,
    image: img('photo-1563379091339-03b21ab4a4f8'),
    ingredients: ['basmati rice', 'vegetables', 'saffron', 'mint'],
    variants: [{ name: 'Regular', price: 229, stock: 40 }],
  },
  {
    name: 'Dal Makhani',
    description: 'Black lentils simmered overnight with butter and cream.',
    price: 199,
    category: 'vegetable',
    preparationTime: 15,
    stock: 35,
    image: img('photo-1546833999-b9f581a1996d'),
    ingredients: ['black lentils', 'kidney beans', 'butter', 'cream'],
    variants: [{ name: 'Regular', price: 199, stock: 35 }],
  },
  {
    name: 'Samosa',
    description: 'Crispy pastry filled with spiced potatoes and peas.',
    price: 49,
    category: 'snacks',
    preparationTime: 10,
    stock: 60,
    image: img('photo-1601050690597-df0568f70950'),
    ingredients: ['flour', 'potato', 'peas', 'spices'],
    variants: [
      { name: '1 pc', price: 25, stock: 60 },
      { name: '2 pcs', price: 49, stock: 60 },
    ],
  },
  {
    name: 'Gulab Jamun',
    description: 'Soft milk dumplings soaked in rose-cardamom sugar syrup.',
    price: 99,
    category: 'dessert',
    preparationTime: 5,
    stock: 50,
    image: img('photo-1666190092159-3171cf0fbb12'),
    ingredients: ['khoya', 'sugar', 'cardamom', 'rose water'],
    variants: [{ name: '2 pcs', price: 99, stock: 50 }],
  },
  {
    name: 'Mango Lassi',
    description: 'Chilled yogurt drink blended with ripe Alphonso mango.',
    price: 119,
    category: 'beverages',
    preparationTime: 5,
    stock: 45,
    image: img('photo-1571006682881-75a8bd1d5f1f'),
    ingredients: ['yogurt', 'mango', 'sugar'],
    variants: [
      { name: 'Regular', price: 119, stock: 45 },
      { name: 'Large', price: 159, stock: 30 },
    ],
  },
];

(async () => {
  await mongoose.connect(process.env.DATABASE_REMOTE);

  let user = await User.findOne({ email: owner.email });
  if (!user) user = await User.create(owner);

  for (const item of items) {
    const exists = await Menu.findOne({ name: item.name, owner: user._id });
    if (!exists) await Menu.create({ ...item, owner: user._id });
  }

  const count = await Menu.countDocuments({ owner: user._id });
  console.log(`Restaurant "${user.restroName}" (${user._id}) has ${count} menu items`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
