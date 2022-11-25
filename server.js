const express=require('express')//To include a module-require
const app=express()
var mysql = require('mysql');
const jwt = require('jsonwebtoken');
const { select } = require('async');

app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs")
app.use(express.static('views'))
app.use(express.static('assets'))
app.use(express.urlencoded({extended:true}));
app.use(express.json({limit:'1mb'}))
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "saranya@11",
  database:"userinfo"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  //con.query("CREATE DATABASE userinfo", function (err, result) {
   // if (err) throw err;
    //console.log("Database created");
 // });
});
//GET retrieves a representation of the specified resource.//READ
app.get('/',(req,res)=>{
    res.render('index')
})        
//POST is for writing data, to be processed to the identified resource.
app.get('/adduser',(req,res)=>{
  res.render('cust_account_add')
})
app.post('/adduser',(req,res)=>{
    console.log(req.body)
    var sql = `INSERT INTO usertable (accountnumber,name,age,gender,mobile,mail,marital,city,balance) VALUES ("${req.body.accountnumber}","${req.body.name}","${req.body.age}","${req.body.gender}","${req.body.phone}","${req.body.email}","${req.body.marital}","${req.body.city}","${req.body.balance}")`
     connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
    var sql1 = `INSERT INTO userlogin (id,user_name,user_pass,role) VALUES ("${req.body.accountnumber}","${req.body.name}","${req.body.password}","client")`
    connection.query(sql1, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    res.redirect('/account_view')
   });
})
})
app.get('/login',(req,res)=>{
    res.render('userlogin')
})
app.post('/login_backend',(req,res)=>{
  var username = req.body.username;
  var password = req.body.password;
  console.log(username,password)
  connection.query("select * from userlogin where user_name = ?",[username],function(error,results,fields){
         if (results.length > 0 && results[0].user_pass==password) {
          const token=jwt.sign({id:results[0].id,role:results[0].role},'secret123') 
          console.log(token)
        
        return res.json({token:token,username:results[0].user_name})
        } else {
              res.redirect("/");
          }
        console.log(results)
        
          res.end();
      })

})
app.get("/dashboard/:token",(req,res)=>{
  const token=req.params.token
  console.log(token)
 const data=  jwt.verify(token,'secret123')
if(data)
{
  if(data.role=="admin")
  {
    res.render("admin_dashboard")
  }
  else{
    res.render("cust_dashboard")
  }
}

})
// app.post("/user_login", function(req,res){
//   var username = req.body.username;
//   var password = req.body.password;

//   connection.query("select * from userlogin where user_name = ? and user_pass = ?",[username,password],function(error,results,fields){
//       if (results.length > 0) {
//           res.redirect("/cust_dashboard");
//       } else {
//           res.redirect("/");
//       }
//       res.end();
//   })
// })

