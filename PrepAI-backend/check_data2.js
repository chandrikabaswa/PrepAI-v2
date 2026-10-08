require('dotenv').config();
const mongoose = require('mongoose');
const Internship = require('./models/Internship');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const ints = await Internship.find({ postedBy: { $ne: null } });
  console.log("Recruiter internships:", ints.map(i => ({title: i.title, hasDesc: !!i.description, descLen: i.description ? i.description.length : 0})));
  process.exit();
});
