var tasks = {};

var createTask = function (taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>").addClass("m-1").text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function () {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: [],
    };
  }

  // loop over object properties
  $.each(tasks, function (list, arr) {
    // then loop over sub-array
    arr.forEach(function (task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

//on click of a "p" element inside of the element with the class of ".list-group"
$(".list-group").on("click", "p", function () {
  //set variable text to "this.text.trim" "this" is the current event target, so in this case the "p" element, .text() return the text content, trim() removes white space
  var text = $(this).text().trim();
  //set variable text input to a new <textarea> with the a new class and a value of the text variable
  var textInput = $("<textarea>").addClass("form-control").val(text);
  //replace "this" with textInput
  $(this).replaceWith(textInput);
  //when textInput is clicked trigger the "focused state"
  textInput.trigger("focus");
});

// when a textarea inside of the .list group element is "blurred", blur" will trigger as soon as the user interacts with anything other than the <textarea> element
$(".list-group").on("blur", "textarea", function () {
  //"this" now refers to the textarea since it is the target of the event
  // get the textarea's current value/text
  var text = $(this).val().trim();
  // get the parent ul's id attribute
  //closest "bubbles up" and looks for the closest element with the specified class, then gets the attribute of that class with the name "id", then replace() replaces the value of the id
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");

  // gets the index of the target(textarea) in relation to the parent .list-group-item
  var index = $(this).closest(".list-group-item").index();
  //use all the previous variables to index into the tasks object. Note: tasks is an object of arrays
  //status = "toDo", index = 0 and text = the input into the textarea
  tasks[status][index].text = text;
  saveTasks();
  // recreate p element ad a class and then the text
  var taskP = $("<p>").addClass("m-1").text(text);

  // replace textarea with p element variable
  $(this).replaceWith(taskP);
});

// due date was clicked
$(".list-group").on("click", "span", function () {
  // get current text
  var date = $(this).text().trim();

  // create new input element set attribute to type then a value of text then add a class and set the value to current text (date)
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // automatically focus on new element
  dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("blur", "input[type='text']", function () {
  // get current text
  var date = $(this).val().trim();

  // get the parent ul's id attribute
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this).closest(".list-group-item").index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function () {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate,
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();

// array to store the task data in
var tempArr = [];

//selecting all elements with a class of .list-group inside of elements with a class of .card then call the sortable() function
$(".card .list-group").sortable({
  //sortable turns every element into a sortable list with the class of list group. the connectWith: property links the elements together
  connectWith: $(".card .list-group"),

  scroll: false,
  tolerance: "pointer",

  //helper creates a copy of the dragged item so click events do not fire
  helper: "clone",

  // activate: function (event) {
  //   console.log("activate", this);
  // },
  // deactivate: function (event) {
  //   console.log("deactivate", this);
  // },
  // over: function (event) {
  //   console.log("over", event.target);
  // },
  // out: function (event) {
  //   console.log("out", event.target);
  // },
  //update fires when the contents of a element has changed
  update: function (event) {
    // loop over current set of children in sortable list
    $(this)
      .children()
      .each(function () {
        //get the p element of the current target (in this case its li) and get the text Note: the p is the to do task
        var text = $(this).find("p").text().trim();
        //get the span element of the current target (in this case its li) and get the text Note the span is the date
        var date = $(this).find("span").text().trim();

        //add span and p tag to object then add to the temp array
        tempArr.push({
          text: text,
          date: date,
        });
      });
    // trim down list's ID to match object property
    var arrName = $(this).attr("id").replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  },
});

//select the element with the id trash, then add the droppable method on it,then call a callback function
$("#trash").droppable({
  //accept controls which draggable items are "accepted" my the droppable in this case the ul
  accept: ".card .list-group-item",
  //Specifies which mode to use for testing whether a draggable is hovering over a droppable Note: test touch vs fit 
  tolerance: "touch",
  //UI is an jquery object that we can reference 
  drop: function (event, ui) {
    console.log("drop");
    ui.draggable.remove();
  },
  over: function (event, ui) {
    console.log("over");
  },
  out: function (event, ui) {
    console.log("out");
  },
});