app.get('/cust_dashboard',(req,res)=>{
  res.render('cust_login')
})
app.post('/update',(req,res)=>{
    var sql = `UPDATE usertable SET name ="${req.body.name}" , age= "${req.body.age}" , gender="${req.body.gender}",mobile="${req.body.phone}", mail="${req.body.email}",marital="${req.body.marital}",city="${req.body.city}" , balance="${req.body.balance}" WHERE accountnumber="${req.body.accountnumber}" `;
     connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
    res.redirect('/account_view')
  
  });
})
app.get('/delete/:accountnumber',(req,res)=>{
    const accountnumber=req.params.accountnumber
    var sql = `DELETE FROM usertable WHERE accountnumber = '${accountnumber}'`;
    connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Number of records deleted: " + result.affectedRows);
      res.redirect('/account_view')
    });
  
})
app.get('/accountdetails/:token',(req,res)=>{
  const token=req.params.token
  console.log('this is account api')
 const data=  jwt.verify(token,'secret123')
 connection.query(`SELECT * FROM usertable WHERE accountnumber='${data.id}'`, function(error,results,fields){
  console.log(results)
  res.render('account',{
    data:results[0]
  })
 })

})
app.get('/checkbalance/:token',(req,res)=>{
  const token=req.params.token
  console.log('this is account api')
 const data=  jwt.verify(token,'secret123')
 connection.query(`SELECT balance FROM usertable WHERE accountnumber='${data.id}'`, function(error,results,fields){
  console.log(results)
  res.render('checkbalance',{
    data:results[0]
  })
 })

})
app.get('/transfermoney',(req,res)=>{
  res.render('transfermoney')
})
app.post('/transfermoney',(req,res)=>{
  console.log(req.body)
  connection.query(`SELECT * FROM usertable WHERE accountnumber='${parseInt(req.body.senderacc)}'`, function(error,results,fields){
    console.log(results[0].balance,parseInt(req.body.amount))
   
    if(results[0].balance >= parseInt(req.body.amount))
    {
      console.log('in second function')
      connection.query(`SELECT * FROM usertable WHERE accountnumber='${parseInt(req.body.accountnumber)}' and name= '${req.body.receivername}' `, function(error,results1,fields){
      console.log(results1.length)
        if(results1.length===1)
      {
        const receiverbalance =results1[0].balance+parseInt(req.body.amount)
        var sql = `UPDATE usertable SET balance ='${receiverbalance}'  WHERE accountnumber='${req.body.accountnumber}'`;
        connection.query(sql, function (err, result) {
          if (err) throw err;
          console.log(result.affectedRows + " record(s) updated");
          const senderbalance =results[0].balance- parseInt(req.body.amount)

          var sql2 = `UPDATE usertable SET balance ='${senderbalance}'  WHERE accountnumber='${req.body.senderacc}'`;
          connection.query(sql2, function (err, result) {
            if (err) throw err;
            console.log(result.affectedRows + " record(s) updated");
            res.render('nexttransfer',{
              msg:"Your Transaction is succesfull!!"
            })
          });
        });
      }
      else{
        res.render('nexttransfer',{
          msg:"Receiver account number or username is incorrect!!"
        })
      }
      
      })
    }
    else
    {
      res.render('nexttransfer',{
        msg:"Your balance is insufficient!!"
      })    }
  })
   })
app.get('/loancalculator',(req,res)=>{
  res.render('loan')
})
app.get('/deposit',(req,res)=>{
res.render('deposit')
})
app.post('/deposit',(req,res)=>{
  const depositamt=parseInt(req.body.amount)
  var sql = `UPDATE usertable SET balance =balance +'${depositamt}'  WHERE accountnumber='${req.body.account}'`;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
    res.render('nexttransfer',{
      msg:"Your Deposit is succesfull!!"
    })
})
})

app.get('/withdraw',(req,res)=>{
  res.render('withdraw')
})
app.post('/withdraw',(req,res)=>{
  const withdrawamt=parseInt(req.body.amount)
  connection.query(`SELECT * FROM usertable WHERE accountnumber='${parseInt(req.body.account)}'`, function(error,results,fields){   
    if(results[0].balance >= withdrawamt)
    {
      var sql = `UPDATE usertable SET balance =balance -'${withdrawamt}'  WHERE accountnumber='${req.body.account}'`;
      connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result.affectedRows + " record(s) updated");
        res.render('nexttransfer',{
          msg:"Your Withdrawal is successfull!!"
        })
    })
    }
    else
    {
      res.render('nexttransfer',{
        msg:"Your balance is insufficient!!"
      })    }
  })

})
app.get('/account_view',(req,res)=>
{
  connection.query(`SELECT * FROM usertable`, function(error,results,fields){
    console.log(results)
    res.render('account_view',{
      usertable:results
    })
   }) 
})
app.get('/account_edit/:accountnumber',(req,res)=>
{
  connection.query(`SELECT * FROM usertable WHERE accountnumber='${req.params.accountnumber}'`, function(error,results,fields){
    console.log(results)
    res.render('cust_edit',{
      user:results[0]
    })
   }) 
})

app.listen(process.env.PORT ||3232,()=>{
  console.log('this bank project ')
})
