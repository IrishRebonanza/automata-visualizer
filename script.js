// Function to add a new row for additional states
function addState() {
    const table = document.getElementById("transitionTable").getElementsByTagName("tbody")[0];
    const newRow = table.insertRow();
    for (let i = 0; i < 3; i++) {
        const cell = newRow.insertCell(i);
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = i === 0 ? "State" : `Next State for Input ${i - 1}`;
        cell.appendChild(input);
    }
}

// Function to draw a self-loop on a state with labels for inputs 0 and 1
function drawSelfLoop(ctx, position, label0, label1, loopPosition = 'top') {
    const { x, y } = position;
    const loopRadius = 20;
    const loopOffset = loopPosition === 'top' ? 35 : 49; // Increased offset for bottom loops

    // Adjust the loop position based on whether it's top or bottom
    const loopY = loopPosition === 'top' ? y - loopOffset : y + loopOffset;
    const startAngle = loopPosition === 'top' ? 0.80 * Math.PI : -0.30 * Math.PI;
    const endAngle = loopPosition === 'top' ? 2.20 * Math.PI : 0.25 * Math.PI;

    ctx.beginPath();
    ctx.arc(x, loopY, loopRadius, startAngle, endAngle, loopPosition === 'bottom');
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Draw arrowhead at the end of the loop
    ctx.beginPath();
    const arrowYDirection = loopPosition === 'top' ? -1 : 1;
    ctx.moveTo(x + loopRadius - 5, loopY - 5 * arrowYDirection);
    ctx.lineTo(x + loopRadius + 5, loopY - 5 * arrowYDirection);
    ctx.lineTo(x + loopRadius, loopY + 5 * arrowYDirection);
    ctx.closePath();
    ctx.fillStyle = "black";
    ctx.fill();

    // Label position adjustment for the loop
    ctx.fillStyle = "blue";
    ctx.font = "14px Arial";
    const labelY = loopPosition === 'top' ? loopY - loopRadius - 10 : loopY + loopRadius + 20; // Lower label position for bottom
    if (label0) ctx.fillText("0", x - 10, labelY);
    if (label1) ctx.fillText("1", x + 10, labelY);
}


// Function to draw a straight arrow between two states pointing to their centers
function drawFlexibleArrow(ctx, from, to, label) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const radius = 30;

    const startX = from.x + radius * Math.cos(angle);
    const startY = from.y + radius * Math.sin(angle);
    const endX = to.x - radius * Math.cos(angle);
    const endY = to.y - radius * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - 5 * Math.cos(angle - Math.PI / 6), endY - 5 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(endX - 5 * Math.cos(angle + Math.PI / 6), endY - 5 * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = "black";
    ctx.fill();

    ctx.fillStyle = "blue";
    ctx.font = "14px Arial";
    ctx.fillText(label, (startX + endX) / 2, (startY + endY) / 2 - 10);
}

function generateDiagram() {
    const canvas = document.getElementById("diagramCanvas");
    const ctx = canvas.getContext("2d");
    const rows = document.getElementById("transitionTable").getElementsByTagName("tbody")[0].rows;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const statePositions = {};
    const numStates = rows.length;
    const spacingX = 200;
    const spacingY = 150;

    let rowCount = Math.ceil(Math.sqrt(numStates));
    let x = 100, y = 100;

    for (let i = 0; i < numStates; i++) {
        const state = rows[i].cells[0].getElementsByTagName("input")[0].value.trim();
        if (state) {
            let stateColor = "white";
            if (i === 0) stateColor = "yellow";
            if (i === numStates - 1) stateColor = "pink";

            ctx.beginPath();
            ctx.arc(x, y, 30, 0, 2 * Math.PI);
            ctx.fillStyle = stateColor;
            ctx.fill();
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.stroke();

            if (i === numStates - 1) { 
                ctx.beginPath();
                ctx.arc(x, y, 25, 0, 2 * Math.PI);
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            ctx.font = "16px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(state, x - 10, y + 5);
            statePositions[state] = { x, y };

            x += spacingX;
            if ((i + 1) % rowCount === 0) {
                x = 100;
                y += spacingY;
            }
        }
    }

    const initialState = rows[0].cells[0].getElementsByTagName("input")[0].value.trim();
    if (initialState && statePositions[initialState]) {
        const { x, y } = statePositions[initialState];
        ctx.beginPath();
        ctx.moveTo(x - 60, y);
        ctx.lineTo(x - 35, y);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x - 40, y - 5);
        ctx.lineTo(x - 35, y);
        ctx.lineTo(x - 40, y + 5);
        ctx.fillStyle = "black";
        ctx.fill();
    }

    for (let i = 0; i < numStates; i++) {
        const cells = rows[i].cells;
        const state = cells[0].getElementsByTagName("input")[0].value.trim();
        const nextState0 = cells[1].getElementsByTagName("input")[0].value.trim();
        const nextState1 = cells[2].getElementsByTagName("input")[0].value.trim();

        if (statePositions[state]) {
            const from = statePositions[state];
            const loopPosition = i < rowCount ? 'top' : 'bottom';
            
            if (nextState0) {
                if (nextState0 === state) {
                    drawSelfLoop(ctx, from, "0", nextState1 === state ? "1" : null, loopPosition);
                } else if (statePositions[nextState0]) {
                    drawFlexibleArrow(ctx, from, statePositions[nextState0], "0");
                }
            }

            if (nextState1 && nextState1 !== nextState0) {
                if (nextState1 === state) {
                    drawSelfLoop(ctx, from, nextState0 === state ? "0" : null, "1", loopPosition);
                } else if (statePositions[nextState1]) {
                    drawFlexibleArrow(ctx, from, statePositions[nextState1], "1");
                }
            }
        }
    }
}
