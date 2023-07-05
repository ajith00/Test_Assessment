//const { json } = require("body-parser");

//const { name } = require("ejs");

var sectionCounter = 2;
var activeSection = 1;

$(document).ready(function () {
  const currentDate = new Date().toISOString().split('T')[0];
  if (document.getElementById('AssessmentDate')) {
    document.getElementById("AssessmentDate").setAttribute("min", currentDate);
  }

  let questionCounter = 1;
  $('#Add_MCQ_Button').click(function () {
    const questionHtml = `
      <div class="question" data-question="${questionCounter}">
      <div class="row justify-content-end">
      <button type="button" class="btn btn-danger btn-close removeQuestionBtn" data-question="${questionCounter}" aria-label="Close"></button>
    </div>
        <h3>Question${questionCounter}</h3>
        <div>
        <!--<label class="form-label" for="question${questionCounter}">Question:${questionCounter}</label>-->
          <textarea class="form-control" name="section[${activeSection}]question[${questionCounter}][question]" id="question${questionCounter}" cols="90" rows="1" wrap="soft" spellcheck="true" required></textarea>
        </div>
        <div class="options">
        <div class="d-flex justify-content-between align-items-end m-2 p-1">
        <div><p>Choose the Correct Answer,
        After filling up the options</p>
        </div>
        <div >
        <label for="imageInput${questionCounter}" class="form-label">Attach an Image</label>
        <input class="form-control" type="file" id="imageInput${questionCounter}" name="myQCImage" onchange="uploadImage(this,'section[${activeSection}]question[${questionCounter}][referenceImage]','section[${activeSection}]question[${questionCounter}][uploadedImage]');">
         <input type="hidden" name="section[${activeSection}]question[${questionCounter}][referenceImage]" id="section[${activeSection}]question[${questionCounter}][referenceImage]" readonly>
        </div>
        <div>
        <img id="section[${activeSection}]question[${questionCounter}][uploadedImage]"  class="img-thumbnail" height="100" width="100" onclick="ExpandImage(this)" src="" alt="Uploaded Image" style="display:none" data-bs-toggle="modal" data-bs-target="#Image_Model"/>
        </div>
        <div class=" input-group mb-3" style="width: max-content;">
        <span class="input-group-text" for="score${questionCounter}">Points</span>
        <input type="number" class="form-control" id="score${questionCounter}" name="section[${activeSection}]question[${questionCounter}][score]" min="1" max="50" onchange="UpdateTotalPoints()" required>
        </div>
        </div>
          <div>
            <label  class="form-label" for="option1_${questionCounter}">
              <input type="radio" class="form-check-input" name="section[${activeSection}]question[${questionCounter}][correctOption]" value="1" onclick="setAnswer(this,'mcq')" required>
              Option 1:
            </label>
            <input type="text" class="form-control " name="section[${activeSection}]question[${questionCounter}][option1]" id="option1_${questionCounter}" required>
          </div>
          <div>
            <label class="form-label" for="option2_${questionCounter}">
              <input type="radio" class="form-check-input" name="section[${activeSection}]question[${questionCounter}][correctOption]" value="2" onclick="setAnswer(this,'mcq')" required>
              Option 2:
            </label>
            <input type="text" class="form-control " name="section[${activeSection}]question[${questionCounter}][option2]" id="option2_${questionCounter}" required>
          </div>
          <div>
            <label class="form-label" for="option3_${questionCounter}">
              <input type="radio" class="form-check-input" name="section[${activeSection}]question[${questionCounter}][correctOption]" value="3" onclick="setAnswer(this,'mcq')" required>
              Option 3:
            </label>
            <input type="text" class="form-control " name="section[${activeSection}]question[${questionCounter}][option3]" id="option3_${questionCounter}" required>
          </div>
          <div>
            <label class="form-label" for="option4_${questionCounter}">
              <input type="radio" class="form-check-input" name="section[${activeSection}]question[${questionCounter}][correctOption]" value="4" onclick="setAnswer(this,'mcq')" required>
              Option 4:
            </label>
            <input type="text" class="form-control " name="section[${activeSection}]question[${questionCounter}][option4]" id="option4_${questionCounter}" required>
          </div>
        </div>
        <input type="hidden" name="section[${activeSection}]question[${questionCounter}][answer]" id="answer${questionCounter}" requited readonly>
        <input type="hidden" name="section[${activeSection}]question[${questionCounter}][questionType]" id="questionType${questionCounter}" value="MCQ" readonly>
      </div>`;
    $('#questionsContainer' + activeSection).append(questionHtml);
    questionCounter++;
    updateQuestionNumbers();
  });


  $('#Add_Boolean_Button').click(function () {
    const questionHtml = `
      <div class="question" data-question="${questionCounter}">
      <div class="row justify-content-end">
      <button type="button" class="btn btn-danger btn-close removeQuestionBtn" data-question="${questionCounter}" aria-label="Close"></button>
    </div>
        <h3>Question${questionCounter}</h3>
        <div>
        <!--<label class="form-label" for="question${questionCounter}">Question:${questionCounter}</label>-->
          <textarea class="form-control" name="section[${activeSection}]question[${questionCounter}][question]" id="question${questionCounter}" cols="90" rows="1" wrap="soft" spellcheck="true" required></textarea>
        </div>
        <div class="options">
        <div class="d-flex justify-content-between align-items-center m-2 p-1">
        <div><p>Choose the Correct Answer.</p>
        </div>
        <div>
        <label for="imageInput${questionCounter}" class="form-label">Attach an Image</label>
        <input class="form-control" type="file" id="imageInput${questionCounter}" name="myQCImage" onchange="uploadImage(this,'section[${activeSection}]question[${questionCounter}][referenceImage]','section[${activeSection}]question[${questionCounter}][uploadedImage]');">
         <input type="hidden" name="section[${activeSection}]question[${questionCounter}][referenceImage]" id="section[${activeSection}]question[${questionCounter}][referenceImage]" readonly>
        </div>
        <div>
        <img id="section[${activeSection}]question[${questionCounter}][uploadedImage]"  class="img-thumbnail" height="100" width="100" onclick="ExpandImage(this)" src="" alt="Uploaded Image" style="display:none" data-bs-toggle="modal" data-bs-target="#Image_Model"/>
        </div>
        <div class=" input-group mb-3" style="width: max-content;">
        <span class="input-group-text" for="score${questionCounter}">Points</span>
        <input type="number" class="form-control" id="score${questionCounter}" name="section[${activeSection}]question[${questionCounter}][score]" min="1" max="50" onchange="UpdateTotalPoints()" required>
        </div>

        </div>
          <div>
            <label  class="form-label" for="option1_${questionCounter}">
              <input type="radio" class="form-check-input" name="section[${activeSection}]question[${questionCounter}][correctOption]" value="True" onclick="setAnswer(this,'boolean')" required>
              Option 1: True
            </label>
          </div>
          <div>
            <label class="form-label" for="option2_${questionCounter}">
              <input type="radio" class="form-check-input" name="section[${activeSection}]question[${questionCounter}][correctOption]" value="False" onclick="setAnswer(this,'boolean')" required>
              Option 2: False
            </label>
          </div>
        </div>
        <input type="hidden" name="section[${activeSection}]question[${questionCounter}][answer]" id="answer${questionCounter}" requited readonly>
        <input type="hidden" name="section[${activeSection}]question[${questionCounter}][questionType]" id="questionType${questionCounter}" value="Boolean" readonly>
      </div>`;
    $('#questionsContainer' + activeSection).append(questionHtml);
    questionCounter++;
    updateQuestionNumbers();
  });


  $('#Add_Section_Button').click(function () {
    const sectionHTML = `<div class="accordion section mySection" id="accordionSection${sectionCounter}"  onclick="updateActiveSheet(this)" data-section="${sectionCounter}"">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#section${sectionCounter}"
          aria-expanded="true" aria-controls="section${sectionCounter}">
          <input type="text" class="form-control bg-light-subtle border border-light-subtle rounded-pill w-25" name="SectionName${sectionCounter}" id="" placeholder="Please enter the section-${sectionCounter} name" required>
          <p class="container px-1 mb-1 text-center">Max-Points:&nbsp;<b><span class="sectionScore" id="sectionScore${sectionCounter}">0</b></span></p>
        </button>
      </h2>
      <div id="section${sectionCounter}" class="accordion-collapse collapse show" data-bs-parent="#accordionSection${sectionCounter}">
        <div class="accordion-body" id="questionsContainer${sectionCounter}">
        </div>
      </div>
      <div class="container px-1 mb-1 text-center">
      <button type="button" class="btn btn-outline-info rounded-pill" data-bs-toggle="modal" data-bs-target="#AddNewItem">
        Add <i class="bi bi-plus-circle"></i>
      </button>
      <button type="button" class="btn mb-1 btn-outline-danger rounded-pill removeSectionBtn" data-bs-toggle="modal" data-section="${sectionCounter}">
      Delete <i class="bi bi-trash3"></i>
    </button>
      </div>
    </div>
  </div>`;
    $('#main').append(sectionHTML);
    sectionCounter++;
    activeSection = sectionCounter;
  });

  $(document).on('click', '.removeQuestionBtn', function () {
    const questionNumber = $(this).data('question');
    $(`div.question[data-question="${questionNumber}"]`).remove();
    questionCounter--;
    updateQuestionNumbers();
  });

  $(document).on('click', '.removeSectionBtn', function () {
    const sectionNumber = $(this).data('section');
    console.log(sectionNumber);
    if(confirm("Are you sure you want to delete this section...?") && sectionCounter>2){
      $(`div.section[data-section="${sectionNumber}"]`).remove();
      sectionCounter--;
      updateSectionNumbers();
      updateQuestionNumbers();
    }

  });
});


