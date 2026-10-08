require('dotenv').config();
const mongoose = require('mongoose');
const Internship = require('./models/Internship');
const Application = require('./models/Application');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const ints = await Internship.find({});
  const empty = ints.filter(i => !i.description || i.description.trim() === '');
  console.log("Empty description internships:", empty.map(i => ({title: i.title, company: i.company, _id: i._id})));
  
  const student = await User.findOne({ name: 'chandrika', role: 'student' });
  console.log("Found student id:", student ? student._id : 'none');
  process.exit();
});
