const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000
const path = require("path");
const mysql = require('mysql');
const bodyParser = require('body-parser');
const { userInfo } = require('os');
var dateTime = require('node-datetime');
const { Server } = require('socket.io');
const { render } = require('ejs');
const { Socket } = require('dgram');
const { Console, error } = require('console');
const multer = require('multer');
const router = express.Router();
const fs = require('fs');
const DateTime = require('node-datetime/src/datetime');
const { restart } = require('nodemon');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.engine('html', require('ejs').renderFile);
app.set("view engine", "ejs");
app.use(express.static(`${__dirname}`));

// Set up MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'ajith001',
  database: 'QuadgenAssesmentPortal',
  multipleStatements: true
});
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
const upload = multer({ storage: myStorage, limits: { fileSize: 1000000 } }).single("myQCImage");

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'XCR3rsasa%RDHHH',
  cookie: { maxAge: 86400000 }
}));


db.connect((error) => {
  if (error) {
    console.error('Failed to connect to MySQL database:', error);
  } else {
    console.log('Connected to MySQL database!');
  }
});


const server = app.listen(port, function () {
  const port = server.address().port;
  console.log("App is listening at http://localhost:%s", port);
});



let dt = dateTime.create();
let CurrentDate = dt.format('Y-m-d H:M:S');

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/', (req, res) => {
  res.render('login', { "message": "Succes" })
});

app.get('/CreateAssessment', (req, res) => {
  if (req.session.UserID) {
    res.render("admin/create_assessment");
  } else {
    res.redirect('/login');
  }
})

app.post('/submit-questionnaire', (req, res) => {
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz1234567890";
  let lenString = 30;
  let randomString = '';
  for (let i = 0; i < lenString; i++) {
    let rnum = Math.floor(Math.random() * characters.length);
    randomString += characters.substring(rnum, rnum + 1);
  }
  //console.log(req.body.JsonFormData);
  const FormData = JSON.parse(req.body.JsonFormData);
  const questionnaire = JSON.stringify(FormData);
  let inputData = {
    "AssessmentName": FormData.Title,
    "Description": FormData.Description,
    "Questionnaire": questionnaire,
    "MaximumScore": FormData.TotalScore,
    "AssessmentDate": FormData.Date,
    "Duration": FormData.Duration,
    "CreatedOn": CurrentDate,
    "CreatedBy": req.session.UserID,
    "LastUpated": null,
    "AssesmentKey": randomString
  };
  db.query("Insert into assessments set?", [inputData], function (error, result) {
    if (error) throw error
    else
      return res.redirect('/TrainerHome');
  });
});

app.get('/viewAssessment', (req, res) => {
  let jsonData;
  db.query("SELECT * FROM assessments where CreatedBy=? and AssesmentKey=?", [req.session.UserID, req.query.AssesmentKey], function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      jsonData = JSON.parse(result[0].Questionnaire);
      res.render("admin/view_assessment", { jsonData: jsonData, "result": result[0], message: null });
    } else {
      res.redirect('/error');
    }

  })
});

app.post('/test', (req, res) => {
  let jsonData;
  db.query("select * from assessments where AssesmentKey=?", [req.body.AssesmentKey], function (error, result) {
    if (result.length > 0) {
      jsonData = JSON.parse(result[0].Questionnaire);
      db.query("Select * from responces where employeeid=? and AssessmentID=?", [req.session.UserID, result[0].AssessmentID], function (error, result1) {
        if (error) throw error
        if (result1.length > 0) {

          res.render('Employees/EmployeeHome', { message: "You have already Appeared for this Assessment.\nIf not Contact Support Team." });
        } else {

          res.render('Employees/takeAssessment', { jsonData: jsonData, "result": result[0], message: null });
        }
      });
    } else {
      res.render('Employees/EmployeeHome', { message: "Invalid Assessment Key" });
    }
  });

})

app.get('/login', (req, res) => {
  if (req.session.UserID) {
    switch (req.session.UserRole) {
      case "Employee":
        res.redirect('/EmployeeHome');
        break;
      case "Trainer":
        res.redirect('/TrainerHome');
        break;
      case "Admin":
        res.redirect('/adminHome');
        break;
      default:
        res.render('login');
        break;
    }
  } else {
    res.render('login');
  }
});

app.get('/EmployeeHome', (req, res) => {
  if (req.session.UserID && req.session.UserRole == "Employee") {
    res.render('Employees/EmployeeHome', { message: null });
  } else {
    res.redirect('/login');
  }
});

