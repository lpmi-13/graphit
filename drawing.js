var noScroll = document.querySelector('body');
noScroll.addEventListener('touchmove', function(e) {
  e.preventDefault();
}, {passive: false });


var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');


canvas.setAttribute('width', window.innerWidth);
canvas.setAttribute('height', window.innerHeight);


var x, y, isPainting;
var origX, origY, finalX, finalY;

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
  var coordinates = getCoordinates(e);
  origX = x = coordinates[0];
  origY = y = coordinates[1];
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
    var [newX, newY] = getCoordinates(e);
    drawLine(x, y, newX, newY);

    // set x and y to our new coordinates
    finalX = x = newX;
    finalY = y = newY;
  }
}

function getSlope(startX, startY, endX, endY) {
  var slope = (startY - endY) / (endX - startX);
  return slope.toFixed(2);
}

function exit() {
  isPainting = false;
  var slope = getSlope(origX, origY, finalX, finalY);

  // deal with 0, 0 being at the top left of the viewport
  var fakeCenterX = canvas.width/2;
  var fakeOrigX = origX - fakeCenterX;
  var fakeCenterY = canvas.height/2;
  var fakeOrigY = fakeCenterY - origY;

  // we have 9 "units" each above/below the midpoint, so a bit hacky
  var heightUnit = canvas.height / 18;

  context.font = "2.8rem Arial";
  context.strokeStyle = '#000000';
  context.textAlign = 'center';

  // put the equation together
  var yPoint = fakeOrigY - (slope * fakeOrigX);
  var scaledYPoint = yPoint / heightUnit;

  var symbol = yPoint > 0 ? '+' : '-';
  var equation = 'y = ' + slope + 'x ' + symbol + ' ' + Math.abs(scaledYPoint.toFixed(0));
  context.lineWidth = 4;
  context.strokeText(equation, canvas.width / 2, canvas.height * .85);
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
