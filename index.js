console.log(gsap);
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;


const scoreEl = document.querySelector('#scoreEl');
const StartGameBtn = document.querySelector('#StartGameBtn');
const modelEl = document.querySelector('#ModelEl');
const bigScoreEl = document.querySelector('#bigScoreEl');

class Player {
	constructor(x, y, radius, color) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
	}

	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
	}
}

class Projectile {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}

	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
	}

	update() {
		this.draw();
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
	}
}

class Enemy {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}

	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
	}

	update() {
		this.draw();
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
	}
}

const friction = 0.99;
class Particle {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
		this.alpha = 1;
	}

	draw() {
		c.save();
		c.globalAlpha = this.alpha;
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
		c.restore();
	}

	update() {
		this.draw();
		this.velocity.x *= friction;
		this.velocity.y *= friction;
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
		this.alpha -= 0.01;
	}
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 10, 'white');
let projectiles = [];
let enemies = [];
let particles = [];

function init() {
	player = new Player(x, y, 10, 'white');
	projectiles = [];
	enemies = [];
	particles = [];
	score = 0;
	scoreEl.innerHTML = score;
	bigScoreEl.innerHTML = score;
}

function spawnEnemies() {
	setInterval(() => {
		const radius = Math.random() * (30 - 4) + 4 ;

		let x;
		let y;

		 if (Math.random() < 0.5) {
			x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
			y = Math.random() * canvas.height;
		 } else {
		 	x = Math.random() * canvas.width;
		 	y = Math.random() < 0.5 ? 0 - radius : canvas.height - radius;
		 }


		const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

		const angle = Math.atan2(
			canvas.height / 2 - y, 
			canvas.width / 2 - x
			);
		const velocity = {
		x: Math.cos(angle),
		y: Math.sin(angle),
	}
		enemies.push(new Enemy(x, y, radius, color, velocity));
	}, 1000)
}

let animationId;
let score = 0;
function animate() {
	animationId = requestAnimationFrame(animate);
	c.fillStyle = 'rgba(0, 0, 0, 0.1)';
	c.fillRect(0, 0, canvas.width, canvas.height);
	player.draw();
	particles.forEach((particle, index) => {
		if (particle.alpha <= 0) {
			particles.splice(index, 1);
		} else {
			particle.update();
		}
	});
	projectiles.forEach((projectile, index) => {
		projectile.update();

		// remove from edges of screen
		if (
			projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width ||
			projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height
			) {
			setTimeout(() => {
				projectiles.splice(index, 1);
			}, 0);
		}
	});

	enemies.forEach((enemy, index) => {
		enemy.update();

		// ends game
		const playerDistEn = Math.hypot(player.x - enemy.x, player.y - enemy.y);
		if (playerDistEn - player.radius - enemy.radius < 1) {
			cancelAnimationFrame(animationId);
			modelEl.style.display = 'flex'
			bigScoreEl.innerHTML = score
		}

		projectiles.forEach((projectile, proIndex) => {
			const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

			// when projectiles touch enemy
			if (dist - projectile.radius - enemy.radius < 1) {
				// create explosion
				for (let i = 0; i < 8; ++i) {
					particles.push(
						new Particle(
						projectile.x, 
						projectile.y, 
						Math.random() * 2, 
						enemy.color, 
						{
							x: (Math.random() - 0.5) * (Math.random() * 8), 
							y: (Math.random() - 0.5) * (Math.random() * 8),
						}
					)
				)
			}

				if (enemy.radius - 10 > 10) {

					// increase our score
					score += 100;
					scoreEl.innerHTML = score

					gsap.to(enemy, {
						radius: enemy.radius - 10
					});
					setTimeout(() => {
  					projectiles.splice(proIndex, 1);
				}, 0);
				} else {
					// remove from scene altoogether
					score += 200;
					scoreEl.innerHTML = score
					setTimeout(() => {
					enemies.splice(index, 1);
  					projectiles.splice(proIndex, 1);
				}, 0);
			  	}
			}
		});
	});
}

addEventListener('click', (event) => {
	const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
	const velocity = {
		x: Math.cos(angle) * 5,
		y: Math.sin(angle) * 5,
	}
	projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity));
});

StartGameBtn.addEventListener('click', () => {
	init();
	animate();
	spawnEnemies();
	modelEl.style.display = 'none'
})


// 01:38:36