function setAnswer(option, type) {
  if (type == 'mcq') {
    document.getElementById("answer" + option.name[19]).value = document.getElementById("option" + option.value + "_" + option.name[19]).value;
  } else if (type == 'boolean') {
    document.getElementById("answer" + option.name[19]).value = option.value;
  }
}

function updateActiveSheet(e) {
  var elem_id = e.id;
  activeSection = elem_id.replace(/[^0-9]/g, '');
}

function updateQuestionNumbers() {
  $('.question').each(function (index) {
    const newQuestionNumber = index + 1;

    $(this).attr('data-question', newQuestionNumber);
    $(this).find('h3').text(`Question ${newQuestionNumber}`);

    //$(this).find('label[for^="question"]').attr('for', `question${newQuestionNumber}`);
    // $(this).find('input[name^="question"]').attr('name', `question[${newQuestionNumber}][question]`);
    //$(this).find('input[id^="question"]').attr('id', `question${newQuestionNumber}`);

    $(this).find('textarea[name^="section"]textarea[name*="question"]').attr('name', `section[${activeSection}]question[${newQuestionNumber}][question]`);

    $(this).find('textarea[name^="question"]').attr('id', `question[${newQuestionNumber}]`);

    $(this).find('input[type="number"]').attr('name', `section[${activeSection}]question[${newQuestionNumber}][score]`);

    $(this).find('.options label[for^="option"]').each(function () {
      const optionNumber = $(this).attr('for').match(/\d+/)[0];
      $(this).attr('for', `option${optionNumber}_${newQuestionNumber}`);
    });

    $(this).find('.options input[id^="option"]').each(function () {
      const optionNumber = $(this).attr('id').match(/\d+/)[0];
      $(this).attr('id', `option${optionNumber}_${newQuestionNumber}`);
    });

    $(this).find('.options input[name^="section"][type="text"]input[name*="option"]').each(function () {
      const optionNumber = $(this).attr('name').match(/\d+/gi).map(Number)[2];
      $(this).attr('name', `section[${activeSection}]question[${newQuestionNumber}][option${optionNumber}]`);
    });
    $(this).find('.options input[name^="section"][type="radio"]input[name*="correctOption"]').each(function () {
      const optionNumber = $(this).attr('name').match(/\d+/gi).map(Number)[1];
      $(this).attr('name', `section[${activeSection}]question[${newQuestionNumber}][correctOption]`);
    });

    $(this).find('input[name^="section"]input[name*="answer"]').attr('name', `section[${activeSection}]question[${newQuestionNumber}][answer]`);
    $(this).find('input[id^="answer"]').attr('id', `answer${newQuestionNumber}`);

    $(this).find('input[name^="section"]input[name*="questionType"]').attr('name', `section[${activeSection}]question[${newQuestionNumber}][questionType]`);
    $(this).find('input[id^="questionType"]').attr('id', `questionType${newQuestionNumber}`);

    $(this).find('.removeQuestionBtn').attr('data-question', newQuestionNumber);
  });
}

