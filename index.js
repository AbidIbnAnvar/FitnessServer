// const express = require('express');
// const cors = require('cors');
// const app = express();
// const User = require('/models/User')
// app.use(cors());
// app.use(express.json());

// moongoose.connect('mongodb+srv://abidb220004cs:B220004CS@cluster0.faiyfm0.mongodb.net/?retryWrites=true&w=majority');

// app.post('/signup', async (req,res) =>{
//     const {username,email,password}=req.body;
//     const userDoc = await User.create({username,email,password});
//     res.json(userDoc);
    
// });
// //mongodb+srv://abidb220004cs:B220004CS@cluster0.faiyfm0.mongodb.net/?retryWrites=true&w=majority

// app.listen(3000);

require('dotenv').config();
const express = require('express');
const app =express();
const mongoose= require('mongoose')
const cors = require('cors');
const collection = require("./db");
const bodyParser = require('body-parser');
const router = express.Router();
const User = require('./models/User');
const bcrypt= require('bcryptjs')
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const config = require('config')
const {check, validationResult} = require('express-validator')
const auth = require("./auth")



const salt = bcrypt.genSaltSync(10);
const secret = 'sadjjasidj813498109d@U841209312$132123'

router.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb+srv://abidb220004cs:B220004CS@cluster0.faiyfm0.mongodb.net/User?retryWrites=true&w=majority")

app.use(bodyParser.json());
//middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cors({credentials:true,origin:'http://localhost:3000'}));

// const isAuthenticated =()=> {
//     if (typeof window=="undefined"){
//         return false
//     }
//     if (localStorage.getItem("jwt")){
//         return JSON.parse(localStorage.getItem("jwt"))
//     } else {
//         return false
//     }
// }

// const isAuthenticated = (req, res, next) => {
//     const token = req.cookies.token || '';
//     try {
//       const decoded = jwt.verify(token, secret);
//       req.user = decoded;
//       next();
//     } catch (err) {
//       res.status(401).json({ message: 'Unauthorized' });
//     }
//   };


// // 

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

app.get('/user/get',(req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Authentication failed. No token provided.' });
      }
    // Verify JWT
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Authentication failed. Invalid token.' });
    }

    // Access protected resource with decoded user ID
    const userId = decoded.userId;
    const user = User.find((u) => u.id === userId);
    res.json({ data: `Welcome ${user.username}! This is your protected data.` });
  });


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


app.post("/login", async(req,res)=>{
    const{username,password}=req.body
    const userDoc=await User.findOne({username})
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
        res.cookie('token', token);
        res.json({'token':token})


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

//signup


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

        jwt.sign(
            payload, 
            secret,
            {expiresIn: 360000},
            (err,token)=> {
                if(err) throw err;
                res.json({token})
            })


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

app.post('/logout', (req,res) => {
    res.cookie('token','').json('ok')
})

app.listen(8080,()=>{
    console.log("port connected")
})

