const hbs = require('hbs')
const path = require('path')
const http = require('http')
const bw = require('bad-words')
const express = require('express')
const socketio = require('socket.io')

const methods = require('./utils/methods')
const users = require('./public/js/users')

const filter = new bw()

const port = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.set('view engine', 'hbs')
app.use(express.static(path.join(__dirname, './public')))

io.on('connection', (socket)=>{
    console.log('New Socket.io Connection')
    socket.on('join', (options, callback)=>{
        const data = users.addUser({ id:socket.id, ...options })
        
        if(data.error){
            return callback(data.error)
        }

        socket.join(data.room)

        //Emite a un particular
        socket.emit('message', methods.generateTime(`Bienvenido, <b>${data.username}</b>!`))
    
        //Emite a absolutamente todos, excepto quien realizó la conexión
        socket.broadcast.to(data.room).emit('message', methods.generateTime(`${data.username} se ha conectado!`))
        io.to(data.room).emit('roomData', {
            room: data.room,
            users: users.getRoomUsers(data.room)
        })
        callback()
    })
    
    socket.on('sendMessage', (msg, callback)=>{
        const user = users.getUser(socket.id)
        const flag = filter.isProfane(msg)
        callback(flag, msg)
        
        if(flag){
            msg = filter.clean(msg)
        }
        //"to()" manda los mensajes a un chat en particular
        io.to(user.room).emit('message', methods.generateTime(msg, user.username))
    })
    
    socket.on('sendLocation', (pos, callback)=>{
        const user = users.getUser(socket.id)
        const msg = `http://google.com/maps?q=${pos.latitude},${pos.longitude}`
        callback()
        
        io.to(user.room).emit('sendLocation', methods.generateTime(msg, user.username))
    })

    socket.on('disconnect', ()=>{
        const user = users.removeUser(socket.id)
        
        io.to(user.room).emit('message', methods.generateTime(`${user.username} se ha desconectado :(`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: users.getRoomUsers(user.room)
        })
    })
    
})

server.listen(port, ()=> console.log(`Conectado en el puerto ${port}`))