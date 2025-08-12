const SUPABASE_URL = 'https://ywcmkpgdlecbxaqrlxsb.supabase.co'
const SUPABASE_ANON_KEY = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Y21rcGdkbGVjYnhhcXJseHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NjA4MjMsImV4cCI6MjA2ODUzNjgyM30.qwB5vCSvzHgSwIp2EncfLNXQ_kmLc5DA57fG7AeoK3g`
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
console.log(client);

const taskInput = document.getElementById('taskInput')
const addTaskBtn = document.getElementById('addTaskBtn')
const taskList = document.getElementById('taskList')

let editMode = false
let editTaskId = null

// Enable/disable Add button based on input
taskInput.addEventListener('input', () => {
  addTaskBtn.disabled = !taskInput.value.trim()
})

window.addEventListener('DOMContentLoaded', fetchTasks)

addTaskBtn.addEventListener('click', () => {
  if (editMode) {
    updateTask()
  } else {
    addTask()
  }
})

taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && taskInput.value.trim()) {
    if (editMode) {
      updateTask()
    } else {
      addTask()
    }
  }
})

async function fetchTasks() {
  const { data: tasks, error } = await client
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tasks:', error)
    return
  }

  taskList.innerHTML = ''
  tasks.forEach(renderTask)
  resetInput()
}

function renderTask(task) {
  const li = document.createElement('li')
  li.className = task.is_complete ? 'completed' : ''
  li.dataset.id = task.id

  const createdAt = new Date(task.created_at)
  const formattedDate = createdAt.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  li.innerHTML = `
    <div class="task-left" onclick="toggleComplete('${task.id}', ${task.is_complete})" title="Toggle complete">
      <div class="checkbox"></div>
      <div class="task-text">${escapeHtml(task.task)}</div>
    </div>

    <div class="task-actions">
      <button class="edit-btn" title="Edit task" onclick="startEdit('${task.id}', '${escapeQuotes(task.task)}')">✏️</button>
      <button class="delete-btn" title="Delete task" onclick="deleteTask('${task.id}')">🗑️</button>
    </div>

    <div class="task-time">Added on: ${formattedDate}</div>
  `

  taskList.appendChild(li)
}

function escapeQuotes(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"')
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, function(m) { return map[m] })
}

async function addTask() {
  const task = taskInput.value.trim()
  if (!task) return

  addTaskBtn.disabled = true

  const { error } = await client
    .from('todos')
    .insert([{ task }])

  addTaskBtn.disabled = false

  if (error) {
    console.error('Error adding task:', error)
    return
  }

  fetchTasks()
}

function startEdit(id, taskText) {
  editMode = true
  editTaskId = id
  taskInput.value = taskText
  taskInput.focus()
  addTaskBtn.textContent = 'Update'
  addTaskBtn.disabled = false
}

async function updateTask() {
  const task = taskInput.value.trim()
  if (!task || !editTaskId) return

  addTaskBtn.disabled = true

  const { error } = await client
    .from('todos')
    .update({ task })
    .eq('id', editTaskId)

  addTaskBtn.disabled = false

  if (error) {
    console.error('Error updating task:', error)
    return
  }

  resetInput()
  fetchTasks()
  alert('Task status updated successfully')
}

function resetInput() {
  editMode = false
  editTaskId = null
  taskInput.value = ''
  addTaskBtn.textContent = 'Add'
  addTaskBtn.disabled = true
}

async function toggleComplete(id, currentStatus) {
  const { error } = await client
    .from('todos')
    .update({ is_complete: !currentStatus })
    .eq('id', id)

  if (error) console.error('Error updating task:', error)
  fetchTasks()

}

async function deleteTask(id) {
  const { error } = await client
    .from('todos')
    .delete()
    .eq('id', id)

  if (error) console.error('Error deleting task:', error)
  fetchTasks()
alert('Task deleted successfully')

}
