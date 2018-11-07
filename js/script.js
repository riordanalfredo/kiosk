var canvas = document.querySelector( '#sketch' );
var context = canvas.getContext( '2d' );
var linePoints = [];
var canvasState = [];
var toolMode = 'draw';
var toolSize = 20;
var toolColor = 'black';
var undoButton = document.querySelector( '[data-action=undo]' );
var clearButton = document.querySelector( '[data-action=delete]' );
var infoButton = document.querySelector( '[data-action=info]');
var randomButton = document.querySelector( '[data-mode=random]' );
var currentBg = 'paper.jpg';
var randomBrush = false;
var randomColourArray = ['#Fbdc68','#E66859','#8b779b','#4a5165','#597eb2','#539b7d','#9dc080'];
var currentPosition = 0;
var theTimeOut;

context.strokeStyle = "#000000";
context.lineWidth = 5;
canvas.style.cursor = 'url(images/size'+toolSize+'.cur),crosshair';

context.lineJoin = "round";
context.lineCap = "round";

canvas.addEventListener( 'mousedown', draw );
canvas.addEventListener('touchstart',draw);
window.addEventListener( 'mouseup', stop );
window.addEventListener('touchend',stop);
window.addEventListener('resize', resizeCanvas);

var brushSizeArray = [5, 10, 15, 20, 25, 30, 40];

function setup() {
    canvas.addEventListener("mousemove", resetTimer, false);
    canvas.addEventListener("mousedown", resetTimer, false);
    canvas.addEventListener("mousewheel", resetTimer, false);
    canvas.addEventListener("keypress", resetTimer, false);
    canvas.addEventListener("touchmove", resetTimer, false);
    canvas.addEventListener("DOMMouseScroll", resetTimer, false);
    canvas.addEventListener("MSPointerMove", resetTimer, false);
    startTimer();
}
setup(); //Initial set up.
 
function startTimer() {
    // wait 30 seconds before being considered as inactive
    timer =  30 *1000;
    theTimeOut = window.setTimeout(inactive, timer);
}
 
function resetTimer(e) {
    window.clearTimeout(theTimeOut);
    active();
}
//Activate the timer when it is idle
function active() {         
    startTimer();
}

function inactive() {
    on();
}
//Clear the canvas and return it to default canvas background.
function startOver(){
    off();
    clearCanvas();
    canvas.style.background = 'url(images/backgrounds/paper.jpg)';
    canvas.style.backgroundSize = "cover";
}

document.querySelector( '#tools' ).addEventListener( 'click', otherTools );
document.querySelector( '#colors' ).addEventListener( 'click', selectTool );
document.querySelector( '#backgrounds' ).addEventListener( 'click', changeBackground );


function changeBackground(e){ 
    if ( e.target === e.currentTarget ) return;
    currentBg = e.target.dataset.bg || currentBg;
    canvas.style.background = 'url(images/backgrounds/'+ currentBg+')';
    canvas.style.backgroundRepeat  = "no-repeat";
    canvas.style.backgroundSize = "cover";
    resizeCanvas();
}
resizeCanvas();


function changeThin(){
    var slider = document.getElementById("slide");
    slider.value = slider.min;
}

function changeBold(){
    var slider = document.getElementById("slide");
    slider.value = slider.max;
}

function clearCanvas(){
    context.clearRect( 0, 0, canvas.width, canvas.height );
    canvasState = [];
    undoButton.classList.add( 'disabled' );
}

function draw( e ) {
  if ( e.which === 1 || e.type === 'touchstart' || e.type === 'touchmove') {
    window.addEventListener( 'mousemove', draw );
    window.addEventListener('touchmove', draw );
    var mouseX = e.pageX - canvas.offsetLeft;
    var mouseY = e.pageY - canvas.offsetTop;
    var mouseDrag = e.type === 'mousemove';
    if( e.type === 'touchstart' || e.type === 'touchmove'){
        mouseX = e.touches[0].pageX - canvas.offsetLeft;
        mouseY = e.touches[0].pageY - canvas.offsetTop;
        mouseDrag = e.type === 'touchmove';
    }  
    var brushSizeId = document.getElementById("slide");
    var brushSize = brushSizeId.value;
    if ( e.type === 'mousedown' || e.type === 'touchstart') saveState();
    //Add to array    
    var newColor = toolColor;
    var newWidth = brushSizeArray[brushSize];
    var pattern = 'black';
    
    if( randomBrush === true) {
        //newColor = randomColor(); 
      newWidth = randomSize();
      
    /**/
      var colorGrad= context.createLinearGradient(0,0,canvas.width,0);
      newColor = changeLinearGradient(colorGrad, currentBg);
    /**/
      //var pattern = context.createPattern(img,"repeat");
    }
    
    linePoints.push( { x: mouseX, y: mouseY, drag: mouseDrag,  width: newWidth , color: newColor} );
    
      
    updateCanvas();
  }
}

