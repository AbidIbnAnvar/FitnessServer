require('dotenv').config();
const express = require('express');
const app =express();
const mongoose= require('mongoose')
const cors = require('cors');
const bodyParser = require('body-parser');
const router = express.Router();
const User = require('./models/User');
const Forum = require('./models/Forum')
const Workout = require('./models/Workout')
const Fit = require('./models/FIT_Workout')
const bcrypt= require('bcryptjs')
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const config = require('config')
const {check, validationResult} = require('express-validator')
const auth = require("./auth")
const cookieParser = require("cookie-parser")

const salt = bcrypt.genSaltSync(10);
const secret = 'sadjjasidj813498109d@U841209312$132123'

router.use(bodyParser.urlencoded({limit:'1000mb', extended: true }));
mongoose.connect("mongodb+srv://abidb220004cs:B220004CS@cluster0.faiyfm0.mongodb.net/User?retryWrites=true&w=majority")

app.use(bodyParser.json({limit:'1000mb'}));
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cors({ credentials: true, origin: '*' }));
app.use(cookieParser())

function verifyToken(req, res, next) {
    const token =req.cookies.jwt_token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(400).json({ message: 'Invalid token' });
    }
  }


app.get('/user/get',verifyToken,async (req, res) => {
  
   const username = req.user.username;
   const userDoc=await User.findOne({username})
   res.json(userDoc);
  });

app.patch('/user/details', async(req,res)=>{
    try{
        const{username,email,weight,height}=req.body
        const userDoc=await User.findOne({username})
        
        if(userDoc){
            await User.updateOne({username:username},{$set: {email:email,weight:weight, height:height} }) 
             const NewDoc = await User.findOne({username})
        

         } else {
             res.json("User not found")
         }

    } catch(err){
        res.json("Error",err)
    }
})

app.post("/login", async(req,res)=>{
    const{username,password}=req.body
    const userDoc=await User.findOne({username})
    if(!userDoc){
        res.status(400).json('wrong credentials')
    }
    const passOk =bcrypt.compareSync(password, userDoc.password);
    if(passOk){
        const token = jwt.sign({username, id:userDoc._id},secret,{ expiresIn: '200h' }
                    )
        res.cookie('jwt_token', token,{
            httpOnly:true
        });
        res.json("token added")


    } else{
        res.status(400).json('wrong credentials')
    }
    
})


app.get("/login", (req, res) => {
    const{username,password}=req.body
    const token = jwt.sign({username,password}, secret);
    return res
      .cookie("access_token", token, {
        httpOnly: true
      })
      .status(200)
      .json({ message: "Logged in successfully" });
  }); 

app.post("/signup",[
    check('name','Name is required')
        .not()
        .isEmpty(),
    check('email','Please include a valid email').isEmail(),
    check('password','Please enter a password with 4 or more characters').isLength({min:4})
],
 async(req,res)=>{

    const {username,email,password}=req.body;

    try{
        let user = await User.findOne({username})
        if (user){
            return res.status(500).json({errors:[{msg: 'User already exists'}]})
        }

        user = new User({
            username,
            email,
            password
        })

        const salt1 = await bcrypt.genSalt(10);
        user.password= await bcrypt.hash(password,salt1)
        await user.save();

        const payload = {
            user: {
                id:user.id
            }
        }

        const token = jwt.sign(
            payload, 
            secret,
            {expiresIn: 360000},
            (err,token)=> {
                if(err) throw err;
                res.json({token})
            })
        res.cookie('jwt_token', token,{
              httpOnly:true
          });
        


    } catch(err){
        console.error(err.message)
        res.status(500).send('Server error')
    }
    



    
})


app.post('/logout', (req,res) => {
    res.cookie('jwt_token','')
    res.json('ok')
})


app.get('/user/forum-details',async (req,res)=>{
    try {
        const forumDoc = await Forum.find({})
        res.json(forumDoc)
    } catch (error) {
        res.json("Error occurred")
    }
    

})

app.post('/user/post-details',async(req,res)=>{
    try {
        const {no,username,message,date}=req.body;
        const post = new Forum({no,username,message,date})
        const savedUser = await post.save();
        res.status(200).json(savedUser);
    } catch (error) {
        res.json(error)
    }
    
})

app.delete('/user/delete-post', async(req,res)=>{
    try {
        const {no}=req.body
        const postDoc =await Forum.find({no:no})
        if(postDoc){
            const result = await Forum.deleteOne({ no: no });
            if (result.deletedCount === 1) {res.status(200).json('Succesfully deleted');} else {res.status(404).json('Unable to delete');}
        }else{
            res.json('No such post found')
        }
        
    } catch (e) {
        res.json(e)
    }
})


app.post('/user/add-workout',async(req,res)=>{
    try {
        const {username,workoutName,workoutReps,workoutDuration,workoutCalories,date,fileIdMesgs,eventMesgs,recordMesgs,sessionMesgs}=req.body
        if(workoutReps){
            const workout = new Workout({username:username,workout_name:workoutName,workout_reps:workoutReps,workout_calories:workoutCalories,date:date})
            const savedWorkout = await workout.save();
            res.status(200).json(savedWorkout);
        } else if(workoutDuration){
            const workout = new Workout({username:username,workout_name:workoutName,workout_duration:workoutDuration,workout_calories:workoutCalories,date:date})
            const savedWorkout = await workout.save();
            res.status(200).json(savedWorkout);
        } else if(fileIdMesgs){
            const workout = new Workout({username:username,fileIdMesgs:fileIdMesgs,eventMesgs:eventMesgs,recordMesgs:recordMesgs,sessionMesgs:sessionMesgs})
            const savedWorkout = await workout.save();
            res.status(200).json(savedWorkout);
        } else {
            res.status(500).json("Reps and duration not entered")
        }
    } catch (error) {
        res.json(error)
    }
})

app.get('/user/get-workout/', async(req,res)=>{
    try {
        const user_name= req.query.username
        const workoutDoc = await Workout.find({username:user_name})
        res.json(workoutDoc)
    } catch (error) {
        res.json(error)
    }
})

app.delete('/user/delete-workout', async(req,res)=>{
    try {
        const {id}=req.body
        const workoutDoc =await Workout.find({_id:id})
        if(workoutDoc){
            const result = await Workout.deleteOne({ _id: id });
            if (result.deletedCount === 1) {res.status(200).json('Succesfully deleted');} else {res.status(404).json('Unable to delete');}
        }else{
            res.json('No such post found')
        }
        
    } catch (e) {
        res.json(e)
    }
})

app.listen(8080,()=>{
    console.log("port connected")
})

