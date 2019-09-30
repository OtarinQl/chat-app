const generateTime = (text, username)=>{
    if(!username){
        username = 'Admin'
    }
    return {
        text,
        username,
        time: new Date().getTime()
    }
}

module.exports = {
    generateTime
}