var canvas;
var context;
function Ball(minr, maxr, color){
    var r = parseInt(Math.random()*255),g = parseInt(Math.random()*255),b = parseInt(Math.random()*255), a = Math.random();
    if (minr === undefined) { minr = 20; }
    if (maxr === undefined) { maxr = 10; }
    if (color === undefined) { color = "RGBA("+r+","+g+","+b+","+a+")"; }
}
var balls = [];
var friction = 0;//摩擦
Ball.prototype.init=function(id, num){
    if (num === undefined) { num = 5; }
    balls =[];
    var maxSize = 30;
    var minSize = 25;
    var numBalls = num ;
    var tempBall = [];
    var tempX = 0;
    var tempY =0;
    var tempSpeed;
    var tempAngle;
    var tempRadius;
    var tempRadians;
    var tempvelocityx;
    var tempvelocityy;


    canvas = document.getElementById(id);
    context = canvas.getContext('2d');

    for (var i = 0; i < numBalls; i++) {
        tempRadius = Math.floor(Math.random()*maxSize)+minSize;
        var placeOK = false;
        while (!placeOK) {
            tempX = tempRadius*3 + (Math.floor(Math.random()*canvas.width)-tempRadius*3);
            tempY = tempRadius*3 + (Math.floor(Math.random()*canvas.height)-tempRadius*3);
            tempSpeed = 1;
            tempAngle =  Math.floor(Math.random()*360);
            tempRadians = tempAngle * Math.PI/ 180;
            tempvelocityx = Math.cos(tempRadians) * tempSpeed;
            tempvelocityy = Math.sin(tempRadians) * tempSpeed;

            tempBall = {x:tempX,y:tempY,radius:tempRadius, speed:tempSpeed, angle:tempAngle, velocityx:tempvelocityx, velocityy:tempvelocityy, mass:tempRadius*8, nextx: tempX, nexty:tempY};
            placeOK = canStartHere(tempBall);
        }
        balls.push(tempBall);
    }

    window.clearTimeout(obj);
    gameLoop();
};

function  drawScreen () {
    //context.fillStyle = '#EEEEEE';//填充canvas的颜色
    //context.fillRect(0, 0, canvas.width, canvas.height);//填充canvas的背景
    context.clearRect(0, 0, canvas.width, canvas.height);//清除小球的路线
    //context.strokeStyle = '#512333';//边框线的画笔颜色
    //context.strokeRect(0,  0, canvas.width, canvas.height);//画边框线

    update();
    testWalls();
    collide();
    render();
}

function update() {

    for (var i =0; i <balls.length; i++) {
        ball = balls[i];
        ball.velocityx = ball.velocityx - ( ball.velocityx*friction);
        ball.velocityy = ball.velocityy - ( ball.velocityy*friction);
        ball.nextx = (ball.x += ball.velocityx);
        ball.nexty = (ball.y += ball.velocityy);
    }
}

function testWalls() {
    var ball;
    var testBall;

    for (var i =0; i <balls.length; i++) {
        ball = balls[i];
        if (ball.nextx+ball.radius > canvas.width) {
            ball.velocityx = ball.velocityx*-1;
            ball.nextx = canvas.width - ball.radius;

        } else if (ball.nextx-ball.radius < 0 ) {
            ball.velocityx = ball.velocityx*-1;
            ball.nextx =  ball.radius;

        } else if (ball.nexty+ball.radius > canvas.height ) {
            ball.velocityy = ball.velocityy*-1;
            ball.nexty = canvas.height - ball.radius;

        } else if(ball.nexty-ball.radius < 0) {
            ball.velocityy = ball.velocityy*-1;
            ball.nexty =  ball.radius;
        }
    }

}

function render() {
    var ball;
    context.fillStyle = "red";
    for (var i =0; i <balls.length; i++) {
        ball = balls[i];
        ball.x = ball.nextx;
        ball.y = ball.nexty;
        context.save();
        //context.fillStyle = "green";
        var radiusBg = context.createRadialGradient(ball.x,ball.y,0,ball.x,ball.y,ball.radius);
             radiusBg.addColorStop(0,"#cbc0f3");
             radiusBg.addColorStop(1,"#06198b");
             context.fillStyle=radiusBg;
        context.beginPath();
        context.arc(ball.x,ball.y,ball.radius,0,Math.PI*2,true);
        context.closePath();
        //context.restore();
        
        context.fill();
        context.drawImage(watermark(),ball.x-25,ball.y-10);
        
    }

}

