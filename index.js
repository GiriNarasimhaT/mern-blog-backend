const express = require('express');
const cors = require('cors');
const { mongoose } = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/'})
const fs = require('fs');
require('dotenv').config();

const salt = bcrypt.genSaltSync(10);
const secret = 'dh27rgfyu46f7twyufg46tf8y34rfg783';

const PORT = process.env.PORT || 4000;

const DB = process.env.DATABASE;

mongoose.connect(DB).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB', error);
});

const domainsFromEnv = process.env.CORS_DOMAINS || ""

const whitelist = domainsFromEnv.split(",").map(item => item.trim())

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}
app.use(cors(corsOptions))

app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname+'/uploads'));

app.post('/register', async (req,res)=>{
    const {username,email,password}=req.body;
    try{
        const userDoc = await User.create({
            profilePicture:'',
            username,
            email,
            password:bcrypt.hashSync(password,salt),
            postcount:0,
            bio:'',
        });
        res.json('ok');
    } catch(e){
        res.status(400).json(e);
    }
});

app.post('/login', async (req, res) => {
    try {
        const {email,password}=req.body;
        const userDoc = await User.findOne({email});
        if(userDoc){
            const passOk = bcrypt.compareSync(password,userDoc.password);
            if (passOk){
                jwt.sign({email,id:userDoc._id,username:userDoc.username,profilePicture:userDoc.profilePicture},secret,{},(err,token)=>{
                    if (err) throw err;
                    res.cookie('token',token,{
                        expires: 86400,
                        httpOnly: false,
                        secure: true,
                        sameSite:'none'
                    }).json({
                        id:userDoc._id,
                        username:userDoc.username,
                        profilePicture:userDoc.profilePicture,
                        email,
                    });
                });
            } else{
                res.status(400).json('Wrong Password')
            }
        }
        else{
            res.status(400).json('No Account found with that email')
        }
    } catch (error) {
        console.log(error)
    }
});

app.get('/profile', (req,res)=>{
    try {
        if (req.cookies.token){
            const {token} = req.cookies;
            if(token){
                jwt.verify(token,secret,{},(err,info)=>{
                    if (err) throw err;
                    res.json(info);
                });
            }
            else{
                res.json('')
            }
        }
    } catch (error) {
        console.log(error)
    }
});

app.post('/logout', (req, res) => {
    try {
        res.cookie('token', '', {
            expires: new Date(Date.now() - 1),
            httpOnly: false,
            secure: true,
            sameSite: 'none'
          }).json('ok');
    } catch (error) {
        console.log(error)
    }
  });  

// Post Creation
app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    try {
        const { token } = req.cookies;
        jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err;
        const { title, summary, content } = req.body;
        let newPath = '';
        if (req.file) {
            const { originalname, path } = req.file;
            const parts = originalname.split('.');
            const ext = parts[parts.length - 1];
            newPath = path + '.' + ext;
            fs.renameSync(path, newPath);
        }
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover: newPath,
            author: info.id,
        });
        // incrementing postcount
        await User.findOneAndUpdate(
            { _id: info.id },
            { $inc: { postcount: 1 } },
            { new: true }
        );
        res.json(postDoc);
        });
    } catch (error) {
        console.log(error);
        res.status(500).json('Not Logged in')
    }
});

// Post Updation
app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
    try {
        let newPath = null;
        if(req.file){
            const {originalname,path}=req.file;
            const parts = originalname.split('.');
            const ext = parts[parts.length - 1];
            newPath = path+'.'+ext;
            fs.renameSync(path, newPath);
        }
        
        const {token} = req.cookies;
        jwt.verify(token,secret,{},async (err,info)=>{
            if (err) throw err;
            const {id,title,summary,content}=req.body;
            const postDoc = await Post.findById(id);
            if (!postDoc) {
                return res.status(404).json("Page not found");
            }
            const user = JSON.stringify(postDoc.author)===JSON.stringify(info.id);
            if (!user){
                return res.status(400).json('Post updation failed');
            }

            // delete old postcover
            if (newPath && postDoc.cover){
                fs.unlink(postDoc.cover, (err) => {
                    if (err) throw err;
                });
            }

            await postDoc.updateOne({
                title,
                summary,
                content,
                cover: newPath ? newPath : postDoc.cover,
            });
            res.json(postDoc);
        });
    } catch (error) {
        console.log(error);
    }
});

