const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({path: "./config.env"});
const User = require("./userModel");
const clarifai = require("clarifai");

const path = require("path");

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true
})
.then(con => console.log("DB connection successful"));

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "build")));

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "build", "index.html"));
})

app.post("/api/clarifai", (req, res) => {
	try{
		const {input} = req.body;

		const app = new Clarifai.App({
			apiKey: process.env.API_KEY
		});

	app.models.predict(Clarifai.FACE_DETECT_MODEL, input)
	.then(resp => res.status(200).json({
		message: "successful",
		data:resp
	}));
	}

	catch(err){
		res.status(200).send({message: "failed"})
	}
});

app.post("/signin", async (req, res) => {
	try{

		const {email, password} = req.body;

		if(!email || !password){
			return;
		}

		const user = await User.findOne({email});

		if(!user || !bcrypt.compareSync(password, user.password)){
			return res.status(400).send({message: "incorrect email or passowrd"});
		}
		else{
			res.status(200).json({
				message: "successful",
				data: user
			});
		}
	}
	catch(err){
		res.status(404).json({
			message: "not found",
			data: err.message
		});
	}
});

app.post("/register", async (req, res) => {
	try{
		const {email, name, password, confirmPassword} = req.body;
	
		if(!email || !name || !password || !confirmPassword){
			return;
		}

		if (password !== confirmPassword) {
			return;
		}

		const user = await User.create({
			name,
			password: bcrypt.hashSync(password, 10),
			email
		});

		res.status(200).json({
			message: "successful",
			data: user
		});
	}
	catch(err){
		res.status(404).json({
			message: "not found",
			data: err.message
		});
	}
});

app.put("/image/:id", async (req, res) => {

	try{
		let {entries} = req.body;
		entries++;

		const user = await User.findByIdAndUpdate(req.params.id, {entries},{
				new: true,
				runValidators: true
			});
			if (!user) {
				return res.status(400).send({message:"user not found"});
			}
			res.status(200).json({
				status: "successful",
				data: user.entries
			})
	}
	catch(err){
		res.status(404).json({
			message: "not found",
			data: err.message
		});
	}
});

const port = process.env.PORT || 3001;
app.listen(3001, () => console.log(`app is running on ${port}`));
