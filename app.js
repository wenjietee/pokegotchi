///////////////////
// Helper Functions 
///////////////////

const ajaxGetSpriteFromPokeAPI = (name, selector) => {
	let url = `https://pokeapi.co/api/v2/pokemon/${name}`;
	$.ajax({
		url: url,
		dataType: 'json',
		// for default sprite front_default for shiny front_shiny
		success: (data) => {
			let pokeSprite =
				data.sprites.versions['generation-v']['black-white'].animated
					.front_default;
			if (pokeSprite) {
				selector.attr({ src: `${pokeSprite}`, id: data.id });
			} else {
				selector.attr({
					src: `https://i.imgur.com/4wGvsX7.gif`,
					id: 0,
				});
			}
		},
		error: () => {
			selector.attr({
				src: `https://i.imgur.com/4wGvsX7.gif`,
				id: 0,
			});
		},
	});
};

const createSprite = (input) => {
	// creates an img element with sprite class
	$sprite = $('<img>').addClass('sprite');
	// change input to lower case and calls ajax function to get sprite
	ajaxGetSpriteFromPokeAPI(input, $sprite);
	//append sprite to div
	$('#pet-image').append($sprite);
};

//////////////////
// Pet Class 
//////////////////
class Pet {
	constructor(species, name, age, hunger, boredom, sleepiness) {
		this.species = species || 'Pikachu';
		this.name = name || species;
		this.age = age || 1;
		this.hunger = hunger || 5;
		this.boredom = boredom || 5;
		this.sleepiness = sleepiness || 5;
		this.evolutionStage = 0;
		this.isAsleep= false;
	}
	// pet name methods
	setName(name) {
		this.name = name;
		return this.name;
	}
	getName() {
		return this.name;
	}

	// pet age methods
	increaseAge() {
		return this.age++;
	}
	getAge() {
		return this.age;
	}

	// pet hunger methods
	feed() {
		this.hunger--;
		if (this.hunger < 0) {
			this.hunger = 0;
		}
	}
	train() {
		this.hunger += 2;
		this.sleepiness += 2;
		this.age++;
	}
	increaseHunger() {
		return this.hunger++;
	}
	getHunger() {
		return this.hunger;
	}

	// pet sleepiness methods
	sleep() {
		this.sleepiness--;
		if (this.sleepiness < 0) {
			this.sleepiness = 0;
		}
	}
	increaseSleepiness() {
		return this.sleepiness++;
	}
	getSleepiness() {
		return this.sleepiness;
	}

	// pet boredom methods
	play() {
		this.boredom--;
		if (this.boredom < 0) {
			this.boredom = 0;
		}
	}
	increaseBoredom() {
		return this.boredom++;
	}
	getBoredom() {
		return this.boredom;
	}

	// pet morph methods
	getEvolutionStage() {
		return this.evolutionStage;
	}

	morph() {
		// pet changes shape and becomes older
		const $sprite = $('.sprite');
		// increment the id to get the next pokemon up the list
		let petId = Number($sprite.attr('id'));
		petId++;
		// empty image div and create a new sprite of the evolved pokemon
		$('#pet-image').empty();
		createSprite(petId, $sprite);
		this.evolutionStage++;
	}

	// pet health methods

	isAlive() {
		// pet is animated and moving
		$('.sprite')
			.animate({ marginLeft: '+50%' }, 10000)
			.animate({ marginLeft: '-40%' }, 10000)
			.animate({ marginLeft: '+50%' }, 10000);
	}

	isSleeping() {
		// pet is asleep and stops moving
		$('.sprite')
			.stop()
	}

	isDead() {
		// pet is dead change to pokeball gif
		$('.sprite').finish().css({ margin: 0 }).attr({
			src: 'https://i.gifer.com/4xjS.gif',
		});
		// show restart modal
		$('#modal-gameover').css('display', 'block');
	}
}

//////////////////
// Game Class
//////////////////

class Game {
	constructor(species, name) {
		// initialise the pet name,sprite,age and statuses
		this.pet = new Pet(species, name);
		this.sleepInterval = undefined;
		createSprite(species);

		$('#name').text(`Name: ${this.pet.getName()}`);
		$('#age').text(`Age: ${this.pet.getAge()}`);
		$('#hunger').text(`Hunger: ${this.pet.getHunger()}`);
		$('#sleepiness').text(`Sleepiness: ${this.pet.getSleepiness()}`);
		$('#boredom').text(`Boredom: ${this.pet.getBoredom()}`);
	}