function updateSectionNumbers(){
  $('.mySection').each(function (index) {
    const newSectionCounter = index + 1;
    // Update section ID
    $(this).attr('id', 'accordionSection' + newSectionCounter);
    $(this).attr('data-section', newSectionCounter);
    // Update section data attribute

    $(this).find('.accordion-button').attr('data-bs-target', '#section' + newSectionCounter);
    $(this).find('.accordion-button').attr('aria-controls', 'section' + newSectionCounter);

    // Update input placeholder
    $(this).find('input').attr('placeholder', 'Please enter the section-' + newSectionCounter + ' name');
    // Update Max-Points ID
    $(this).find('.sectionScore').attr('id', 'sectionScore' + newSectionCounter);
    
    // Update data-bs-parent attribute
    $(this).find('.accordion-collapse').attr('data-bs-parent', '#accordionSection' + newSectionCounter);
    $(this).find('.accordion-collapse').attr('id', 'section' + newSectionCounter);

    // Update questionsContainer ID
    $(this).find('.accordion-body').attr('id', 'questionsContainer' + newSectionCounter);

    $(this).find('.removeSectionBtn').attr('data-section', newSectionCounter);
});
}

function submitForm() {
  var formData = {};
  var sections = document.querySelectorAll('.section');
  let i = 1;
  formData.Title = document.getElementById("AssessmentTitle").value;
  formData.Description = document.getElementById("AssessmentDescriptinon").value;
  formData.Date =  document.getElementById("AssessmentDate").value;
  formData.Duration = document.getElementById("AssessmentDuration").value;
  formData.Cutoff = document.getElementById("AssessmentCutoff").value;

  let TotalScore = 0;
  sections.forEach(function (section) {
    var sectionData = {};
    var sectionId = "Section" + i;
    var SectionWiseMarks = 0;
    sectionData.SectionName = section.querySelector('input[type="text"][name*="SectionName"]').value;
    var questions = section.querySelectorAll('.question');
    let j = 1;
    questions.forEach(function (question) {
      var questionData = {};
      var questionID = "Question" + j;
      questionData.question = question.querySelector('textarea').value;
      let ImageLoc = question.querySelector('input[type="hidden"][name*="referenceImage"]').value;
      if (ImageLoc.length > 1) {
        questionData.referenceImage = ImageLoc;
      }
      var type = question.querySelector('input[type="hidden"][name*="questionType"]').value;
      if (type == 'MCQ') {
        var options = question.querySelectorAll('input[type="text"]');
      } else if (type == 'Boolean') {
        var options = question.querySelectorAll('input[type="radio"]');
      }

      var optionData = {}, k = 1;
      options.forEach(function (option) {
        var optionID = "Option" + k;
        optionData[optionID] = option.value;
        k++;
      });
      var correctOption = question.querySelector('input[type="radio"][name*="correctOption"]:checked');
      var correctValue = correctOption ? correctOption.value : null;
      var answer = question.querySelector('input[type="hidden"][name*="answer"]').value;
      var point = question.querySelector('input[type="number"][name*="score"]').value;
      SectionWiseMarks += parseInt(point);
      questionData.type = type;
      questionData.point = point;
      questionData.answer = answer;
      questionData.options = optionData;
      questionData.correctOption = correctValue;
      sectionData[questionID] = questionData;
      j++;
    });
    sectionData.MaxScore = SectionWiseMarks;
    TotalScore += SectionWiseMarks;
    formData[sectionId] = sectionData;
    i++
  });
  formData.TotalScore = TotalScore;
  document.getElementById("JsonFormData").value = JSON.stringify(formData);
  console.log(formData);
  document.getElementById("questionnaire").submit();
}

