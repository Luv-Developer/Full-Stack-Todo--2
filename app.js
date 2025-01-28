const express = require("express")
const app = express()
const port = 3000
const path = require("path")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const {createClient} = require("@supabase/supabase-js")
app.use(cookieParser())
app.set("view engine","ejs")
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"public")))
//creating a supabase url and api key 
const supabaseurl = "https://tgulchyaoxlspxdnthcp.supabase.co"
const supabasekey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRndWxjaHlhb3hsc3B4ZG50aGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNTk4OTcsImV4cCI6MjA1MzYzNTg5N30.-zMQ8YctfJQSZ-aFLc5sYoHTAxpiVsw-gY8jm8xOO58"
const supabase = createClient(supabaseurl,supabasekey)
app.get("/",(req,res)=>{
    res.render("homepage")
})
app.get("/login",(req,res)=>{
    res.render("login")
})
app.get("/register",(req,res)=>{
    res.render("register")
})
app.post("/register",async(req,res)=>{
    const {username,email,password} = req.body
    const salt = await bcrypt.genSalt(10)
    const hashedpassword = await bcrypt.hash(password,salt)
    let user = await supabase
    .from("users")
    .insert([{username,email,password_hash:hashedpassword}])
    if(user){
        let token = jwt.sign({email},"hehe")
        res.cookie("token",token)
        res.redirect("/")
    }
    else{
        res.json({message:"Internal Server Error"})
    }
})
app.get("/login",(req,res)=>{
    res.render("login")
})
app.post("/login",async(req,res)=>{
    const {email,password} = req.body
    let {data:user,error} = await supabase
    .from("users")
    .select("*")
    .eq("email",email)
    .single()
    if(!user){
       return res.render("register")
    }
        const ispasswordvalid = await bcrypt.compare(password,user.password_hash)
        if(!ispasswordvalid){
            return res.render("login")
        }
         let token = jwt.sign({email},"hehe")
         res.cookie("token",token)
           return res.redirect("/")
 })
app.get("/logout",(req,res)=>{
    res.cookie("token","")
    res.redirect("login")
})
function isloggedin(req,res,next){ // this route will check that the user entering in other route should pass this function first 
    if(req.cookies.token === ""){
        res.render("login")
        next()
    }
    else{
        let data = jwt.verify(req.cookies.token,"hehe")// this will verify the data 
         req.user = data // this will send the request to the another route holding the user information 
         next()
    }
}
app.get("/todo",isloggedin,async(req,res)=>{
    let user = await supabase
    .from("users")
    .select("*")
    .eq("email",req.user.email)
    .single()
    console.log(user)
    res.render("todo",{user})
})
app.listen(port,()=>{
    console.log(`App is listening at ${port}`)
})
