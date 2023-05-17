require('dotenv').config();
const express = require('express');
const app =express();
const mongoose= require('mongoose')
const cors = require('cors');
// const collection = require("./db");
const bodyParser = require('body-parser');
const router = express.Router();
const User = require('./models/User');
const Forum = require('./models/Forum')
const Workout = require('./models/Workout')
const bcrypt= require('bcryptjs')
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const config = require('config')
const {check, validationResult} = require('express-validator')
const auth = require("./auth")
const cookieParser = require("cookie-parser")

const salt = bcrypt.genSaltSync(10);
const secret = 'sadjjasidj813498109d@U841209312$132123'

router.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb+srv://abidb220004cs:B220004CS@cluster0.faiyfm0.mongodb.net/User?retryWrites=true&w=majority")

//middlewares
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(cookieParser())


// Middleware to verify JWT token from cookie
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


//  app.get('/user/get', isAuthenticated, async (req, res) => {
//      try {
//        const userId = req.user.id;
//        const user = await User.findById(userId);
//        res.status(200).json(user);
//      } catch (err) {
//        res.status(500).json({ message: err.message });
//      }
//    });

// const Profile =require('')
// const User = require('')


//
app.get('/user/get',verifyToken,async (req, res) => {
  
    // Retrieve the username from the JWT token
   const username = req.user.username;
   const userDoc=await User.findOne({username})
   res.json(userDoc);
   

 // Use the username to retrieve the user's data
//  await User.findOne({ username: username }, (err, user) => {
//    if (err) {
//      console.error(err);
//      return res.status(500).json({ message: 'Internal server error' });
//      }
//      if (!user) {
//        return res.status(404).json({ message: 'User not found' });
//      }
//      // Return the user's data
//      res.json({ data: user.data });
//    });
   //if (!token) {
//       return res.status(401).json({ message: 'Authentication failed. No token provided.' });
//       }
//     // Verify JWT
//   jwt.verify(token, secret, (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: 'Authentication failed. Invalid token.' });
//     }

//     // Access protected resource with decoded user ID
//     const userId = decoded.userId;
//     const user = User.find((u) => u.id === userId);
//     res.json({ data: `Welcome ${user.username}! This is your protected data.` });
//   });


    // try {
    //     const user = await User.findById(req.user.id).select('-password')
    //     res.json(user)
    // } catch (err) {
    //     console.error(err.message)
    //     res.status(500).send('Server Error')
        
    // }


    // try {
    //     const profile = await Profile.findOne({user:req.user.id})
    // } catch (err) {
    //     console.error(err.message)
    //     res.status(500).send('Server Error')
    // }

    // try {
    //   const userId = req.user.id;
    //   const user = await User.findById(userId);
    //   res.status(200).json(user);
    // } catch (err) {
    //   res.status(500).json({ message: err.message });
    // }
  });

app.patch('/user/details', async(req,res)=>{
    try{
        const{username,email,weight,height}=req.body
        const userDoc=await User.findOne({username})
        
        if(userDoc){
            await User.updateOne({username:username},{$set: {email:email,weight:weight, height:height} }) 
             const NewDoc = await User.findOne({username})
        //     // const token = jwt.sign(
        //     //     NewDoc, 
        //     //     secret,
        //     //     {expiresIn: 360000})
        //     // res.cookie('jwt_token', token,{
        //     //         httpOnly:true
        //     //     });

         } else {
             res.json("User not found")
         }

    } catch(err){
        res.json("Error",err)
    }
})

//login
app.post("/login", async(req,res)=>{
    const{username,password}=req.body
    const userDoc=await User.findOne({username})
    if(!userDoc){
        res.status(400).json('wrong credentials')
    }
    const passOk =bcrypt.compareSync(password, userDoc.password);
    if(passOk){
        const token = jwt.sign({username, id:userDoc._id},secret,{ expiresIn: '200h' }
            // (err,token)=>{ 
            //     if (err) throw err;
            //     res.cookie('token',token).json({
            //         id:userDoc._id,
            //         username:userDoc.username,}
            //        )}
                    )
        res.cookie('jwt_token', token,{
            httpOnly:true
        });
        res.json("token added")


    } else{
        res.status(400).json('wrong credentials')
    }
    

    // try {
    //     const userDoc=await User.findOne({email})
    //     res.json(userDoc)
    // } catch (e) {
    //     console.log(e)
    //     res.status(400).json(e)
    // }

    // try {
    //     const check=await collection.findOne({email:email})
    //     if (check){
    //         res.json("exist")
    //     }else{
    //         res.json("does not exist")
    //     }

    // } catch (e) {
    //     res.json("does not exist")
        
    // }
})

//login
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

//Signup
app.post("/signup",[
    check('name','Name is required')
        .not()
        .isEmpty(),
    check('email','Please include a valid email').isEmail(),
    check('password','Please enter a password with 4 or more characters').isLength({min:4})
],
 async(req,res)=>{
    // const errors =validationResult(req);
    // if (!errors.isEmpty()){
    //     return res.status(400).json({errors: errors.array()})
    // }  

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
    



    //Actual
    // const{username,email ,password}=req.body
    // try {
    //     const userDoc = await User.create({
    //         username,
    //         email,
    //         password:bcrypt.hashSync(password,salt)
    //     })
    //     res.json(userDoc)
    // } catch (e) {
    //     console.log(e)
    //     res.status(400).json(e)
    // }
    
    // try {
    //     const{username,email ,password}=req.body
    //     const data={
    //         username:username,
    //         email:email,
    //         password:password
    //     }
        
    //     const check=await collection.findOne({email:email})
    //     if (check){
    //         res.json("exist")
    //     }else{ 
    //         res.json("does not exist")
    //         const result = await collection.insertOne({ username, email, password });
    //         res.send(`User ${username} created`)
    //         console.log(`User ${username} created`)
    //     }

    // } catch (e) {
    //     res.json("does not exist")
        
    // }
})

//Logout
app.post('/logout', (req,res) => {
    res.cookie('jwt_token','')
    res.json('ok')
})

//Forum
app.get('/user/forum-details',async (req,res)=>{
    try {
        const forumDoc = await Forum.find({})
        res.json(forumDoc)
    } catch (error) {
        res.json("Error occurred")
    }
    // if (Forum){
    //     res.json(Forum.find().then((res) => {
    //         console.log(res)
    //     }).catch((err)=>{
    //         console.log(err)
    //     })
    //       )
    // } else {
    //     res.json('Forum is empty')
    // }

})

app.post('/user/post-details',async(req,res)=>{
    try {
        const {no,username,message}=req.body;
        const post = new Forum({no,username,message})
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

//Fitness
app.post('/user/add-workout',async(req,res)=>{
    try {
        const {username,workoutName,workoutReps,workoutDuration,workoutCalories}=req.body
        if(workoutReps){
            const workout = new Workout({username:username,workout_name:workoutName,workout_reps:workoutReps,workout_calories:workoutCalories})
            const savedWorkout = await workout.save();
            res.status(200).json(savedWorkout);
        } else if(workoutDuration){
            const workout = new Workout({username:username,workout_name:workoutName,workout_duration:workoutDuration,workout_calories:workoutCalories})
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