app.get('/TrainerHome', (req, res) => {
  if (req.session.UserID && req.session.UserRole == "Trainer") {
    let ConsolidatedInfo = [];
    let result = {};
    db.query("select * from assessments where CreatedBy=?", [req.session.UserID], function (error, resultOne) {
      if (error) throw error
      if (resultOne.length > 0) {
        let counter = 0;
        resultOne.forEach(record => {
          db.query('select count(*) as ResponseCount from responces where  AssessmentID=?', [record.AssessmentID], function (error, resultTwo) {
            if (error) throw error
            result = {};
            result.AssessmentID = record.AssessmentID;
            result.AssessmentName = record.AssessmentName;
            result.Description = record.Description;
            result.AssessmentDate = record.AssessmentDate;
            result.Duration = record.Duration;
            result.AssesmentKey = record.AssesmentKey;
            result.MaximumScore = record.MaximumScore;
            result.ResponseCount = resultTwo[0].ResponseCount;
            ConsolidatedInfo.push(result);
            counter++;
            if (counter === resultOne.length) {
              res.render('Trainer/TrainerHome', { data: ConsolidatedInfo });
            }
          });
        });
      } else {
        res.render('Trainer/TrainerHome', { data: ConsolidatedInfo });
      }
    });
  } else {
    res.redirect('/login');
  }
});

app.get('/viewResponces', (req, res) => {
  if (req.session.UserID && req.session.UserRole == "Trainer" || req.session.UserRole == "Admin") {
    let ConsolidatedResponces = [];
    let result = {};
    db.query("select * from responces where AssessmentID=?", [req.query.AssessmentID], function (error, resultOne) {
      if (error) throw error;
      if (resultOne.length > 0) {
        let counter = 0;
        console.log(result);
        resultOne.forEach(record => {
          db.query("select * from userlogin where empId=?", [record.employeeid], function (error, resultTwo) {
            if (error) throw error;
            result = {};
            result.SubmittedDate = formatDateString(record.date);
            let temp = JSON.parse(record.obtainedmarks);
            result.EmployeeName = resultTwo[0].employeeName;
            result.SecuredMarks = temp.TotalScore;
            result.SecuredPercentage = temp.SecuredPercentage;
            result.Result = temp.Result;
            if (record.remarks) {
              result.Remarks = record.remarks;
            } else {
              result.Remarks = "";
            }
            ConsolidatedResponces.push(result);
            counter++;
            if (counter === resultOne.length) {
              res.render("Trainer/ResponseDashboard", { Data: ConsolidatedResponces });
            }
          });
        });
      } else {
        res.render("Trainer/ResponseDashboard", { Data: ConsolidatedResponces });

      }

    });
  } else {
    res.redirect('/login');
  }
});

app.get('/adminHome', (req, res) => {
  if (req.session.UserID && req.session.UserRole == "Admin") {
    let count, employee, admin, trainer;
    db.query("select count(*) as totalUser from userlogin", function (error, result1) {
      count = result1[0].totalUser;
    });
    db.query("select count(*) as noofemployee from userlogin where role='Employee'", function (error, result1) {
      employee = result1[0].noofemployee;
    });
    db.query("select count(*) as nooftrainer from userlogin where role='Trainer'", function (error, result1) {
      trainer = result1[0].nooftrainer;
    });
    db.query("select count(*) as noofadmin from userlogin where role='Admin'", function (error, result1) {
      admin = result1[0].noofadmin;
    });
    db.query("select * from assessments", function (error, result) {
      if (error) throw error
      res.render('admin/adminHome', { data: result, TotalCount: count, employeecount: employee, trainercount: trainer, admincount: admin });
    })
  } else {
    res.redirect('/login');
  }

})
app.post('/AuthenticateLogin', (req, res) => {
  var UserInfo = req.body;
  db.query("select * from userlogin where empId=? or email=? and password=?", [UserInfo.email, UserInfo.email, UserInfo.password], function (error, result) {
    if (error) throw error;
    if (result.length > 0) {
      db.query("update userlogin set lastSeen=? where empId=?", [CurrentDate, result[0].empId], function (error, result) {
        if (error) throw error;
      });
      req.session.UserID = result[0].empId;
      req.session.UserRole = result[0].role;
      if (result[0].role == "Employee") {
        res.redirect('/EmployeeHome');
      } else if (result[0].role == "Trainer") {
        res.redirect('/TrainerHome');
      } else if (result[0].role == "Admin") {
        res.redirect('/adminHome');
      } else {
        return res.send("Internal Server Error");
      }
    } else {
      return res.redirect('/login');
    }
  })
});

