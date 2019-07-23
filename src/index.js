import regression from 'regression';

// hack to keep the document from even attempting to scroll
const noScroll = document.querySelector('body');
noScroll.addEventListener('touchmove', function(e) {
  e.preventDefault();
}, {passive: false });

// set up our canvas
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
canvas.setAttribute('width', window.innerWidth);
canvas.setAttribute('height', window.innerHeight);

const fontRatio = 80 / 1000;
const fontSize = window.innerWidth * fontRatio;

// these set our artificial centerpoints instead of the top left corner
const fakeCenterX = canvas.width/2;
const fakeCenterY = canvas.height/2;

let coordinateArray = [];

// instantiate the globals we need...I know...yuck!
let x,
    y,
    isPainting,
    origX,
    origY,
    finalX,
    finalY;

function getCoordinates(event) {
  if (['mousedown', 'mousemove'].includes(event.type)) {
    return [event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop];
  } else {
    return [
      event.touches[0].pageX - canvas.offsetLeft,
      event.touches[0].pageY - canvas.offsetTop
    ];
  }
}

function startPaint(e) {
  isPainting = true;
  coordinateArray = [];
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
  context.lineWidth = 10;

  context.beginPath();
  context.moveTo(secondX, secondY);
  context.lineTo(firstX, firstY);

  // actually draw the path
  context.stroke();
}

function paint(e) {
  if (isPainting) {
    const [newX, newY] = getCoordinates(e);
    drawLine(x, y, newX, newY);

    // save these for later
    coordinateArray.push([
      newX,
      newY
    ]);

    // set x and y to our new coordinates
    finalX = x = newX;
    finalY = y = newY;
  }
}

function getSlope(startX, startY, endX, endY) {
  const slope = (startY - endY) / (endX - startX);
  return slope.toFixed(2);
}

function generateLineFromLinear(coordinateArray) {
  console.log(coordinateArray);
  const centeredArray = coordinateArray.map((x, y) => {
    return [x - fakeCenterX, y - fakeCenterY - y];
  })
  const centeredResult = regression.linear(centeredArray);
  const result = regression.linear(coordinateArray);
  console.log(result);
  console.log(centeredResult);
}

function exit() {

  isPainting = false;
  const slope = getSlope(origX, origY, finalX, finalY);

  generateLineFromLinear(coordinateArray);

  // deal with 0, 0 being at the top left of the viewport
  const fakeOrigX = origX - fakeCenterX;
  const fakeOrigY = fakeCenterY - origY;

  // we have 9 "units" each above/below the midpoint, so a bit hacky
  const heightUnit = canvas.height / 18;

  context.font = fontSize + "px Arial";
  context.strokeStyle = '#000000';
  context.textAlign = 'center';

  // put the equation together
  const yPoint = fakeOrigY - (slope * fakeOrigX);
  const scaledYPoint = yPoint / heightUnit;


  // draw out the linear line from equation
  const linearSelection = document.getElementById('linear').checked;
  if(linearSelection) {
    snapToLinear();
  }

  const symbol = yPoint > 0 ? '+' : '-';
  const equation = 'y = ' + slope + 'x ' + symbol + ' ' + Math.abs(scaledYPoint.toFixed(0));
  context.lineWidth = 4;
  context.fillText(equation, canvas.width / 2, canvas.height * .85);
}

// get rid of the previous line drawn and equation generated
function clearAll() {
  context.clearRect(0, 0, canvas.width, canvas.height);
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