function collide() {
    var ball;
    var testBall;
    for (var i =0; i <balls.length; i++) {
        ball = balls[i];
        for (var j = i+1; j < balls.length; j++) {
            testBall = balls[j];
            if (hitTestCircle(ball,testBall)) {
                collideBalls(ball,testBall);
            }
        }
    }
}

function hitTestCircle(ball1,ball2) {
    var retval = false;
    var dx = ball1.nextx - ball2.nextx;
    var dy = ball1.nexty - ball2.nexty;
    var distance = (dx * dx + dy * dy);
    if (distance <= (ball1.radius + ball2.radius) * (ball1.radius + ball2.radius) ) {
        retval = true;
    }
    return retval;
}

/**
 * 检测一个小球是否和其他小球碰撞
 * @param ball1
 * @param ball2
 */
function collideBalls(ball1,ball2) {

    var dx = ball1.nextx - ball2.nextx;
    var dy = ball1.nexty - ball2.nexty;
    var collisionAngle = Math.atan2(dy, dx);

    var speed1 = Math.sqrt(ball1.velocityx * ball1.velocityx + ball1.velocityy * ball1.velocityy);
    var speed2 = Math.sqrt(ball2.velocityx * ball2.velocityx + ball2.velocityy * ball2.velocityy);

    var direction1 = Math.atan2(ball1.velocityy, ball1.velocityx);
    var direction2 = Math.atan2(ball2.velocityy, ball2.velocityx);

    var velocityx_1 = speed1 * Math.cos(direction1 - collisionAngle);
    var velocityy_1 = speed1 * Math.sin(direction1 - collisionAngle);
    var velocityx_2 = speed2 * Math.cos(direction2 - collisionAngle);
    var velocityy_2 = speed2 * Math.sin(direction2 - collisionAngle);

    var final_velocityx_1 = ((ball1.mass - ball2.mass) * velocityx_1 + (ball2.mass + ball2.mass) * velocityx_2)/(ball1.mass + ball2.mass);
    var final_velocityx_2 = ((ball1.mass + ball1.mass) * velocityx_1 + (ball2.mass - ball1.mass) * velocityx_2)/(ball1.mass + ball2.mass);

    var final_velocityy_1 = velocityy_1;
    var final_velocityy_2 = velocityy_2;

    ball1.velocityx = Math.cos(collisionAngle) * final_velocityx_1 + Math.cos(collisionAngle + Math.PI/2) * final_velocityy_1;
    ball1.velocityy = Math.sin(collisionAngle) * final_velocityx_1 + Math.sin(collisionAngle + Math.PI/2) * final_velocityy_1;
    ball2.velocityx = Math.cos(collisionAngle) * final_velocityx_2 + Math.cos(collisionAngle + Math.PI/2) * final_velocityy_2;
    ball2.velocityy = Math.sin(collisionAngle) * final_velocityx_2 + Math.sin(collisionAngle + Math.PI/2) * final_velocityy_2;

    ball1.nextx = (ball1.nextx += ball1.velocityx);
    ball1.nexty = (ball1.nexty += ball1.velocityy);
    ball2.nextx = (ball2.nextx += ball2.velocityx);
    ball2.nexty = (ball2.nexty += ball2.velocityy);
}


function canStartHere(ball) {
    var retval = true;
    for (var i =0; i <balls.length; i++) {
        if (hitTestCircle(ball, balls[i])) {
            retval = false;
        }
    }
    return retval;
}
var obj;
function gameLoop(num) {
    obj=window.setTimeout(gameLoop, 20);
    drawScreen(num);
}
function watermark(str){
    if( str === undefined) { str = "沃德站"}
    var canvas2 =document.getElementById('canvas2');
    var ctx = canvas2.getContext('2d');
    canvas2.width = 45;
    canvas2.height = 20;
    ctx.font = "14px Arial";
    ctx.fillStyle = "rgba(5,25,25,1)";
    ctx.textBaseline ='middle';
    ctx.fillText(str,3,8);
    return canvas2;
}