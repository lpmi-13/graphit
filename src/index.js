// Remove the import for the scss file
// import style from './styles/app.scss';

// Add inline styles
function applyStyles() {
    // Create a style element
    const styleElement = document.createElement('style');
    styleElement.textContent = `
    html, body, canvas {
      margin: 1;
      user-select: none;
      overflow: hidden;
      font-family: Arial, Helvetica, sans-serif;
    }

    h1 {
      position: absolute;
      user-select: none;
      font-size: 1.5rem;
      text-align: center;
      width: 100%;
      z-index: 1;
      font-weight: 400;
    }

    output {
      position: absolute;
      font-size: 1.5rem;
      text-align: center;
      width: 100%;
      bottom: .5rem;
      z-index: 1;
    }

    canvas {
      background-image: url('/src/images/background-graph.svg');
      background-repeat: no-repeat;
      background-size: contain;
      background-position: 50% 50%;
      letter-spacing: .2rem;
      -webkit-text-size-adjust: 100%;
    }
  `;

    // Append the style element to the head
    document.head.appendChild(styleElement);
}

// Apply styles immediately
applyStyles();

const noScroll = document.querySelector('body');
noScroll.addEventListener(
    'touchmove',
    function (e) {
        e.preventDefault();
    },
    { passive: false }
);

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

// Get the existing header text
const headerText =
    document.querySelector('h1, h2, h3, header') ||
    document.querySelector('body > *:first-child');

// Create toggle button container
const toggleContainer = document.createElement('div');
toggleContainer.style.position = 'relative';
toggleContainer.style.textAlign = 'center';
toggleContainer.style.marginTop = '3em';
toggleContainer.style.marginBottom = '20px';
toggleContainer.style.zIndex = '100';

const modeToggle = document.createElement('button');
modeToggle.innerText = 'Switch to Quadratic Mode';
modeToggle.style.padding = '8px 16px';
modeToggle.style.borderRadius = '4px';
modeToggle.style.cursor = 'pointer';

toggleContainer.appendChild(modeToggle);

// Insert the toggle button after the header text
if (headerText) {
    headerText.after(toggleContainer);
} else {
    document.body.insertBefore(toggleContainer, document.body.firstChild);
}

// Keep track of current mode
let isQuadraticMode = false;

// Toggle between linear and quadratic modes
modeToggle.addEventListener('click', () => {
    isQuadraticMode = !isQuadraticMode;
    modeToggle.innerText = isQuadraticMode
        ? 'Switch to Linear Mode'
        : 'Switch to Quadratic Mode';
    clearAll();
    document.querySelector('output[name=equation]').innerText = '';
});

function resize() {
    // size the canvas to be a square that will fit in the middle of the page
    const { innerWidth, innerHeight } = window;
    const size = Math.min(innerWidth, innerHeight) * 0.8;
    const top = (innerHeight - size) / 2;
    const left = (innerWidth - size) / 2;

    // for retina screens, make the canvas bigger and scale down with css
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = size * pixelRatio;
    canvas.height = size * pixelRatio;

    Object.assign(canvas.style, {
        position: 'absolute',
        top: top + 'px',
        left: left + 'px',
        width: size + 'px',
        height: size + 'px',
    });

    // transform the context, so drawing to 0,0 will be in the centre
    context.resetTransform();
    context.translate(canvas.width / 2, canvas.height / 2);
    const scale = canvas.width / 20; // 20 units on width of page
    context.scale(scale, -scale);
    context.lineWidth = 0.25;
    context.lineCap = 'round';
}

window.addEventListener('resize', resize);
resize();

// Drawing state
let isPainting = false;
let startPoint = { x: 0, y: 0 };
let endPoint = { x: 0, y: 0 };
let currentPoint = { x: 0, y: 0 };
let points = [];
let highestPoint = { x: 0, y: -Infinity };

// Graph boundaries
const graphBounds = {
    minX: -10,
    maxX: 10,
    minY: -10,
    maxY: 10,
};

