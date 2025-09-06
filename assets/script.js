
/* Storage */

const LS_NOTES = 'full-feature-notes';
const LS_TODO  = 'full-feature-todo';

function loadNotes(){ const raw = localStorage.getItem(LS_NOTES); return raw ? JSON.parse(raw) : []; }
function saveNotes(data){ localStorage.setItem(LS_NOTES, JSON.stringify(data)); }

function loadTodo(){ const raw = localStorage.getItem(LS_TODO); return raw ? JSON.parse(raw) : []; }
function saveTodo(data){ localStorage.setItem(LS_TODO, JSON.stringify(data)); }

/* Note section */

let noteSections = loadNotes();

const notesContainer = document.getElementById('note-sections');

function buildSection(section){
  const secDiv = document.createElement('div');
  secDiv.className = 'note-section';
  secDiv.dataset.id = section.id;

  const header = document.createElement('div');
  header.className = 'section-header';
  header.innerHTML = `
    <span class="section-title" contenteditable="true">${section.title}</span>
    <span class="toggle-icon">▾</span>
    <button class="delete-section" title="Delete section">✕</button>
  `;
  secDiv.appendChild(header);

  const body = document.createElement('div');
  body.className = 'section-body';
  if(section.expanded) body.classList.add('show');
  body.innerHTML = `
    <div class="toolbar">
      <button class="add-heading">Add Heading</button>
      <button class="add-hr">Add Divider</button>
      <button class="bold">Bold</button>
      <button class="italic">Italic</button>
    </div>
    <div class="editor" contenteditable="true"></div>
  `;
  secDiv.appendChild(body);

  const editor = body.querySelector('.editor');
  editor.innerHTML = section.html || '';

  header.addEventListener('click', e=>{
    if(e.target.classList.contains('section-title') ||
       e.target.classList.contains('delete-section')) return;
    const nowOpen = body.classList.toggle('show');
    secDiv.classList.toggle('collapsed', !nowOpen);
    section.expanded = nowOpen;
    saveNotes(noteSections);
  });

  header.querySelector('.delete-section')
      .addEventListener('click', e => {
        e.stopPropagation();               

        noteSections = noteSections.filter(s => s.id !== section.id);
        saveNotes(noteSections);

        renderAllNotes();

        const firstEditor = document.querySelector('.editor');
        if (firstEditor) {
          firstEditor.focus();
        } else {

          document.getElementById('new-section-button').focus();
        }
      });


  const titleEl = header.querySelector('.section-title');
  titleEl.addEventListener('input', ()=>{
    section.title = titleEl.textContent.trim() || 'Untitled';
    saveNotes(noteSections);
  });

  const toolbar = body.querySelector('.toolbar');

  function placeCaretAfter(node){
    const range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  toolbar.querySelector('.add-heading').addEventListener('click',()=>{
    const h = document.createElement('h3');
    h.textContent = 'New note';
    editor.appendChild(h);
    placeCaretAfter(h);
    editor.focus();
  });

  toolbar.querySelector('.add-hr').addEventListener('click',()=>{
    const hr = document.createElement('hr');
    editor.appendChild(hr);
    placeCaretAfter(hr);
    editor.focus();
  });

  toolbar.querySelector('.bold').addEventListener('click',()=> document.execCommand('bold'));
  toolbar.querySelector('.italic').addEventListener('click',()=> document.execCommand('italic'));

  editor.addEventListener('input',()=> {
    section.html = editor.innerHTML;
    saveNotes(noteSections);
  });

  return secDiv;
}

function renderAllNotes(){
  notesContainer.innerHTML = '';
  noteSections.forEach(sec=> notesContainer.appendChild(buildSection(sec)));
}

function addNewSection(){
  const newSec = {
    id: Date.now().toString(),
    title: 'New Section',
    html: '',
    expanded: true
  };
  noteSections.push(newSec);
  saveNotes(noteSections);
  notesContainer.appendChild(buildSection(newSec));
  const newEditor = notesContainer.lastElementChild.querySelector('.editor');
  if(newEditor) newEditor.focus();
}

document.getElementById('new-section-button')
        .addEventListener('click', addNewSection);

renderAllNotes();

/* To-do */

let todoItems = loadTodo();   

const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-button');
const tasksUl   = document.getElementById('tasks');

function createTaskItem(item){
  const li = document.createElement('li');

  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.checked = item.done;
  cb.addEventListener('change',()=>{
    item.done = cb.checked;
    li.classList.toggle('completed', item.done);
    saveTodo(todoItems);
  });

  const label = document.createElement('label');
  label.textContent = item.text;

  const rm = document.createElement('button');
  rm.textContent = '✕';
  rm.className = 'remove-button';
  rm.title = 'Remove';
  rm.addEventListener('click',()=>{
    todoItems = todoItems.filter(t=>t.id!==item.id);
    saveTodo(todoItems);
    li.remove();
  });

  li.append(cb, label, rm);
  if(item.done) li.classList.add('completed');
  return li;
}

function renderTodo(){
  tasksUl.innerHTML = '';
  todoItems.forEach(it=> tasksUl.appendChild(createTaskItem(it)));
}

addTaskBtn.addEventListener('click',()=>{
  const txt = taskInput.value.trim();
  if(!txt) return;
  const newItem = {id:Date.now().toString(), text:txt, done:false};
  todoItems.push(newItem);
  saveTodo(todoItems);
  tasksUl.appendChild(createTaskItem(newItem));
  taskInput.value = '';
  taskInput.focus();
});

taskInput.addEventListener('keypress', e=>{ if(e.key==='Enter') addTaskBtn.click(); });

renderTodo();