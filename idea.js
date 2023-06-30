const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'username',
  password: 'password',
  database: 'database_name'
});

app.post('/submit-questionnaire', (req, res) => {
  const questionnaire = [];
  const { body } = req;
  const keys = Object.keys(body);

  keys.forEach((key) => {
    if (key.includes('question')) {
      const question = body[key];
      const options = [];
      const optionKeys = Object.keys(body).filter((k) => k.includes(key) && k !== key);

      optionKeys.forEach((optionKey) => {
        options.push(body[optionKey]);
      });

      const selectedAnswer = body[key];

      questionnaire.push({
        question,
        options,
        selectedAnswer
      });
    }
  });

  const query = `INSERT INTO questionnaires (questionnaire) VALUES ('${JSON.stringify(questionnaire)}')`;

  connection.query(query, (error, results, fields) => {
    if (error) throw error;
    res.send('Questionnaire submitted successfully!');
  });
});