function getCoordinates(event) {
    const bounds = canvas.getBoundingClientRect();

    if (['mousedown', 'mousemove'].includes(event.type)) {
        return {
            x: ((event.pageX - bounds.left) / bounds.width - 0.5) * 20,
            y: -((event.pageY - bounds.top) / bounds.height - 0.5) * 20,
        };
    } else {
        return {
            x:
                ((event.touches[0].pageX - bounds.left) / bounds.width - 0.5) *
                20,
            y:
                -((event.touches[0].pageY - bounds.top) / bounds.height - 0.5) *
                20,
        };
    }
}

function startPaint(e) {
    isPainting = true;
    startPoint = getCoordinates(e);
    currentPoint = { ...startPoint };
    endPoint = { ...startPoint };

    // Reset points array and highest point for quadratic mode
    points = [{ ...startPoint }];
    highestPoint = { ...startPoint };
}

function paint(e) {
    if (!isPainting) return;

    const newPoint = getCoordinates(e);

    // Draw line from current point to new point
    context.strokeStyle = 'black';
    context.beginPath();
    context.moveTo(currentPoint.x, currentPoint.y);
    context.lineTo(newPoint.x, newPoint.y);
    context.stroke();

    // Update current and end points
    currentPoint = { ...newPoint };
    endPoint = { ...newPoint };

    // For quadratic mode, track points and find highest
    if (isQuadraticMode) {
        points.push({ ...newPoint });

        if (newPoint.y > highestPoint.y) {
            highestPoint = { ...newPoint };
        }
    }
}

function drawFinalEquation() {
    clearAll();

    if (isQuadraticMode) {
        const { a, b, c } = calculateQuadraticEquation();
        drawQuadraticCurve(a, b, c);
        displayQuadraticEquation(a, b, c);
    } else {
        const { slope, yIntercept } = calculateLinearEquation();
        drawLinearLine(slope, yIntercept);
        displayLinearEquation(slope, yIntercept);
    }
}

function calculateLinearEquation() {
    // Calculate slope: m = (y2 - y1) / (x2 - x1)
    const slope = (endPoint.y - startPoint.y) / (endPoint.x - startPoint.x);

    // Calculate y-intercept: b = y - mx
    const yIntercept = startPoint.y - slope * startPoint.x;

    return {
        slope: parseFloat(slope.toFixed(2)),
        yIntercept: parseFloat(yIntercept.toFixed(2)),
    };
}

function drawLinearLine(slope, yIntercept) {
    // Find the x-coordinate where the line intersects y=minY and y=maxY
    const xAtMinY = (graphBounds.minY - yIntercept) / slope;
    const xAtMaxY = (graphBounds.maxY - yIntercept) / slope;

    // Find the y-coordinate where the line intersects x=minX and x=maxX
    const yAtMinX = slope * graphBounds.minX + yIntercept;
    const yAtMaxX = slope * graphBounds.maxX + yIntercept;

    // Choose the two points that are within the graph bounds
    const points = [];

    if (xAtMinY >= graphBounds.minX && xAtMinY <= graphBounds.maxX) {
        points.push({ x: xAtMinY, y: graphBounds.minY });
    }

    if (xAtMaxY >= graphBounds.minX && xAtMaxY <= graphBounds.maxX) {
        points.push({ x: xAtMaxY, y: graphBounds.maxY });
    }

    if (yAtMinX >= graphBounds.minY && yAtMinX <= graphBounds.maxY) {
        points.push({ x: graphBounds.minX, y: yAtMinX });
    }

    if (yAtMaxX >= graphBounds.minY && yAtMaxX <= graphBounds.maxY) {
        points.push({ x: graphBounds.maxX, y: yAtMaxX });
    }

    // Draw the line between the two points that define the segment within bounds
    if (points.length >= 2) {
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        context.lineTo(points[1].x, points[1].y);
        context.stroke();
    }
}

