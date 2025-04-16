const rgbToHex = (r, g, b) => `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
console.log(rgbToHex(0, 0, 0));
// Преобразование цвета из формата Hex в RGB
const hexToRgb = hex => {
    let [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
    return { r, g, b }
};

class Food {
    constructor(x, y, fullness=1) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.type = "food";
        this.force = 0;
        this.fullness = fullness;
        
    }
    update(objects) {
        this.draw();
    }
    draw() {
        ctx.fillStyle = greenColor;
        ctx.fillRect(this.x/scale-2, this.y/scale-2, 5, 5);
    }
}

class Bacteria {
    constructor(x, y, fullness, divideFullness, birthTime, deathPeriod, force) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.fullness = fullness;
        this.type = "bacteria";
        this.divideFullness = divideFullness;
        this.name = "";
        this.birthTime = birthTime;
        this.deathPeriod = deathPeriod;
        this.deathTime = birthTime + deathPeriod;
        this.force = force;
    }
    update(objects, time) {
        this.draw();
        this.follow(objects);
        this.fluctuations();
        this.eat(objects);
        this.divide(objects, time);
        this.death(objects, time);
    }
    follow(objects) {
        let minR = 100000000000000;
        let minO = 0;
        objects.forEach(o => {
            let rx = o.x-this.x;
            let ry = o.y-this.y;
            let r = Math.sqrt(rx**2 + ry**2);
            if (r < minR & r != 0 & o.force != this.force) {
                minO = o;
                minR = r;
                // console.log(minO, minR)
            }
        });
        
        let f = 1;
        let rx = minO.x-this.x;
        let ry = minO.y-this.y;
        // console.log(rx, ry);
        // console.log(minO.x, ry)
        let r = Math.sqrt(rx**2 + ry**2);
        let nx = f * rx / r;
        let ny = f * ry / r;
        // console.log(r);
        if (r <= 50) {
            this.x += nx * dt;
            this.y += ny * dt;
        }

        if (this.x <= 0 & this.vx < 0) {
            this.vx *= -1
        }
        if (this.y <= 0 & this.vy < 0) {
            this.vy *= -1
        }
        if (this.x >= borderX & this.vx > 0) {
            this.vx *= -1
        }
        if (this.y >= borderY & this.vy > 0) {
            this.vy *= -1
        }
    }
    fluctuations() {
        this.x += getRandomArbitrary(-1, 1) * 1.5;
        this.y += getRandomArbitrary(-1, 1) * 1.5;
    }
    eat(objects) {
        objects.forEach(o => {
            let rx = o.x-this.x;
            let ry = o.y-this.y;
            let r = Math.sqrt(rx**2 + ry**2);
            if (r < 2 & r != 0 & this.force > o.force) {
                if (getRandomArbitrary(0, this.force) < this.force - o.force) {
                    this.fullness += o.fullness;
                    objects.splice(objects.indexOf(o), 1);
                }
            }
        });
    }
    divide(objects, time) {
        if (this.fullness >= this.divideFullness) {
            let key = getRandomArbitrary(0, 100);
            let divideFullness = this.divideFullness;
            let deathPeriod = this.deathPeriod;
            let force = this.force;
            // Mutation
            if (key > 99) {
                if (divideFullness > 3) {
                    divideFullness += 2 * getRandomArbitrary(-1, 1);
                }
                else {
                    divideFullness += 2 * getRandomArbitrary(0, 1);
                }
                let forceP = getRandomArbitrary(-100, 100);
                let deathPeriodP = getRandomArbitrary(-100, 100);
                deathPeriod += deathPeriodP;
                force += forceP;
            }
            objects.push(new Bacteria(this.x+getRandomArbitrary(-3, 3), this.y+getRandomArbitrary(-3, 3), fullness=this.fullness/2, divideFullness=Math.trunc(divideFullness), birthTime=time, deathPeriod=Math.trunc(deathPeriod), force=Math.trunc(force)));
            this.fullness /= 2;
        }
    }
    death(objects, time) {
        if (time >= this.deathTime){
            objects.push(new Food(this.x, this.y, this.fullness));
            objects.splice(objects.indexOf(this), 1);
        }
    }
    draw() {
        let red = 255 - Math.trunc(255/this.force);
        let green = 255 - Math.trunc(255/this.divideFullness);
        let blue = 255 - Math.trunc(255/this.deathPeriod);
        // console.log(red, green, blue)
        let color = rgbToHex(red, green, blue);
        
        // console.log(color);
        ctx.fillStyle = color;
        ctx.fillRect(this.x/scale-2, this.y/scale-2, 5, 5);
        

    }
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let scale = 1;
let borderX = window.innerWidth;
let borderY = window.innerHeight;


let objects = [];
const greenColor = "#6CF46C";
const redColor = "#F17865";
const blueColor = "#6CE1F4";

let n = 2000
for (let i = 0; i < n; i++) {
    objects.push(new Food(getRandomArbitrary(10, borderX-10)*scale, getRandomArbitrary(10, borderY-10)*scale));
}
for (let i = 0; i < 1; i++) {
    objects.push(new Bacteria(getRandomArbitrary(100, 200)*scale, getRandomArbitrary(100, 200)*scale, fullness=0, divideFullness=2, birthTime=0, deathPeriod=500, force=1));
}

// objects.push(new Bacteria(200, 200, 1, 2, 0, 10000, 10));
// objects.push(new Bacteria(210, 200, 2, 5, 0, 10000, 5));

let animationId;
let pastTime;
let maxFps = 120;
let time = 0;
let dt = 0.1



window.onload = startAnimation;

function startAnimation() {
	frame();
	pastTime = 0;
}

function frame() {
	animationId = requestAnimationFrame(frame);

	let time = Date.now();
	let delta = time - pastTime;
	let fps = Math.floor(1000 / delta);

	if (fps <= maxFps) {
		draw();
		pastTime = Date.now();
	}
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

    time += 1;
    
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    objectsUpdate();
}

function objectsUpdate() {
    let s = 0;
    objects.forEach(e => {
        e.update(objects, time);
        s += e.fullness;
        // console.log(e.force, e.divideFullness, e.deathPeriod);
    });
    console.log(s);
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}