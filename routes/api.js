const express = require('express');
const api_router = express.Router()
const multer = require('multer');
const fs = require('fs');
const path = require("path");
const db = require('../DataBaseConnection')
const crypto=require('crypto');
//Setting up Storage Area
const myStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      var uploadDir = "./public/uploads/Trainer";
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    }, filename: function (req, file, cb) {
      cb(null, req.session.UserID + '_' + file.originalname + '_' + Date.now() + path.extname(file.originalname));
    }
  });
const myFileFilter = (req, file, error) => {
    if (file.mimetype.split("/")[1] === "pdf" || file.mimetype.split("/")[1] === "jpg") {
        cb(null, true);
    } else {
        cb(new Error("Not a PDF File!!"), false);
    }
};
const upload = multer({ storage: myStorage, limits: { fileSize: 500000 } }).single("myQCImage");

api_router.get('/AssessmentDetails', (req, res) => {
    if (req.session.UserID) {
        db.query("select A.AssessmentName,A.Description,A.Duration,A.MaximumScore,A.CreatedBy,U.employeeName,U.role from assessments as A join userlogin as U where AssesmentKey=? and A.CreatedBy=U.empId and A.CreatedBy!=? ", [req.query.key, req.session.UserID], function (error, result) {
            if (result.length > 0) {
                res.status(200).send(result[0]);
            } else {
                res.status(404).send("Assessment Not Found");
            }
        })
    } else {
        res.status(401).send("Access Denied");
    }
});

api_router.post('/uploadImage', (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            console.log(err);
            res.status(400).send(err);
        } else {
            res.send(res.req.file.filename);
        }
    });
});
api_router.get('/reattempt-request', (req, res) => {
    if (req.session.UserID) {
        db.query("select * from repeatrequest where assessmentkey=? and UserID=? and status='Pending' or status='Approved'",[req.query.key,req.session.UserID],(err,result)=>{
            if(err){
            res.status(400).send("Internal server error");
            }
            if(result.length>0){
                res.status(400).send("Request Already Submitted")
            }else{


        db.query("select A.CreatedBy,U.employeeName from assessments as A join userlogin as U where AssesmentKey=? and A.CreatedBy=U.empId ", [req.query.key], function (error, result) {
            if (error) {
                 res.status(400).send(error)
            }
            else if (result.length > 0) {
                let inputData = {
                    "assessmentkey": req.query.key,
                    "message": req.query.msg,
                    "trainerid": result[0].CreatedBy,
                    "UserID": req.session.UserID
                }
                db.query("Insert into repeatrequest  set?", [inputData], function (err, result) {
                    if (err)
                         res.status(400).send(err);
                    else
                         res.status(200).send("Success")
                });
            }else{
                res.status(400).send("Internal Server Error");
            }
        });
    }
})
    } else {
         res.status(401).send("Access Denied");
    }
});

api_router.post('/update-reattempt-request',(req,res)=>{
    if (req.session.UserID && req.session.UserRole == "Trainer" || req.session.UserRole == "Admin") {
        db.query("update repeatrequest set status=? where id=?",[req.body.params.status,req.body.params.id],(err,result)=>{
            if(err)
            res.status(400).send("Internal Server Error");
            if(result.changedRows>0){
                db.query("Select R.status,R.id,R.message,date_format(R.requestdate,'%D-%M-%Y') as Requestdate,E.employeeName,A.AssessmentName from repeatrequest R,assessments A,userlogin E where R.trainerid=? and R.userID=E.empId and R.assessmentkey=A.AssesmentKey order by R.requestdate",[req.session.UserID],(error,result)=>{
                    if(error){
                      console.log(error)
                      res.status(400).send("Internal Server Error");
                    }
                      res.status(200).send(result);
                  });
            }
        })
    }else{
        res.status(401).send("Access Denied");
    }
});
api_router.post("/UpdatePassword",(req,res)=>{
    if (req.session.UserID && req.session.UserRole == "Trainer" || req.session.UserRole == "Employee") {
        db.query("update userlogin set password=? where empId=?",[req.body.params.newpwsd,req.session.UserID],(err,result)=>{
            if(err)
            res.status(400).send("Internal Server Error");
            if(result.changedRows>0){
                res.status(200).send('Updated');
            }
        });
    }else{
        res.status(401).send("Access Denied");   
    }
});
api_router.post('/updateUserStatus',(req,res)=>{
    if (req.session.UserID && req.session.UserRole == "Admin") {
        console.log(req.body.params)
        db.query("update userlogin set Status=? WHERE empId=?",[req.body.params.status,req.body.params.id],(err,result)=>{

            if(err) {
                console.log("ok1")
                console.log(err)
            res.status(400).send(err);
            }else{
                console.log(result)
            if(result.changedRows>0){
                console.log("ok3")
                db.query("SELECT * FROM userlogin",(error,Data)=>{
                    if(error){
                      console.log(error)
                      res.status(400).send(error);
                    }else{
                        console.log("ok4")
                        res.status(200).send(Data);
                    }
                  });
            }
        }
        })
        
    }else{
        res.status(401).send("Access Denied");
    }
});
api_router.get("*", (req, res) => {
    res.status(404).send("Invalid API Request")
});

function formatDateString(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const formattedDate = date.toLocaleString('en-US', options);
    return formattedDate;
}
module.exports = api_router