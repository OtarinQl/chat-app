//Archivo "Cliente"
const socket = io()
//Elementos
const $messageForm = document.querySelector('form')
const $messageContent = $messageForm.querySelector('input')
const $messageButton = $messageForm.querySelector('button')
const $locButton = document.querySelector('#locator')
const $chat = document.querySelector('#chat')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#list-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = ()=>{
    const $lastMsg = $chat.lastElementChild
    const msgStyle = getComputedStyle($lastMsg)
    const msgMargin = parseInt(msgStyle.marginBottom)
    const msgHeight = $lastMsg.offsetHeight + msgMargin
    const visibleHeight = $chat.offsetHeight
    const containerHeight = $chat.scrollHeight
    const scrollOffset = $chat.scrollTop + visibleHeight
    if(containerHeight - msgHeight <= scrollOffset){
        $chat.scrollTop = $chat.scrollHeight
    }
}

socket.on('message', (message)=>{
    const html = Mustache.render(messageTemplate, {
        text: message.text,
        username: message.username,
        time: moment(message.time).format('H:mm a')
    })  
    $chat.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('sendLocation', (content)=>{
    const html = Mustache.render(locationTemplate, {
        url: content.text,
        username: content.username,
        time: moment(content.time).format('H:mm a')
    })  
    $chat.insertAdjacentHTML('beforeend', html)  
    autoscroll()  
})

socket.on('roomData', ({ room, users })=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()

    $messageButton.setAttribute('disabled', 'disabled')

    socket.emit('sendMessage', $messageContent.value, (error, cnt)=>{
        $messageButton.removeAttribute('disabled')
        $messageContent.value = ''
        $messageContent.focus()
        
        if(error){
            alert('Error! No se permite vocabulario inadecuado!')
        } else {
            console.log('Mensaje enviado!')
        }
    })
})

$locButton.addEventListener('click', (e)=>{
    $locButton.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert('No se puede localizar su posición actualmente! Pruebe en otro navegador')
    } else {
        navigator.geolocation.getCurrentPosition((position)=>{
            socket.emit('sendLocation', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, ()=>{
                $locButton.removeAttribute('disabled')
            })
        })
    }
})

socket.emit('join', { username, room }, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})