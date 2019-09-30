const users = []

const addUser = ({ id, username, room })=>{
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username||!room){
        return {
            error: 'Nombre de usuario y habitación son requeridos!'
        }
    }

    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    if(existingUser){
        return {
            error: `Ya existe un usuario ${username}!`
        }
    } else {
        users.push({ id, username, room })
        return { id, username, room }
    }
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })
    if(index!==-1){
        return users.splice(index, 1)[0]
    } else {
        return {
            error: 'No se ha encontrado el usuario'
        }
    }
}

const getUser = (id)=>{
    return users.find((user)=> { return user.id === id } )
}

const getRoomUsers = (room)=>{
    return users.filter((user)=> {return user.room === room})
}

module.exports = {
    addUser,
    getUser,
    getRoomUsers,
    removeUser
}