function highlightButton( button ) {
 var buttons = button.parentNode.querySelectorAll( 'img' );
 buttons.forEach( function( element ){ element.classList.remove('active') } );
 button.classList.add( 'active' );
}


function updateCanvas() {
  context.clearRect( 0, 0, canvas.width, canvas.height );
  var img = document.getElementById("oil");
  context.putImageData( canvasState[0], 0, 0 );
  renderLine();
}

function resizeCanvas(){
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if (canvasState.length )updateCanvas();
}

function renderLine() {
  for ( var i = 0, length = linePoints.length; i < length; i++ ) {
    if ( !linePoints[i].drag ) {
      //context.stroke();
      context.beginPath();
      context.lineWidth = linePoints[i].width;
      context.strokeStyle = linePoints[i].color;
      context.globalAlpha = 0.9;
      
      /*Shadow effect*/    
      context.shadowBlur = 2;
      context.shadowColor = 'rgba(0, 0, 0, 0.1)';
      context.shadowOffsetX = 3;
      context.shadowOffsetY = 4;
      context.lineJoin = "round";
      context.lineCap = "round";
        
      context.moveTo( linePoints[i].x, linePoints[i].y );
      context.lineTo( linePoints[i].x + 0.5, linePoints[i].y + 0.5 );
    } else {
      context.lineTo( linePoints[i].x, linePoints[i].y );
    }
  }
    
  if ( toolMode === 'erase' ) {
     context.globalCompositeOperation = 'destination-out';
     context.globalAlpha = 1;
   } else {
     context.globalCompositeOperation = 'source-over';
   }
    
  
  context.stroke();
}

function saveState() {
    canvasState.unshift( context.getImageData( 0,0,canvas.width,canvas.height ) );
    if ( canvasState.length > 25 ) canvasState.length = 25;
    linePoints = [];
    undoButton.classList.remove( 'disabled' );

}
function randomColor(){
    if(currentPosition === randomColourArray.length) currentPosition = 0;
    //console.log((linePoints.length % 100) === 0);
    toolColor = randomColourArray[currentPosition];
    if((linePoints.length % 20) === 0){
        currentPosition += 1;       
    }
    //renderLine();
    return toolColor;
}

function randomSize(){
    var brushPosition = Math.floor(Math.random() * brushSizeArray.length + 1);
    //renderLine();
    return brushSizeArray[brushPosition];
}


function otherTools(e){
    if ( e.target === undoButton ) undoState();
    if ( e.target === clearButton ) selectToClear();
    if ( e.target === infoButton) toggleInfo();
}

function selectTool( e ) {
     //console.log( e ); 
    if ( e.target === e.currentTarget ) return;
    if ( !e.target.dataset.action ) highlightButton( e.target );
    toolColor = e.target.dataset.color || toolColor;
    randomBrush = false;
    if (e.target === randomButton) activateRandom();
    toolMode = e.target.dataset.mode || toolMode;
    canvas.style.cursor = 'url(images/size'+ toolSize +'.cur),crosshair';
}


function activateRandom(){
    if(randomBrush === false) randomBrush = true;
}

function selectToClear(){
    off();
    document.getElementById("clearCanvas").style.display = "block";
}


function stop( e ) {
  if ( e.which === 1 || e.type === 'touchend') {
    window.removeEventListener( 'mousemove', draw );
    window.removeEventListener( 'touchmove', draw);
  }
}

function undoState() {
    context.putImageData( canvasState.shift(), 0, 0 );
    if ( !canvasState.length ) undoButton.classList.add( 'disabled' );
}


