SELECT * from userlogin;
SELECT * from responces;
SELECT * from assessments;
delete from responces where responces.idresponces=5;
ALTER TABLE responces rename column assesmentid to AssessmentID;
ALTER TABLE assessments rename column assementName to AssessmentName;