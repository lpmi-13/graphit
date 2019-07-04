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
  context.lineJoin = "round";
  context.lineWidth = 5;

  context.beginPath();
  context.moveTo(secondX, secondY);
  context.lineTo(firstX, firstY);
  context.closePath();

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
//  console.log('slope is: ', slope);
  console.log('origX is: ', origX);
  console.log('origY is: ', origY);
//  console.log('original points create: ' + origY + ' = ' + slope + ' * ' + origX + ' + b');
//  console.log('finalX is: ', finalX);
//  console.log('finalY is: ', finalY);
//  console.log('final points create: ' + finalY + ' = ' + slope + ' * ' + finalX + ' + b');
  var fakeCenterX = canvas.width/2;
  console.log('fakeCenterX is: ', fakeCenterX);
  var fakeOrigX = origX - fakeCenterX;
  var fakeCenterY = canvas.height/2;
  console.log('fakeCenterY is: ', fakeCenterY);
  var fakeOrigY = fakeCenterY - origY;
  console.log('fake original X is: ', fakeOrigX);
  console.log('fake original Y is: ', fakeOrigY);
  context.font = "5rem Arial";
  context.textAlign = 'center';
  var midpoint = canvas.width/2;
  // this is the first part...now just need to deal with the reverse Y vals
  var firstPart = slope * fakeOrigX;

  // this _should_ work, but shit is reversed
  var yPoint = fakeCenterY - firstPart;
  var symbol = yPoint > 0 ? '+' : '-';
  var equation = 'y = ' + slope + 'x ' + symbol + ' ' + Math.abs(yPoint.toFixed(0));
  context.fillText(equation, canvas.width/2, canvas.height * .85);
}

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