app.put('/updateprofile', uploadMiddleware.single('file'), async (req, res) => {
    try {
        let newPath = null;
        if(req.file){
            const {originalname,path}=req.file;
            const parts = originalname.split('.');
            const ext = parts[parts.length - 1];
            newPath = path+'.'+ext;
            fs.renameSync(path, newPath);
        }
        
        const {token} = req.cookies;
        jwt.verify(token,secret,{},async (err,info)=>{
            if (err) throw err;
            const {id,email,username,postcount,bio}=req.body;
            const userDoc = await User.findById(id);
            if (!userDoc) {
                return res.status(404).json("Page not found");
            }
            const user = JSON.stringify(userDoc._id)===JSON.stringify(info.id);
            if (!user){
                return res.status(400).json('You are not Logged in');
            }

            //delete old profile picture
            if (newPath && userDoc.profilePicture){
                fs.unlink(userDoc.profilePicture, (err) => {
                    if (err) throw err;
                });
            }

            await userDoc.updateOne({
                email,
                username,
                profilePicture: newPath ? newPath : userDoc.profilePicture,
                postcount,
                bio,
            });
            
            const userdata = await User.findById(userDoc._id).exec();

            const updatedUserData = {
            email,
            id: userdata._id,
            username: userdata.username,
            profilePicture: userdata.profilePicture,
            };

            const updatedToken = jwt.sign(updatedUserData, secret, {});

            res.cookie('token', updatedToken,{
                expires: 86400,
                httpOnly: false,
                secure: true,
                sameSite:'none'
            }).json('ok');
        });
    } catch (error) {
        console.log(error)
    }
});

app.delete('/delete', uploadMiddleware.single('file'), async (req, res) => {
    try {
        const {token} = req.cookies;
        jwt.verify(token,secret,{},async (err,info)=>{
            if (err) throw err;
            const {id}=req.body;
            const postDoc = await Post.findById(id);
            const isAuthor = JSON.stringify(postDoc.author)===JSON.stringify(info.id);
            if (!isAuthor){
                return res.status(400).json('You are not the author');
            }
    
            //delete postcover
            if (postDoc.cover){
                fs.unlink(postDoc.cover, (err) => {
                    if (err) throw err;
                  });
            }
    
            await postDoc.deleteOne();
    
            // decrementing postcount
            await User.findOneAndUpdate(
                { _id: info.id },
                { $inc: { postcount: -1 } },
                { new: true }
            );
    
            res.json(postDoc);
        });
    } catch (error) {
        console.log(error)
    }
});

app.delete('/deleteuser', uploadMiddleware.single('file'), async (req, res) => {
    try {
        const {token} = req.cookies;
        jwt.verify(token,secret,{},async (err,info)=>{
            if (err) throw err;
            const {id}=req.body;
            const userDoc = await User.findById(id);
            const user = JSON.stringify(userDoc._id)===JSON.stringify(info.id);
            if (!user){
                return res.status(400).json('You have not Singed In');
            }
            await userDoc.deleteOne().then(
                res.cookie('token','',{
                    expires: new Date(Date.now() - 1),
                    httpOnly: false,
                    secure: true,
                    sameSite:'none'
                }).json('ok')
            );
            //delete profile picture
            if (userDoc.profilePicture){
                fs.unlink(userDoc.profilePicture, (err) => {
                    if (err) throw err;
                });
            }
        });
    } catch (error) {
        console.log(error)
    }
});

app.delete('/deleteposts', uploadMiddleware.single('file'), async (req, res) => {
    try {
        const {token} = req.cookies;
        jwt.verify(token,secret,{},async (err,info)=>{
            if (err) throw err;
            const {id}=req.body;
            const user = JSON.stringify(id)===JSON.stringify(info.id);
            const userDoc=User.findById(info.id);
            if (!user){
                return res.status(400).json('You have not Singed In');
            }

            //Delete all postcovers
            const posts = await Post.find({ author: id });
            for (const post of posts) {
                if (post.cover){
                    fs.unlink(post.cover, (err) => {
                        if (err) throw err;
                    });
                }
            }

            await Post.deleteMany({author:id});
            // set postcount to 0
            await User.findOneAndUpdate(
                { _id: info.id },
                { postcount: 0 },
                { new: true }
            );
            res.json('ok');
        });
    } catch (error) {
        console.log(error);
    }
});

app.get('/posts', async (req,res)=>{
    res.json(await Post.find().populate('author',['_id','username']).sort({createdAt:-1}).limit(20));
});

app.get('/post/:id',async (req,res)=>{
    try {
        const { id } = req.params;
        const postDoc = await Post.findById(id).populate('author',['username']);
        if (!postDoc) {
            return res.status(404).json("{ error: 'Post not found' }");
        }
        res.json(postDoc);
    } catch (error) {
        res.status(400).json("{ error: 'Invalid id' }");
    }
});

app.get('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userDoc = await User.findById(id).select('-password');
        if (!userDoc) {
            return res.status(404).json({ error: 'User not found' });
        }
        const posts = await Post.find({ author: id })
            .populate('author', ['_id', 'username'])
            .sort({ createdAt: -1 })
            .limit(20);
        
        res.json({ user: userDoc, posts });
    } catch (error) {
      res.status(400).json({ error: 'Invalid id' });
    }
  });

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