function SubmitAssessment() {
  let answerData = {};
  let sections = document.querySelectorAll('.section');
  let i = 1;
  answerData.AssessmentID = document.getElementById("AssessmentID").value;
  answerData.Remarks = document.getElementById("AssessmentRemarks").value;
  sections.forEach(function (section) {
    var sectionData = {};
    var sectionId = "Section" + i;
    var questions = section.querySelectorAll('.questionn');
    let j = 1;
    questions.forEach(function (question) {
      var questionData = {};
      var questionID = "Question" + j;
      questionData.question = question.querySelector('textarea').value;
      var correctOption = question.querySelector('input[type="radio"]:checked');
      var correctValue = correctOption ? correctOption.value : null;
      questionData.correctOption = correctValue;
      sectionData[questionID] = questionData;
      j++;
    });
    answerData[sectionId] = sectionData;
    i++
  });
  document.getElementById("JsonFormData").value = JSON.stringify(answerData);
  document.getElementById("answerScript").submit(); 
}


function enterFullScreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();     // Firefox
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();  // Safari
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();      // IE/Edge
  }
};

function uploadImage(e, NewLocFieldId, NewImageLoc) {
  const fileInput = document.getElementById(e.id);
  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('myQCImage', file);
  axios.post('/api/uploadImage', formData)
    .then(response => {
      document.getElementById(NewLocFieldId).value = response.data;
      displayImage(file, NewImageLoc);
    })
    .catch(error => {
      console.error(error);
    });
}

