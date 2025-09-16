const rgbToHex = (r, g, b) => `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
console.log(rgbToHex(0, 0, 0));
// Преобразование цвета из формата Hex в RGB
const hexToRgb = hex => {
    let [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
    return { r, g, b }
};

class Particle {
    constructor(x, y, health=1, toxicity=false, birthTime=0) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.type = "particle";
        this.force = 0;
        this.health = health;
        this.toxicity = false;
        this.birthTime = birthTime;
        // console.log(toxicity);
    }
    update(objects, time) {
        this.draw();
        this.toxicityUpdate(time);
        this.fluctuations();
    }
    fluctuations() {
        this.x += getRandomArbitrary(-1, 1) * 0.5;
        this.y += getRandomArbitrary(-1, 1) * 0.5;
    }
    draw() {
        // console.log(this.toxicity);
        if (this.toxicity == true) {
            ctx.fillStyle = redColor;
        }
        else {
            ctx.fillStyle = greenColor;
        }
        ctx.fillRect(this.x/scale-1, this.y/scale-1, 3, 3);
    }
    toxicityUpdate(time) {
        if (time - this.birthTime > 500) {
            this.toxicity = false;
        }
    }
}

class Bacteria {
    constructor(x, y, health, dividehealth, birthTime, deathPeriod, force, color, mutationChance) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.health = health;
        this.type = "bacteria";
        this.dividehealth = dividehealth;
        this.name = "";
        this.birthTime = birthTime;
        this.deathPeriod = deathPeriod;
        this.deathTime = birthTime + deathPeriod;
        this.force = force;
        this.color = color;
        this.mutationChance = mutationChance;
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
            if (r < minR & r != 0) {
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
        if (this.force == minO.force & r <= 10) {
            this.x -= nx * dt;
            this.y -= ny * dt;
        }
        else if (this.force > minO.force & r <= 50) {
            this.x += nx * dt;
            this.y += ny * dt;
        }

        // if (this.x <= 0 & this.vx < 0) {
        //     this.vx *= -1
        // }
        // if (this.y <= 0 & this.vy < 0) {
        //     this.vy *= -1
        // }
        // if (this.x >= borderX & this.vx > 0) {
        //     this.vx *= -1
        // }
        // if (this.y >= borderY & this.vy > 0) {
        //     this.vy *= -1
        // }
        if (this.x <= 0) {
            this.x += 50;
        }
        if (this.y <= 0) {
            this.y += 50;
        }
        if (this.x >= borderX) {
            this.x -= 50;
        }
        if (this.y >= borderY) {
            this.y -= 50;
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
            if (r < 2 & r != 0 & this.force != o.force) {
                if (getRandomArbitrary(0, this.force) <= this.force - o.force) {
                    if (o.type == "particle") {
                        if (o.toxicity == true) {
                            this.die(objects);
                            console.log("death");
                        }
                        else {
                            this.health += o.health;
                            objects.splice(objects.indexOf(o), 1);
                        }
                    }
                    else {
                        this.health += o.health;
                        objects.splice(objects.indexOf(o), 1);
                    }
                }
            }
        });
    }
    divide(objects, time) {
        if (this.health >= this.dividehealth) {
            // console.log(this.health)
            let key = getRandomArbitrary(0, 1);
            let dividehealth = this.dividehealth;
            let deathPeriod = this.deathPeriod;
            let force = this.force;
            let color = this.color;
            let mutationChance = this.mutationChance;
            // Mutation
            if (key < greatMutationChance) {
                objects.push(new Bacteria(this.x+getRandomArbitrary(-3, 3), this.y+getRandomArbitrary(-3, 3), health=this.health/2, dividehealth=Math.trunc(dividehealth), birthTime=time, deathPeriod=Math.trunc(deathPeriod), force=Math.trunc(force), color=color, mutationChance=mutationChance));
            }
            if (key < this.mutationChance) {
                if (dividehealth > 3) {
                    dividehealth += 2 * getRandomArbitrary(-1, 1);
                }
                else {
                    dividehealth += 2 * getRandomArbitrary(0, 1);
                }
                let forceP = getRandomArbitrary(-100, 100);
                let deathPeriodP = getRandomArbitrary(-10, 10);
                deathPeriod += deathPeriodP;
                force += forceP;
                mutationChance += getRandomArbitrary(-0.0001, 0.0001);
                if (mutationChance <= 0) {
                    mutationChance = 0.0001
                }
                if (mutationChance >= 1) {
                    mutationChance = 0.9999
                }
                color = getRandomColor();
            }
            objects.push(new Bacteria(this.x+getRandomArbitrary(-3, 3), this.y+getRandomArbitrary(-3, 3), health=this.health/2, dividehealth=Math.trunc(dividehealth), birthTime=time, deathPeriod=Math.trunc(deathPeriod), force=Math.trunc(force), color=color, mutationChance=mutationChance));
            this.health /= 2;
        }
    }
    die(objects) {
        objects.push(new Particle(this.x, this.y, this.health, true));
        objects.splice(objects.indexOf(this), 1);
    }
    death(objects, time) {
        if (time >= this.deathTime){
            this.die(objects);
        }
    }
    draw() {
        // let red = 255 - Math.trunc(255/this.force);
        // let green = 255 - Math.trunc(255/this.dividehealth);
        // let blue = 255 - Math.trunc(255/this.deathPeriod);
        // // console.log(red, green, blue)
        // let color = rgbToHex(red, green, blue);
        
        // console.log(color);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x/scale-2, this.y/scale-2, 5, 5);
    }
}

class Amoeba {
    constructor(x, y, health, dividehealth, birthTime, deathPeriod, force, color, mutationChance) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.health = health;
        this.type = "amoeba";
        this.dividehealth = dividehealth;
        this.name = "";
        this.birthTime = birthTime;
        this.deathPeriod = deathPeriod;
        this.deathTime = birthTime + deathPeriod;
        this.force = force;
        this.color = color;
        this.mutationChance = mutationChance;
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
            if (r < minR & r != 0) {
                minO = o;
                minR = r;
                // console.log(minO, minR)
            }
        });
        
        let f = 0.3;
        let rx = minO.x-this.x;
        let ry = minO.y-this.y;
        // console.log(rx, ry);
        // console.log(minO.x, ry)
        let r = Math.sqrt(rx**2 + ry**2);
        let nx = f * rx / r;
        let ny = f * ry / r;
        // console.log(r);
        if (this.force == minO.force & r <= 10) {
            this.x -= nx * dt;
            this.y -= ny * dt;
        }
        else if (this.force > minO.force & r <= 50) {
            this.x += nx * dt;
            this.y += ny * dt;
        }

        // if (this.x <= 0 & this.vx < 0) {
        //     this.vx *= -1
        // }
        // if (this.y <= 0 & this.vy < 0) {
        //     this.vy *= -1
        // }
        // if (this.x >= borderX & this.vx > 0) {
        //     this.vx *= -1
        // }
        // if (this.y >= borderY & this.vy > 0) {
        //     this.vy *= -1
        // }
        if (this.x <= 0) {
            this.x += 50;
        }
        if (this.y <= 0) {
            this.y += 50;
        }
        if (this.x >= borderX) {
            this.x -= 50;
        }
        if (this.y >= borderY) {
            this.y -= 50;
        }
    }
    fluctuations() {
        this.x += getRandomArbitrary(-1, 1) * 0.5;
        this.y += getRandomArbitrary(-1, 1) * 0.5;
    }
    eat(objects) {
        objects.forEach(o => {
            let rx = o.x-this.x;
            let ry = o.y-this.y;
            let r = Math.sqrt(rx**2 + ry**2);
            if (r < 2 & r != 0 & this.force != o.force) {
                if (getRandomArbitrary(0, this.force) <= this.force - o.force) {
                    if (o.type == "particle") {
                        if (o.toxicity == true) {
                            this.die(objects);
                            console.log("death");
                        }
                        else {
                            this.health += o.health;
                            objects.splice(objects.indexOf(o), 1);
                        }
                    }
                    else {
                        this.health += o.health;
                        objects.splice(objects.indexOf(o), 1);
                    }
                }
            }
        });
    }
    divide(objects, time) {
        if (this.health >= this.dividehealth) {
            // console.log(this.health)
            let key = getRandomArbitrary(0, 100);
            let dividehealth = this.dividehealth;
            let deathPeriod = this.deathPeriod;
            let force = this.force;
            let color = this.color;
            let mutationChance = this.mutationChance;
            // Mutation
            if (key < this.mutationChance * 100) {
                if (dividehealth > 3) {
                    dividehealth += 2 * getRandomArbitrary(-1, 1);
                }
                else {
                    dividehealth += 2 * getRandomArbitrary(0, 1);
                }
                let forceP = getRandomArbitrary(-100, 100);
                let deathPeriodP = getRandomArbitrary(-300, 300);
                deathPeriod += deathPeriodP;
                force += forceP;
                mutationChance += getRandomArbitrary(-0.005, 0.005);
                if (mutationChance <= 0) {
                    mutationChance = 0.001
                }
                if (mutationChance >= 1) {
                    mutationChance = 0.999
                }
                color = getRandomColor();
            }
            objects.push(new Amoeba(this.x+getRandomArbitrary(-3, 3), this.y+getRandomArbitrary(-3, 3), health=this.health/2, dividehealth=Math.trunc(dividehealth), birthTime=time, deathPeriod=Math.trunc(deathPeriod), force=Math.trunc(force), color=color, mutationChance=mutationChance));
            this.health /= 2;
        }
    }
    die(objects) {
        objects.push(new Particle(this.x, this.y, this.health, true));
        objects.splice(objects.indexOf(this), 1);
    }
    death(objects, time) {
        if (time >= this.deathTime){
            this.die(objects);
        }
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x/scale-3, this.y/scale-3, 7, 7);
    }
}

let bacteriasList = [];
let bacteriasColorList = [];

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const bacteriasListHTML = document.getElementById("bacterias-list");
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

canvas.width = 300;
canvas.height = 300;

let scale = 1;
let borderX = 300;
let borderY = 300;

let objects = [];
const greenColor = "#6CF46C";
const redColor = "#F17865";
const blueColor = "#6CE1F4";

let n = 700;
for (let i = 0; i < n; i++) {
    objects.push(new Particle(getRandomArbitrary(10, borderX-10)*scale, getRandomArbitrary(10, borderY-10)*scale, 100));
}
for (let i = 0; i < 1; i++) {
    objects.push(new Bacteria(getRandomArbitrary(100, 200)*scale, getRandomArbitrary(100, 200)*scale, health=0, dividehealth=100, birthTime=0, deathPeriod=200, force=100, color=redColor, mutationChance=0.005));
}
// objects.push(new Amoeba(getRandomArbitrary(400, 500)*scale, getRandomArbitrary(100, 200)*scale, health=0, dividehealth=1000, birthTime=0, deathPeriod=5000, force=1000, color=blueColor, mutationChance=0.001))

// objects.push(new Bacteria(200, 200, 1, 2, 0, 10000, 10));
// objects.push(new Bacteria(210, 200, 2, 5, 0, 10000, 5));

let animationId;
let pastTime;
let maxFps = 120;
let time = 0;
let dt = 1;
let greatMutationChance = 0.0001;


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
    bacteriasList = [];
    bacteriasColorList = [];
    objects.forEach(e => {
        e.update(objects, time);
        if (e.type == "bacteria") {
            let colorIndex = bacteriasColorList.indexOf(e.color)
            if (colorIndex == -1) {
                bacteriasList.push([1, e.color, e.mutationChance, e.dividehealth, e.force])
                bacteriasColorList.push(e.color);
            }
            else {
                bacteriasList[colorIndex][0] += 1;
            }
        }
    });
    // bacteriasList = bacteriasList.sort().reverse();
    // bacteriasList.forEach(b => {
    //     bacteriasListHTML.innerHTML = bacteriasList;
    // })
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

document.addEventListener('keydown', function (event) {
    if (event.key == " ") {
        if (maxFps == -1) {
            maxFps = 120;
        }
        else {
            maxFps = -1;
        }
    }
    if (event.key == "b") {
        console.log(bacteriasList);
        console.log(bacteriasColorList);
    }
    if (event.key == "w") {
        dt *= 2;
    }
    if (event.key == "q") {
        dt /= 2;
    }

    // console.log(event);
})