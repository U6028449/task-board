// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));
let taskForm = $("#task-form");
// Todo: create a function to generate a unique task id
function generateTaskId() {
const allPossibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const idLength = 25;
let taskId = "";
for (let i = 0; i < idLength; i++) {
    taskId += allPossibleChars.charAt(Math.floor(Math.random() * allPossibleChars.length));
 }
  return taskId;
}
console.log (generateTaskId());

// Todo: create a function to create a task card
function createTaskCard(task) {
  const taskCard = $('<div>')
    .addClass('card draggable my-2')
    .attr('id', task.id)
    .attr('data-task-id', task.id);
  const cardHeader = $('<div>').addClass('card-header h5 ').text(task.name);
  const cardBody = $('<div>').addClass('card-body');
  const taskDescription = $('<p>').addClass('card-text').text(task.description);
  const taskDueDate = $('<p>').addClass('card-text').text(task.dueDate); 
  const cardDeleteBtn = $('<button>')
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('data-task-id', task.id);
  cardDeleteBtn.on('click', handleDeleteTask);

    if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

    if (now.isSame(taskDueDate, 'day')) {
      cardHeader.addClass('bg-warning bg-opacity-50 text-white');
    } else if (now.isAfter(taskDueDate)) {
      cardHeader.addClass('bg-danger bg-opacity-50 text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }
  cardBody.append(taskDescription, taskDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  return taskCard;
}

// renderTaskList();
function renderTaskList() {
  $('#to-do-cards').empty();
  $('#in-progress-cards').empty();
  $('#done-cards').empty();

  taskList = JSON.parse(localStorage.getItem("tasks"));
  taskList.forEach(task => {
    const taskCard = createTaskCard(task);
    console.log(task.status)
    $(`#${task.status}-cards`).append(taskCard);
  });
  
  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    helper: 'original',
  });
}

function readTasksFromStorage() {
  let tasks = JSON.parse(localStorage.getItem('tasks'));
  if (!tasks) {
    tasks = [];
  }
  return tasks;
}

function saveTasksToStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function handleAddTask(event){
  event.preventDefault();
  let task = {
      id: generateTaskId(),
      name: $('#task-name').val(),
      description: $('#task-description').val(),
      dueDate: $('#due-date').val(),
      status: 'to-do'
  };
  const tasks = readTasksFromStorage();
  tasks.push(task);
  saveTasksToStorage(tasks);

  let taskCard = createTaskCard(task);
  $('#to-do-cards').append(taskCard);
  taskCard.draggable({
    opacity: 0.7,
    zIndex: 100,
    helper: function (e) {
      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
    cancel: '.delete'
  });
  $('form').trigger('reset');
}
  
function handleDeleteTask(event){
  let taskId = $(event.target).attr('data-task-id');
  $(`#${taskId}`).remove(); 
  let tasks = readTasksFromStorage('tasks');
  let filteredTasks = tasks.filter(task => task.id !== taskId);
  saveTasksToStorage(filteredTasks);
}

function handleDrop(event, ui) {
  const tasks = readTasksFromStorage();
  const taskId = ui.draggable[0].dataset.taskId;
  const newStatus = $(this).closest('.lane').attr('id');
  
  for (let task of tasks) {
    if (task.id === taskId) {
      task.status = newStatus;
    }
  }
  saveTasksToStorage(tasks);
  
  ui.draggable.detach().appendTo(`#${newStatus}-cards`);
}

let today = dayjs().format();
console.log(today); // Outputs the current date and time

  $(document).ready(function () {
    renderTaskList();
    $('#task-form').submit(handleAddTask);
taskForm.on('submit', handleAddTask);
$('.lane').droppable({
  accept: '.draggable',
  drop: handleDrop,
});
  });