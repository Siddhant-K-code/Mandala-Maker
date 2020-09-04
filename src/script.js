function _(e, all=false) {
    let divs = document.querySelectorAll(e);
    if (all || (divs.length > 1)) { return divs; }
    return divs[0];
}

const base = _('.base');
const baseCTX = base.getContext("2d");

const draw = _('.draw');
const ctx = draw.getContext("2d");

var cwidth = 1024;
var cheight = 1024;
base.width = cwidth;
base.height = cheight;
draw.width = cwidth;
draw.height = cheight;

let parts = 12;
let lineWidth = 2;
let rect = false;
let mirror = true;

let lastX = 0;
let lastY = 0;
let lastAngle = 0;
let lastDistance = 0;

draw.lineWidth = lineWidth;
draw.lineCap = "round";

ctx.strokeStyle = "#f00";
ctx.fillStyle = "#f00";

baseCTX.lineWidth = 2;
baseCTX.strokeStyle = "rgba(0, 0, 0, 0.1)";

document.addEventListener('mousedown', function(e) {
    rect = draw.getBoundingClientRect();
    lastX = (e.clientX - rect.x) / rect.width * 1024;
    lastY = (e.clientY - rect.y) / rect.width * 1024;
    lastAngle = (((Math.atan2(lastY - 512, lastX - 512) * 180 / Math.PI) + 450) % 360) / 90;
    lastDistance = Math.sqrt(Math.pow(lastY - 512, 2) + Math.pow(lastX - 512, 2));
});

document.addEventListener('mouseup', function(e) {
    rect = false;
});

draw.addEventListener('mousemove', drawCanvas);

_('[name="parts"]').addEventListener('change', function(e) {
    if (e.target.value < 2) { return false; }
    if (e.target.value > 24) { return false; }
    if ((e.target.value/2) != Math.round(e.target.value/2)) { return false; }
    parts = e.target.value;
    drawParts();
});

_('[name="width"]').addEventListener('change', function(e) {
    if (e.target.value < 1) { return false; }
    if (e.target.value > 10) { return false; }
    lineWidth = Math.round(e.target.value);
    ctx.lineWidth = lineWidth;
});

_('[name="color"]').addEventListener('change', function(e) {
    ctx.strokeStyle = e.target.value;
    ctx.fillStyle = e.target.value;
});

clearCanvas();
drawParts();

function clearCanvas() {
    let lastFllStyle = ctx.fillStyle
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cwidth, cheight);
    ctx.fillStyle = lastFllStyle;
}

function drawParts() {

    baseCTX.clearRect(0, 0, cwidth, cheight);

    baseCTX.beginPath();
    baseCTX.arc(512, 512, 128, 0, 2 * Math.PI);      
    baseCTX.stroke();

    baseCTX.beginPath();
    baseCTX.arc(512, 512, 256, 0, 2 * Math.PI);      
    baseCTX.stroke();

    baseCTX.beginPath();
    baseCTX.arc(512, 512, 384, 0, 2 * Math.PI);      
    baseCTX.stroke();

    for (let i = 0; i < parts; i++) {

        let thisAngle = 4 / parts * i
        let thisX = 512 + (512 * Math.sin(thisAngle * (Math.PI / 2)));
        let thisY = 512 + (512 * Math.sin((thisAngle - 1) * (Math.PI / 2)));

        baseCTX.beginPath();
        baseCTX.moveTo(512, 512);
        baseCTX.lineTo(thisX,thisY);   
        baseCTX.stroke();
    }
}

function drawCanvas(e) {
    if (!rect) { return false; }

    let thisX = (e.clientX - rect.x) / rect.width * 1024;
    let thisY = (e.clientY - rect.y) / rect.width * 1024;

    let thisAngle = (((Math.atan2(thisY - 512, thisX - 512) * 180 / Math.PI) + 450) % 360) / 90;
    let thisDistance = Math.sqrt(Math.pow(thisY - 512, 2) + Math.pow(thisX - 512, 2));
    
    for (let i = 0; i < parts; i++) {

        let newAngle1;
        let newAngle2;

        if (mirror && ((i/2) != Math.round(i/2))) {

            newAngle1 = ((4-thisAngle) - ((4 / parts) * (i-1)));
            newAngle2 = ((4-lastAngle) - ((4 / parts) * (i-1)));
            
        } else {

            newAngle1 = (thisAngle + ((4 / parts) * i));
            newAngle2 = (lastAngle + ((4 / parts) * i));
        }

        let cX = 512 + (thisDistance * Math.sin(newAngle1 * (Math.PI / 2)));
        let cY = 512 + (thisDistance * Math.sin((newAngle1 - 1) * (Math.PI / 2)));

        let dX = 512 + (lastDistance * Math.sin(newAngle2 * (Math.PI / 2)));
        let dY = 512 + (lastDistance * Math.sin((newAngle2 - 1) * (Math.PI / 2)));

        ctx.beginPath();
        ctx.arc(cX, cY, (lineWidth-1)/2, 0, 2 * Math.PI);      
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cX, cY);
        ctx.lineTo(dX, dY);   
        ctx.stroke();
    }

    lastAngle = thisAngle;
    lastDistance = thisDistance;
}

function setGrid(e) {
    if (e.checked) {
        _('.base').classList.add('show');
    } else {
        _('.base').classList.remove('show');
    }
}

function setMirrored(e) {
    mirror = e.checked;
}

function download(){
    let link = document.createElement('a');
    link.setAttribute('download', 'mandala.png');
    link.setAttribute('href', draw.toDataURL("image/png").replace("image/png", "image/octet-stream"));
    link.click();
}
