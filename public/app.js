const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

let radius = Math.min(canvas.width, canvas.height) / 2;
let finalSelection = "Cherry"
let items = window.roundOptions
let selectedItem = null
let lastSelectedItem = null
let currentState = 'idle'
let transition = 0
let transitionSpeed = 0.09
let slowTransitionSpeed = 0.03
let minDuration = 200
let maxDuration = 700
let totalTime = 10000
let nextChangeTime

var socket = io()
socket.on('spinThatThing', (selectedItem) => {
  finalSelection = selectedItem
  spinIt()
})


window.addEventListener('resize', () => {
  // Adjusts the canvas dimensions whenever the window size changes
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  radius = Math.min(canvas.width, canvas.height) / 2 - 50;
})


function spinIt() {
  if (currentState === 'idle') {
    currentState = 'running'
    let startTime = performance.now()
    nextChangeTime = startTime + minDuration
    let interval = setInterval(() => {
      let currentTime = performance.now()
      if (currentState === 'finishing' && transition >= 1) {
        clearInterval(interval)
        selectFinalItem()
      } else if (currentState === 'running' && currentTime - startTime >= totalTime) {
        currentState = 'finishing'
      } else if (currentState === 'running' && currentTime >= nextChangeTime) {
        do {
          selectedItem = Math.floor(Math.random() * items.length)
        } while (selectedItem === lastSelectedItem)
        lastSelectedItem = selectedItem
        transition = 0

        // Update the next change time according to a cubic bezier pattern
        let progress = (currentTime - startTime) / totalTime
        let bezierValue = cubicBezier(progress, 0, 0, 1, 1)
        nextChangeTime = currentTime + minDuration + (maxDuration - minDuration) * bezierValue
      }
    }, 100)
  }
}

function cubicBezier(t, p0, p1, p2, p3) {
  return (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3
}

function selectFinalItem() {
  selectedItem = items.indexOf(finalSelection)
  lastSelectedItem = selectedItem
  currentState = 'idle'
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.save()
  ctx.translate(canvas.width / 2, canvas.height / 2)

  // Draw roulette
  for (let i = 0; i < items.length; i++) {
    let currentAngle = 2 * Math.PI * i / items.length
    let nextAngle = currentAngle + 2 * Math.PI / items.length

    let startX = radius * Math.cos(currentAngle)
    let startY = radius * Math.sin(currentAngle)
    let endX = radius * Math.cos(nextAngle)
    let endY = radius * Math.sin(nextAngle)

    let gradientEven = ctx.createLinearGradient(startX, startY, endX, endY)
    gradientEven.addColorStop(0, 'magenta')
    gradientEven.addColorStop(1, 'blue')

    let gradientFinalSelection = ctx.createLinearGradient(startX, startY, endX, endY)
    gradientFinalSelection.addColorStop(0, 'peru')
    gradientFinalSelection.addColorStop(1, 'gold')

    // Draw segment
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.strokeStyle = "#000"
    ctx.arc(0, 0, radius, currentAngle, currentAngle + 2 * Math.PI / items.length, false)
    ctx.closePath()
    // ctx.fillStyle = i === selectedItem ? (currentState === 'running' || items[i] !== finalSelection ? `rgba(0, 0, 255, ${transition})` : 'cyan') : (i % 2 == 0 ? "#222" : gradient)
    //                                                                                                 Selection while spining                 Final selection                       odd item   even item
    ctx.fillStyle = i === selectedItem ? (currentState === 'running' || items[i] !== finalSelection ? `#ff9ff3` : gradientFinalSelection) : (i % 2 == 0 ? "#222f3e" : gradientEven)
    ctx.fill()
    ctx.lineWidth = 1
    ctx.stroke()

    // Position the text
    let textAngle = currentAngle + Math.PI / items.length
    let textRadius = 0.7 * radius

    ctx.save(); // Save current state
    ctx.rotate(textAngle); // Rotate to the current segment

    ctx.fillStyle = "#fafafa"
    ctx.font = "69px 'Prompt', sans-serif"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Translate to the position and rotate the context to vertical
    ctx.translate(textRadius, 0);
    ctx.rotate(Math.PI);

    // Draw the text
    ctx.fillText(items[i], 20, 0);

    ctx.restore(); // Restore to the initial state
  }

  ctx.restore()

  // Use slower transition speed when finishing
  transition += currentState === 'running' ? transitionSpeed : slowTransitionSpeed
  transition = Math.min(transition, 1)

  window.requestAnimationFrame(draw)
}

draw()