function displayImage(file, NewImageLoc) {
  const reader = new FileReader();
  reader.onload = function () {
    const uploadedImage = document.getElementById(NewImageLoc);
    uploadedImage.src = reader.result;
    uploadedImage.style.display="block";
  };
  reader.readAsDataURL(file);
}

function ExpandImage(e) {
  var modalImg = document.getElementById("img01");
  modalImg.src = e.src;
}

function UpdateTotalPoints() {
  let sections = document.querySelectorAll('.section');
  let i = 1, total = 0;
  sections.forEach(function (section) {
    let SectionWiseMarks = 0;
    let questions = section.querySelectorAll('.question');
    questions.forEach(function (question) {
      let point = question.querySelector('input[type="number"][name*="score"]').value;
      if (parseInt(point) > 0) {
        SectionWiseMarks += parseInt(point);
      }
    });
    section.querySelector('span[id*="sectionScore"]').innerHTML = SectionWiseMarks;
    total += SectionWiseMarks;
  });
  if (total > 0) {
    document.getElementById("AssessmentTotalMarks").value = total;
  } else {
    alert("Invalid Points...!");
  }
}


document.addEventListener('keydown', function (e) {
  console.log(e);
  if (e.shiftKey && e.ctrlKey && e.code == 'KeyI') {
    e.preventDefault();
  }
  if (e.code == "Escape") {
    e.preventDefault();
  }
});