app.post('/submit-assessment', (req, res) => {
  if (req.session.UserID) {
    const answerScript = JSON.parse(req.body.JsonFormData);
    db.query("Select * from assessments where AssessmentID=? and AssesmentKey=?", [req.body.AssessmentID, req.body.AssessmentKey], function (error, result) {
      if (error) throw error;
      const Questionnaire = JSON.parse(result[0].Questionnaire);
      var Result = {};
      let totalScore = 0;
      for (const sectionName in Questionnaire) {
        if (sectionName.startsWith('Section')) {
          const section = Questionnaire[sectionName];
          const answers = answerScript[sectionName];
          let sectionScore = 0;
          for (const questionName in section) {
            if (questionName !== 'MaxScore') {
              const question = section[questionName];
              const answer = answers[questionName];
              if (answer && answer.correctOption === question.answer) {
                sectionScore += parseInt(question.point);
              }
            }
          }

          Result[sectionName] = sectionScore;
          console.log("section Score:", sectionScore);
          totalScore += sectionScore;
        }
      }
      let resultLabel;
      var cutOff = parseInt(Questionnaire['Cutoff']);
      var maxMarks = parseInt(Questionnaire['TotalScore']);
      var currentPercentage = ((totalScore / maxMarks) * 100).toFixed(0);
      Result.SecuredPercentage = currentPercentage;
      var message = "";
      if (currentPercentage >= cutOff) {
        resultLabel = "Cleared";
        message = "Congratulations You Passed with FLying Colours";
      } else {
        resultLabel = "Not Cleared"
        message = "Unfortunately, you have not met the passing criteria for the exam.";
      }
      Result.TotalScore = totalScore;
      Result.Message = message;
      Result.Result=resultLabel;
      const inputData = {
        AssessmentID: req.body.AssessmentID,
        answerscript: JSON.stringify(answerScript),
        obtainedmarks: JSON.stringify(Result),
        employeeid: req.session.UserID,
        date: CurrentDate,
        remarks: req.body.AssessmentRemarks
      };
      db.query('INSERT INTO responces  set?', [inputData], function (error, result) {
        if (error) throw error
      });
      res.render('Employees/Result', { Result: Result });
    });
  } else {
    res.send
  }
});
app.get("/viewResultBoard", (req, res) => {
  if (req.session.UserID) {
    let ConsolidatedResult = [];
    let result = {};
    db.query("select * from responces where employeeid=?", [req.session.UserID], function (error, resultOne) {
      if (error) throw error
      if (resultOne.length > 0) {
        let counter = 0;
        resultOne.forEach(record => {
          db.query("select * from assessments where AssessmentID=?", [record.AssessmentID], function (error, resultTwo) {
            if (error) throw error;
            result = {};
            result.Date = formatDateString(record.date);
            result.AssessmentName = resultTwo[0].AssessmentName;
            result.TotalScore = resultTwo[0].MaximumScore;
            let temp = JSON.parse(resultTwo[0].Questionnaire);
            result.cutOff = temp.Cutoff;
            temp = JSON.parse(record.obtainedmarks);
            result.SecuredMarks = temp.TotalScore;
            result.Message = temp.Message;
            result.remarks = record.remarks;
            result.Result=temp.Result;
            result.percentage = temp.SecuredPercentage;
            result.detailedResult = record.obtainedmarks;
            ConsolidatedResult.push(result);
            counter++;
            if (counter === resultOne.length) {
              res.render("Employees/ResultBoard", { Data: ConsolidatedResult });
            }
          });
        });
      } else {
        res.render("Employees/ResultBoard", { Data: ConsolidatedResult });
      }
    });
  } else {
    res.redirect('/login');
  }
});

app.post('/api/uploadImage', (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    } else {
      res.send(res.req.file.filename);
    }
  });
});
app.get('/result', (req, res) => {
  res.render('Employees/Result', { Result: "ok" })
});
app.get('/Error', (req, res) => {
  res.render('error');
});

app.get('*', (req, res) => {
  res.render('login', { "message": "Succes" })
});
function formatDateString(dateString) {
  const date = new Date(dateString);
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
  const formattedDate = date.toLocaleString('en-US', options);
  return formattedDate;
}