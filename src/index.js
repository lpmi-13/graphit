import style from './styles/app.scss';

const noScroll = document.querySelector('body');
noScroll.addEventListener('touchmove', function(e) {
  e.preventDefault();
}, {passive: false });

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

function resize() {
  // size the canvas to be a square that
  // will fit in the middle of the page
  const {innerWidth, innerHeight} = window
  const size = Math.min(innerWidth, innerHeight) * 0.8 // 0.8 = 10% padding
  const top = ((innerHeight - size) / 2)
  const left = ((innerWidth - size) / 2)

  // for retina screens, make the canvas bigger
  // and scale down with css so it's crisper
  const pixelRatio = window.devicePixelRatio || 1; 
  canvas.width = size * pixelRatio
  canvas.height = size * pixelRatio

  const style = {
    position: 'absolute',
    top: top + 'px',
    left: left + 'px',
    width: size + 'px',
    height: size + 'px',
  }

  Object.assign(canvas.style, style)

  // transform the context, so drawing to 0,0 will be in the centre
  // and the pixels will match the background
  context.resetTransform()
  context.translate(canvas.width/2, canvas.height/2);
  const scale = canvas.width / 20 /* 20 units on width of page */
  context.scale(scale, -scale);
  context.lineWidth = 0.25
  context.lineCap = 'round'
}

window.addEventListener("resize", resize);
resize();

let x,
    y,
    isPainting,
    origX,
    origY,
    finalX,
    finalY;

function getCoordinates(event) {
  const bounds = canvas.getBoundingClientRect()

  if (['mousedown', 'mousemove'].includes(event.type)) {
    return [
      (((event.pageX - bounds.left) / bounds.width) - .5) * 20,
      -(((event.pageY - bounds.top) / bounds.height) - .5) * 20,
    ];
  } else {
    return [
      (((event.touches[0].pageX - bounds.left) / bounds.width) - .5) * 20,
      -(((event.touches[0].pageY - bounds.top) / bounds.height) - .5) * 20,
    ];
  }
}

function startPaint(e) {
  isPainting = true;
  const coordinates = getCoordinates(e);
  origX = x = coordinates[0];
  origY = y = coordinates[1];
}

function snapToLinear() {
  // get rid of the previously drawn line and snap line to equation
  clearAll();
  context.beginPath();
  context.moveTo(origX, origY);
  context.lineTo(finalX, finalY);
  context.stroke();
}

function drawLine(firstX, firstY, secondX, secondY) {
  context.strokeStyle = "black";

  context.beginPath();
  context.moveTo(secondX, secondY);
  context.lineTo(firstX, firstY);

  // actually draw the path
  context.stroke();
}

function paint(e) {
  if (isPainting) {
    var [newX, newY] = getCoordinates(e);
    drawLine(x, y, newX, newY);

    // set x and y to our new coordinates
    finalX = x = newX;
    finalY = y = newY;
  }
}

function getSlope(startX, startY, endX, endY) {
  const slope = (startY - endY) / (endX - startX);
  return slope.toFixed(2);
}

function exit() {

  isPainting = false;
  const slope = getSlope(origX, origY, finalX, finalY);

  // put the equation together
  const yPoint = (origY + (slope * origX));

  // draw out the linear line from equation
  snapToLinear();

  const symbol = yPoint >= 0 ? '+' : '-';
  const equation = 'y = ' + slope + 'x ' + symbol + ' ' + Math.abs(yPoint.toFixed(2));
  
  document.querySelector('output[name=equation]').innerText = equation;
}

// get rid of the previous line drawn and equation generated
function clearAll() {
  context.clearRect(-10, -10, 20, 20);
}

canvas.addEventListener('mousedown', startPaint);
canvas.addEventListener('touchstart', startPaint);
canvas.addEventListener('mousedown', clearAll);
canvas.addEventListener('touchstart', clearAll);

canvas.addEventListener('mousemove', paint);
canvas.addEventListener('touchmove', paint);

canvas.addEventListener('mouseup', exit);
canvas.addEventListener('mouseleave', exit);
canvas.addEventListener('touchend', exit);