function changeLinearGradient(grd, bg){
    switch(bg){
        case 'bg1.jpeg':
            // Add colors
      grd.addColorStop(0.009, 'rgba(84, 119, 126, 1.000)');
      grd.addColorStop(0.133, 'rgba(108, 124, 160, 1.000)');
      grd.addColorStop(0.328, 'rgba(78, 84, 70, 1.000)');
      grd.addColorStop(0.562, 'rgba(118, 119, 103, 1.000)');
      grd.addColorStop(0.794, 'rgba(169, 162, 146, 1.000)');
      grd.addColorStop(0.976, 'rgba(205, 203, 191, 1.000)');
      
            break;
        case 'bg2.jpeg':
      grd.addColorStop(0.006, 'rgba(46, 59, 42, 1.000)');
      grd.addColorStop(0.136, 'rgba(71, 86, 66, 1.000)');
      grd.addColorStop(0.339, 'rgba(100, 115, 93, 1.000)');
      grd.addColorStop(0.562, 'rgba(147, 146, 84, 1.000)');
      grd.addColorStop(0.796, 'rgba(128, 151, 141, 1.000)');
      grd.addColorStop(0.991, 'rgba(173, 184, 168, 1.000)');
            break;
        case 'bg3.jpg':
      grd.addColorStop(0.006, 'rgba(75, 90, 74, 1.000)');
      grd.addColorStop(0.142, 'rgba(94, 111, 88, 1.000)');
      grd.addColorStop(0.346, 'rgba(113, 129, 105, 1.000)');
      grd.addColorStop(0.562, 'rgba(49, 76, 61, 1.000)');
      grd.addColorStop(0.796, 'rgba(138, 152, 122, 1.000)');
      grd.addColorStop(0.978, 'rgba(175, 179, 150, 1.000)');
            
            break;
        case 'bg4.jpg':
      grd.addColorStop(0.011, 'rgba(192, 187, 159, 1.000)');
      grd.addColorStop(0.144, 'rgba(174, 174, 151, 1.000)');
      grd.addColorStop(0.333, 'rgba(205, 200, 170, 1.000)');
      grd.addColorStop(0.575, 'rgba(87, 86, 74, 1.000)');
      grd.addColorStop(0.797, 'rgba(154, 155, 138, 1.000)');
      grd.addColorStop(0.993, 'rgba(124, 123, 107, 1.000)');
            
            break;
        case 'bg5.jpg':
             // Add colors
      grd.addColorStop(0.000, 'rgba(40, 91, 102, 1.000)');
      grd.addColorStop(0.254, 'rgba(118, 160, 185, 1.000)');
      grd.addColorStop(0.436, 'rgba(73, 125, 151, 1.000)');
      grd.addColorStop(0.659, 'rgba(96, 126, 106, 1.000)');
      grd.addColorStop(0.866, 'rgba(41, 64, 39, 1.000)');
      grd.addColorStop(0.994, 'rgba(78, 96, 59, 1.000)');
      
            
            break;
        case 'bg6.jpg':
      grd.addColorStop(0.000, 'rgba(65, 77, 60, 1.000)');
      grd.addColorStop(0.199, 'rgba(131, 136, 112, 1.000)');
      grd.addColorStop(0.359, 'rgba(95, 107, 97, 1.000)');
      grd.addColorStop(0.527, 'rgba(247, 208, 123, 1.000)');
      grd.addColorStop(0.678, 'rgba(168, 168, 163, 1.000)');
      grd.addColorStop(0.878, 'rgba(137, 146, 154, 1.000)');
      grd.addColorStop(1.000, 'rgba(113, 124, 136, 1.000)');
            
            break;
        case 'bg7.jpg':
      // Add colors
      grd.addColorStop(0.000, 'rgba(255, 127, 0, 1.000)');
      grd.addColorStop(0.168, 'rgba(0, 127, 63, 1.000)');
      grd.addColorStop(0.363, 'rgba(174, 127, 130, 1.000)');
      grd.addColorStop(0.599, 'rgba(153, 174, 190, 1.000)');
      grd.addColorStop(0.842, 'rgba(92, 129, 146, 1.000)');
      grd.addColorStop(1.000, 'rgba(78, 85, 77, 1.000)');
            
            break;
        default:
      //Paper colour
      grd.addColorStop(0.000, 'rgba(83, 155, 125, 1.000)');
      grd.addColorStop(0.081, 'rgba(157, 192, 128, 1.000)');
      grd.addColorStop(0.227, 'rgba(251, 220, 104, 1.000)');
      grd.addColorStop(0.424, 'rgba(230, 104, 89, 1.000)');
      grd.addColorStop(0.575, 'rgba(170, 71, 132, 1.000)');
      grd.addColorStop(0.700, 'rgba(139, 119, 155, 1.000)');
      grd.addColorStop(0.860, 'rgba(89, 126, 178, 1.000)');
      grd.addColorStop(1.000, 'rgba(74, 81, 101, 1.000)');
          break;
    }
    return grd;
}

//Overlay
function on() {
    offClear();
    offInfo();
    document.getElementById("overlay").style.display = "block";
}

function off() {
    document.getElementById("overlay").style.display = "none";
}


function offClear() {
    document.getElementById("clearCanvas").style.display = "none";
}


function toggleInfo(){
    document.getElementById("information").style.display = "block";
}

function offInfo(){
    document.getElementById("information").style.display = "none";
}