function displayLinearEquation(slope, yIntercept) {
    let equation = `y = ${slope}x`;

    if (yIntercept >= 0) {
        equation += ` + ${Math.abs(yIntercept)}`;
    } else if (yIntercept < 0) {
        equation += ` - ${Math.abs(yIntercept)}`;
    }

    document.querySelector('output[name=equation]').innerText = equation;
}

function calculateQuadraticEquation() {
    // We need at least three points for a quadratic
    if (points.length < 3) {
        return { a: 0, b: 0, c: 0 };
    }

    const start = points[0];
    const end = points[points.length - 1];
    let apex = highestPoint;

    // If highest point is the start or end, use a middle point
    if (
        (apex.x === start.x && apex.y === start.y) ||
        (apex.x === end.x && apex.y === end.y)
    ) {
        const middleIndex = Math.floor(points.length / 2);
        apex = points[middleIndex];
    }

    // Set up the system of equations for y = ax² + bx + c
    const matrix = [
        [start.x * start.x, start.x, 1],
        [apex.x * apex.x, apex.x, 1],
        [end.x * end.x, end.x, 1],
    ];

    const constants = [start.y, apex.y, end.y];

    // Solve using Gaussian elimination
    try {
        const solution = solveLinearSystem(matrix, constants);
        return {
            a: parseFloat(solution[0].toFixed(2)),
            b: parseFloat(solution[1].toFixed(2)),
            c: parseFloat(solution[2].toFixed(2)),
        };
    } catch (e) {
        // Fallback to a simpler approach
        return calculateSimpleQuadratic(start, end, apex);
    }
}

function solveLinearSystem(matrix, constants) {
    // Gaussian elimination with partial pivoting
    const n = matrix.length;

    // Combine matrix with constants for augmented matrix
    const augMatrix = matrix.map((row, i) => [...row, constants[i]]);

    // Forward elimination
    for (let i = 0; i < n; i++) {
        // Find pivot
        let maxRow = i;
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(augMatrix[j][i]) > Math.abs(augMatrix[maxRow][i])) {
                maxRow = j;
            }
        }

        // Swap rows
        [augMatrix[i], augMatrix[maxRow]] = [augMatrix[maxRow], augMatrix[i]];

        // Check for singular matrix
        if (Math.abs(augMatrix[i][i]) < 1e-10) {
            throw new Error('Matrix is singular');
        }

        // Eliminate below
        for (let j = i + 1; j < n; j++) {
            const factor = augMatrix[j][i] / augMatrix[i][i];
            for (let k = i; k <= n; k++) {
                augMatrix[j][k] -= factor * augMatrix[i][k];
            }
        }
    }

    // Back substitution
    const solution = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        solution[i] = augMatrix[i][n];
        for (let j = i + 1; j < n; j++) {
            solution[i] -= augMatrix[i][j] * solution[j];
        }
        solution[i] /= augMatrix[i][i];
    }

    return solution;
}

function calculateSimpleQuadratic(start, end, apex) {
    // Simplified approach: force the apex to be the vertex
    const h = apex.x;
    const k = apex.y;

    // Formula: y = a(x-h)² + k
    let a;
    if (Math.abs(start.x - h) > 1e-10) {
        a = (start.y - k) / ((start.x - h) * (start.x - h));
    } else {
        a = (end.y - k) / ((end.x - h) * (end.x - h));
    }

    // Convert to standard form: y = ax² + bx + c
    return {
        a: parseFloat(a.toFixed(2)),
        b: parseFloat((-2 * a * h).toFixed(2)),
        c: parseFloat((a * h * h + k).toFixed(2)),
    };
}

