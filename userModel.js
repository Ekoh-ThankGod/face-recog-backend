const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required:  [true, "please add your name"],
		trim: true,
		unique: true
	},
	email:{
		type: String,
		required: [true, "please add your email address"],
		trim: true,
		unique: true
	},
	password:{
		type: String,
		required: [true, "please choose a password"],
		trim: true
	},
	confirmPassword:{
		type: String,
		trim: true
	},
	joined: {
		type: Date,
		default: Date.now()
	},
	entries:{
		type: Number,
		default: 0
	}
});

const User = mongoose.model("User", userSchema);
module.exports = User;