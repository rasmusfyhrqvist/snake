const app           = document.getElementById('app'),
      currentPoints = document.getElementById('current'),
      highPoints    = document.getElementById('high'),
      gameMenuPoints= document.getElementById('points'),
      overlayBtn    = document.getElementById('rematch-btn')


const directions = ['left','up','right','down']
var xOld = 3, yOld = 11, dirOld = 3
let snakePositions, snakeElements, treats, dir, points, gamePauseFlag, gameTimeout, timeoutDelay


const init = () => {
    var xOld = 3, yOld = 11, dirOld = 3

    snakePositions  = []
    snakeElements   = []
    treats          = []

    dir          = 2
    points       = 0
    timeoutDelay = 250

    app.className = ''
    gamePauseFlag = false

    Array(...app.getElementsByTagName('div')).forEach(elem => elem.remove())
    
    grow()
    grow()
    grow()
    placeTreat()
    placeTreat()
    update()
    update()
}

const gameOver = () => {
    gamePause()
    overlayBtn.innerText = 'Rematch'
    overlayBtn.onclick = init
}

const gamePause = () => {

    app.className = 'game-over'
    gameMenuPoints.innerText = points
    gamePauseFlag = true


    overlayBtn.focus()
    overlayBtn.innerText = 'Play'
    overlayBtn.onclick = () => {
        app.className = ''
        gamePauseFlag = false
        update()
    }
}

const grow = () => {
    let elem = app.appendChild(document.createElement('div'))
    elem.className = 'snake'
    snakeElements.push(elem)
    snakePositions.push({ x: xOld, y: yOld, dir:dirOld })
}

const update = () => {

    clearTimeout(gameTimeout)
    if(!!gamePauseFlag){return undefined}

    snakePositions.unshift({
        x:(snakePositions[0].x + (!(dir%2)?dir-1:0)),
        y:(snakePositions[0].y + (!!(dir%2)?dir-2:0)),
        dir: dir
    })

    snakePositions[1].dir += 4*dir

    var {x:xHead, y:yHead} = snakePositions[0]
    if(xHead<1 || xHead>20 || yHead<1 || yHead>20){ return gameOver() }

    treats.forEach((treat, i) => {
        if(treat.x == xHead && treat.y == yHead){
            treat.el.remove()
            treats.splice(i,1)

            grow()
            placeTreat()
            
            timeoutDelay -= 2        
            points += 10
        }
    })

    var {x:xOld, y:yOld, dir:dirOld} = snakePositions.pop()

    snakePositions.forEach( (e, i) => {
        snakeElements[i].style.setProperty('--x',e.x)
        snakeElements[i].style.setProperty('--y',e.y)

        if(i==0){
            snakeElements[0].className = 'snake head '+directions[dir]
        } else if(i==snakeElements.length-1){
            snakeElements[i].className = 'snake tail '+directions[Math.floor(e.dir/4)]
        } else {
            snakeElements[i].className = `snake ${directions[e.dir%4]}-${directions[Math.floor(e.dir/4)]}`
        }

        if(i>0 && e.x == xHead && e.y == yHead){ gameOver() }
    })

    currentPoints.innerText = points
    if(points>highPoints.innerText){
        highPoints.innerText = points
        localStorage.setItem('highScore', parseInt(points))
    }

    gameTimeout = setTimeout(update, timeoutDelay)
}
const placeTreat = () => {
    let x, y, elem = app.appendChild(document.createElement('div'))
    elem.className = 'treat'

    do{
        x = Math.floor(Math.random()*20)+1
        y = Math.floor(Math.random()*20)+1
    } while (snakePositions.some(e=>(e.x == x && e.y == y)))

    treats.push({ x: x, y: y, el: elem })

    elem.style.setProperty('--x', x)
    elem.style.setProperty('--y', y)
}

window.onkeydown = ({keyCode})=>{
    if(keyCode == 32 && !gamePauseFlag){return void gamePause()}
    if(!keyCode || keyCode>40 || keyCode<37 ||(keyCode-37+2)%4 == dir){ return undefined }

    dir = keyCode-37
    update()
}

let pointer = {}
app.onpointerdown = evt => {
    if(evt?.pointerType != 'touch' || !!Object.keys(pointer).length){return undefined}
    let {x,y} = evt
    pointer = {x, y}
}
app.onlostpointercapture = evt => {
    let {x,y} = evt
    let dx = (x-pointer.x)
    let dy = (y-pointer.y)
    
    dir = (a=>(a+2)%4==dir?dir:a)(!!(dx**2 > dy**2)?((dx>0)*2):((dy>0)*2+1))
    
    update()
    pointer = {}
}

overlayBtn.onclick = init

highPoints.innerText = parseInt(localStorage.getItem('highScore')||0)

init()

navigator.serviceWorker?.register('/sw.js').then(({installing:i, waiting:w, active:a})=>console.info('Service worker is',(i??w??a).state)).catch(()=>console.error('Failed to register service worker'))