function drawQuadraticCurve(a, b, c) {
    context.beginPath();

    // Calculate the range of x-values where the parabola is within bounds
    let xStart = graphBounds.minX;
    let xEnd = graphBounds.maxX;

    // Check y values at graph boundaries
    const yAtMinX = a * graphBounds.minX ** 2 + b * graphBounds.minX + c;
    const yAtMaxX = a * graphBounds.maxX ** 2 + b * graphBounds.maxX + c;

    // If a is positive, parabola opens upward
    if (a > 0) {
        // Find vertex (lowest point) of parabola
        const vertexX = -b / (2 * a);
        const vertexY = a * vertexX ** 2 + b * vertexX + c;

        // If vertex is below lower bound, find where parabola intersects lower bound
        if (vertexY < graphBounds.minY) {
            // Solve quadratic: a*x^2 + b*x + (c-minY) = 0
            const discriminant = b * b - 4 * a * (c - graphBounds.minY);
            if (discriminant >= 0) {
                const x1 = (-b - Math.sqrt(discriminant)) / (2 * a);
                const x2 = (-b + Math.sqrt(discriminant)) / (2 * a);

                // Update x bounds if intersections are within graph bounds
                if (x1 > graphBounds.minX && x1 < graphBounds.maxX) {
                    xStart = Math.max(xStart, x1);
                }
                if (x2 > graphBounds.minX && x2 < graphBounds.maxX) {
                    xEnd = Math.min(xEnd, x2);
                }
            }
        }
    }
    // If a is negative, parabola opens downward
    else if (a < 0) {
        // Find vertex (highest point) of parabola
        const vertexX = -b / (2 * a);
        const vertexY = a * vertexX ** 2 + b * vertexX + c;

        // If vertex is above upper bound, find where parabola intersects upper bound
        if (vertexY > graphBounds.maxY) {
            // Solve quadratic: a*x^2 + b*x + (c-maxY) = 0
            const discriminant = b * b - 4 * a * (c - graphBounds.maxY);
            if (discriminant >= 0) {
                const x1 = (-b - Math.sqrt(discriminant)) / (2 * a);
                const x2 = (-b + Math.sqrt(discriminant)) / (2 * a);

                // Update x bounds if intersections are within graph bounds
                if (x1 > graphBounds.minX && x1 < graphBounds.maxX) {
                    xStart = Math.max(xStart, x1);
                }
                if (x2 > graphBounds.minX && x2 < graphBounds.maxX) {
                    xEnd = Math.min(xEnd, x2);
                }
            }
        }
    }

    // Draw the parabola within the bounded region
    let isFirstPoint = true;
    for (let x = xStart; x <= xEnd; x += 0.1) {
        const y = a * x * x + b * x + c;

        // Only draw if point is within y bounds
        if (y >= graphBounds.minY && y <= graphBounds.maxY) {
            if (isFirstPoint) {
                context.moveTo(x, y);
                isFirstPoint = false;
            } else {
                context.lineTo(x, y);
            }
        } else if (!isFirstPoint) {
            // We've gone out of bounds, stop drawing
            break;
        }
    }

    context.stroke();
}

function displayQuadraticEquation(a, b, c) {
    let equation = `y = ${a}x²`;

    if (b >= 0) {
        equation += ` + ${Math.abs(b)}x`;
    } else {
        equation += ` - ${Math.abs(b)}x`;
    }

    if (c >= 0) {
        equation += ` + ${Math.abs(c)}`;
    } else {
        equation += ` - ${Math.abs(c)}`;
    }

    document.querySelector('output[name=equation]').innerText = equation;
}

function clearAll() {
    context.clearRect(-10, -10, 20, 20);
}

function exit() {
    if (!isPainting) return;
    isPainting = false;
    drawFinalEquation();
}

// Event listeners
canvas.addEventListener('mousedown', function (e) {
    clearAll();
    startPaint(e);
});

canvas.addEventListener('touchstart', function (e) {
    clearAll();
    startPaint(e);
});

canvas.addEventListener('mousemove', paint);
canvas.addEventListener('touchmove', paint);

canvas.addEventListener('mouseup', exit);
canvas.addEventListener('mouseleave', exit);
canvas.addEventListener('touchend', exit);