	// display the pet metrics on the browser called at shorter intervals
	updateMetrics() {
		$('#hunger').text(`Hunger: ${this.pet.getHunger()}`);
		$('#sleepiness').text(`Sleepiness: ${this.pet.getSleepiness()}`);
		$('#boredom').text(`Boredom: ${this.pet.getBoredom()}`);
		$('#age').text(`Age: ${this.pet.getAge()}`);
	}

	// increase metrics and display on browser
	// seperated from update metrics as method is called at slower intervals
	increaseMetrics() {
		$('#hunger').text(`Hunger: ${this.pet.increaseHunger()}`);
		$('#sleepiness').text(`Sleepiness: ${this.pet.increaseSleepiness()}`);
		$('#boredom').text(`Boredom: ${this.pet.increaseBoredom()}`);
	}

	// update and increase age in the browser
	updateAge() {
		$('#age').text(`Age: ${this.pet.increaseAge()}`);
	}

	checkMorphAge() {
		if (this.pet.getAge() === 6 && this.pet.getEvolutionStage() === 0) {
			this.pet.morph();
		}
		if (this.pet.getAge() === 12 && this.pet.getEvolutionStage() === 1) {
			this.pet.morph();
		}
	}
	// check if any of the metrics hit 10 and the pet is dead
	checkHealth() {
		if (
			this.pet.getHunger() < 10 &&
			this.pet.getSleepiness() < 10 &&
			this.pet.getBoredom() < 10
		) {
			if ( this.pet.isAsleep ){
				this.pet.isSleeping();
			} else {
				this.pet.isAlive();
			}
			return true;
		} else {
			this.pet.isDead();
			return false;
		}
	}

	// create an array of intervals for the above methods
	startGameIntervals() {
		return [
			// Increase Age over time
			setInterval(this.updateAge.bind(this), 30000),
			// Increase Metrics over time
			setInterval(this.increaseMetrics.bind(this), 15000),
			// Update Metrics
			setInterval(this.updateMetrics.bind(this), 100),
			// Check morph age
			setInterval(this.checkMorphAge.bind(this), 100),
			// Check metrics
			setInterval(this.checkHealth.bind(this), 2000),
		];
	}

	// Light switch methods
	lightsOn() {
		// sets gradient to black
		$('#pet-image').toggleClass('off');
		// start interval to call pet sleep method
		this.sleepInterval = setInterval(this.pet.sleep.bind(this.pet), 3000);
		this.pet.isAsleep = !this.pet.isAsleep;
		// disable play feed train buttons
		$('#feed,#train,#play').attr('disabled', true);
		// change button event to lights Off
		$('#lights').one('click', this.lightsOff.bind(this));
	}
	lightsOff() {
		// sets gradient back to normal
		$('#pet-image').toggleClass('off');
		// clear sleep interval
		clearInterval(this.sleepInterval);
		// enable play feed train buttons
		$('#feed,#train,#play').attr('disabled', false);
		// change button event to lights On
		$('#lights').one('click', this.lightsOn.bind(this));
	}

	// game begins here
	startGame() {
		// start game intervals
		const gameIntervals = this.startGameIntervals();

		// constantly check status of pet, if pet is dead clear all intervals
		setInterval(() => {
			if (!this.checkHealth()) {
				gameIntervals.forEach((interval) => clearInterval(interval));
			}
		}, 2000);

		// create button event handlers object
		$('#feed').on('click', this.pet.feed.bind(this.pet));
		$('#play').on('click', this.pet.play.bind(this.pet));
		$('#train').on('click', this.pet.train.bind(this.pet));
		$('#lights').one('click', this.lightsOn.bind(this));
	}
}

//////////////////
// Init Game
//////////////////

$(() => {
	// Get pokemon species input from player
	let speciesInput = prompt(
		'Enter a Pokemon Species or Number up to Pokemon Black/White \nEg. Bulbasaur to Genesect or 1 to 649'
	);
	// input must be converted to lowercase if not will throw an error during ajax calls
	if (speciesInput !== null) {
		speciesInput = speciesInput.toLowerCase();
	}
	// Get pokemon name input from player
	let nameInput = prompt('Enter a pet Name.');

	// Initialise tamagotchi Game
	// If invalid species input default to missingno
	const tamagotchi = new Game(speciesInput || 'missingno', nameInput);

	// Launch Modal Function for tutorial
	const openModal = () => {
		$('#modal-start').css('display', 'block');
	};

	// Close Modal
	const closeModal = () => {
		$('#modal-start').css('display', 'none');
		// Upon closing modal start the game
		tamagotchi.startGame();
	};

	// Game Over Modal
	// this will prompt if the player wants to play again
	$('#restart').on('click', () => {
		location.reload();
	});

	// Start The Game
	openModal();
	$('#start').on('click', closeModal);
});
