const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
const path = require('path')
const dbPath = path.join(__dirname, 'todoApplication.db')
app.use(express.json())
let db = null;
const initializeDBAndServer = dbObject => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at 3000')
    })
  } catch (e) {
    console.log(`DB Error ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()
const PriorityAndStatus = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}
const Priority = requestQuery => {
  return requestQuery.priority !== undefined
}
const Status = requestQuery => {
  return requestQuery.status !== undefined
}
const StatusBody = requestBody => {
  return requestBody.status !== undefined
}
const PriorityBody = requestBody => {
  return requestBody.priority !== undefined
}
app.get('/todos/', async (request, response) => {
  let data = null
  let getQuery = ''
  const {search_q = '', priority, status} = request.query
  switch (true) {
    case PriorityAndStatus(request.query):
      getQuery = `select * from todo where todo like '%${search_q}%' and status='${status}' and priority='${priority}';`
      break
    case Status(request.query):
      getQuery = `select * from todo where todo like '%${search_q}%' and status='${status}';`
      break
    case Priority(request.query):
      getQuery = `select * from todo where todo like '%${search_q}%' and priority='${priority}';`
      break
    default:
      getQuery = `select * from todo where todo like '%${search_q}%';`
      data = await db.all(getQuery)
      response.send(data)
  }
})
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getQuery = `select * from todo where id=${todoId};`
  const todo = await db.get(getQuery)
  response.send(todo);
})
app.post('/todos/', async (request, response) => {
  const todoDetails = request.body
  const {id, todo, priority, status} = todoDetails
  const getQuery = `insert into todo (id,todo,priority,status) values (${id},'${todo}','${priority}','${status}');`
  await db.run(getQuery)
  response.send('Todo Successfully Added')
})
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const requestBody = request.body
  let updateColumn = ''
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = 'Status'
      break
    case requestBody.priority !== undefined:
      updateColumn = 'Priority'
      break
    case requestBody.todo !== undefined:
      updateColumn = 'Todo'
  }
  const query = `select * from todo where id=${todoId};`
  const previousTodo = await db.get(query)
  const {
    id = previousTodo.id,
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = requestBody
  const getQuery = `update todo set id=${id},todo='${todo}',priority='${priority}',status='${status}' where id=${todoId};`
  await db.run(getQuery)
  response.send(`${updateColumn} Updated`)
})
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getQuery = `delete from todo where id=${todoId};`
  await db.run(getQuery)
  response.send('Todo Deleted')
})
module.exports = app;
