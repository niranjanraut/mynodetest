let express = require('express'); 
let app = express();

let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;

let dotenv = require('dotenv');
dotenv.config(); 

let mongoUrl = process.env.mongoLiveUrl;
let bodyParser = require('body-parser');
let cors = require('cors');
let port = process.env.PORT || 7100;
let db;
let col_name = "adminUser"; 

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());
//static file path like css, js 
app.use(express.static(__dirname+'/public'));
app.set('views','./src/views');
app.set('view engine','ejs');

app.get('/health',(req,res) => {
    res.send('Health Ok');
})

app.get('/',(req,res) => {
    db.collection(col_name).find({}).toArray((err,result) => {
        if(err) throw err;
        res.status(200).render('index',{data:result});
    })
})

app.get('/new',(req,res) => {
   res.status(200).render('forms');
    
})

//get Users
app.get('/users',(req,res) => {
    let query = {}; 
    let city = req.query.city;
    let role = req.query.role;
    let isActive = req.query.isActive;

    if(city && role)
    {   
        //get users by city and role
        query = {city:city,role:role,isActive:true};
    }
    else if(city)
    {   
        //get users by city
        query = {city:city,isActive:true};

    }else if(role)
    {   
        //get users by role
        query = {role:role,isActive:true};

    }else if(isActive)
    {   
        //get users by isActive status
        if(isActive == "false") {
            isActive = false;
        }  else{
            isActive = true;
        } 

        query = {isActive:isActive};
    }

    db.collection(col_name).find(query).toArray((err,result) => {
        if(err) throw err;
        res.status(200).send(result);
    })
})

//get user 
app.get('/user/:id',(req,res) => {

    let id = mongo.ObjectId(req.params.id);

    db.collection(col_name).find({_id:id}).toArray((err,result) => {
        if(err) throw err;
        res.status(200).send(result);
    })
})

//add User
app.post('/addUser',(req,res) => {
    
    let data = {
        name:req.body.name,
        city:req.body.city,
        phone:req.body.phone,
        role:req.body.role ? req.body.role : 'User',
        isActive:true
    }

    db.collection(col_name).insertOne(req.body,(err,result) => {
        if(err) throw err;
        //res.status(200).send(result);
        res.redirect('/');
    })
})

app.put('/updateUser',(req,res) => {
    
    let id = mongo.ObjectId(req.body._id);

    db.collection(col_name).updateOne(
        {_id:id},
        {
            $set:{
                name:req.body.name,
                city:req.body.city,
                phone:req.body.phone,
                role:req.body.role,
                isActive:true
            }
        },(err,result) => {
            if(err) throw err;
            res.send('Data Updated'); 
        }
    )
})

//hard delete
app.delete('/deleteUser',(req,res) => {

    let id = mongo.ObjectId(req.params.id);

    db.collection(col_name).remove({_id:id},(err,result) => {
        if(err) throw err;
        res.status(200).send('User Removed');
    })
})

//soft delete (dactivate user)
app.put('/deactivateUser',(req,res) => {    
    let id = mongo.ObjectId(req.body._id);
    db.collection(col_name).updateOne(
        {_id:id},
        {
            $set:{               
                isActive:false
            }
        },(err,result) => {
            if(err) throw err;
            res.send('User Deactivated'); 
        }
    )
})

// Activate user 
app.put('/activateUser',(req,res) => {    
    let id = mongo.ObjectId(req.body._id);
    db.collection(col_name).updateOne(
        {_id:id},
        {
            $set:{               
                isActive:true
            }
        },(err,result) => {
            if(err) throw err;
            res.send('User Activated');
        }
    )
})

MongoClient.connect(mongoUrl,(err,client) => {
    if(err) console.log('Error while conecting');
    db = client.db('nodejs');
    app.listen(port,() => {
        console.log(`Listing to port ${port}`);
    });
})