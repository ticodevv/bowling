const readline = require('readline');

class Player {
  constructor(name) {
    this.name = name;
    this.frames = []; // Tableau pour stocker les frames du joueur
  }

  addFrame(frame) {
    this.frames.push(frame); // Ajouter une frame à la liste des frames du joueur
  }

  calculateScore() {
    let score = 0;

    for (let i = 0; i < this.frames.length; i++) {
      const frame = this.frames[i];

      if (frame.isStrike()) {
        score += 10 + this.strikeBonus(i); // Si le frame est un strike, ajouter 10 points plus le bonus
      } else if (frame.isSpare()) {
        score += 10 + this.spareBonus(i);  // Si le frame est un spare, ajouter 10 points plus le bonus
      } else {
        score += frame.sum(); // Sinon, ajouter la somme des lancers du frame
      }
    }

    return score; // Retourner le score total du joueur
  }

  strikeBonus(frameIndex) {
    const nextFrame = this.frames[frameIndex + 1];

    if (nextFrame) {
      if (nextFrame.isStrike()) {
        const nextNextFrame = this.frames[frameIndex + 2];
        return 10 + nextFrame.getFirstFrame() + (nextNextFrame ? nextNextFrame.getFirstFrame() : 0);
                // Si le prochain frame est un strike, ajouter 10 points plus le premier lancer du frame suivant et éventuellement le premier lancer du frame d'après
      } else {
        return nextFrame.sum(); // Sinon, ajouter la somme des lancers du prochain frame
      }
    }

    return 0;  // Retourner 0 si aucun bonus n'est applicable
  }

  spareBonus(frameIndex) {
    const nextFrame = this.frames[frameIndex + 1];
    return nextFrame ? nextFrame.getFirstFrame() : 0; // Retourner le premier lancer du prochain frame ou 0 si le prochain frame n'existe pas
  }
}

class Frame {
  constructor() {
    this.rolls = []; // Tableau pour stocker les lancers du frame
  }

  addRoll(pins) {
    this.rolls.push(pins); // Ajouter un lancer au tableau des lancers du frame
  }

  sum() {
    return this.rolls.reduce((a, b) => a + b, 0); // Calculer la somme des lancers du frame
  }

  isStrike() {
    return this.rolls.length === 1 && this.rolls[0] === 10; // Vérifier si le frame est un strike (un seul lancer et il renverse 10 quilles)
  }

  isSpare() {
    return this.rolls.length === 2 && this.sum() === 10;  // Vérifier si le frame est un spare (deux lancers dont la somme est égale à 10)
  }

  getFirstFrame() {
    return this.rolls[0];  // Retourner le premier lancer du frame
  }
}

function startBowlingGame() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Entrez le nombre de joueurs (entre 1 et 6) : ', numPlayers => {
    numPlayers = parseInt(numPlayers);
    if (isNaN(numPlayers) || numPlayers < 1 || numPlayers > 6) {
      console.log('Le nombre de joueurs doit être compris entre 1 et 6.');
      rl.close();
      return;
    }

    const players = []; // Tableau pour stocker les joueurs

    const getNamePlayer = playerIndex => {
      if (playerIndex === numPlayers) {
        rl.close();
        playGame(players);  // Commencer le jeu une fois que tous les noms des joueurs ont été saisis
      } else {
        rl.question(`Entrez le nom du joueur ${playerIndex + 1} : `, name => {
          players.push(new Player(name)); // Créer un nouvel objet Player avec le nom saisi et l'ajouter au tableau des joueurs
          getNamePlayer(playerIndex + 1); // Passer au joueur suivant
        });
      }
    };

    getNamePlayer(0); // Commencer la saisie des noms des joueurs à partir du premier joueur
  });
}

function playGame(players) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let frameNum = 1;  // Numéro du frame en cours

  const playFrame = playerIndex => {
    if (playerIndex === players.length) { // Si tous les joueurs ont joué le frame actuel
      frameNum++;
      if (frameNum <= 10) { // S'il reste des frames à jouer
        playFrame(0); // Commencer le frame suivant avec le premier joueur
      } else {
        rl.close();
        addScore(players); // Afficher les scores finaux une fois que tous les frames ont été joués
      }
    } else {
      const player = players[playerIndex];
      console.log(`Frame ${frameNum}`);
      console.log(`Tour du joueur ${player.name}`);

      const frame = new Frame(); // Créer un nouvel objet Frame pour le joueur en cours

      rl.question('Nombre de quilles renversées au premier lancer : ', roll1 => {
        frame.addRoll(parseInt(roll1));  // Ajouter le nombre de quilles renversées au premier lancer au frame

        if (!frame.isStrike()) {
          rl.question('Nombre de quilles renversées au deuxième lancer : ', roll2 => {
            frame.addRoll(parseInt(roll2)); // Ajouter le nombre de quilles renversées au deuxième lancer au frame
            player.addFrame(frame); // Ajouter le frame au joueur
            playFrame(playerIndex + 1); // Passer au joueur suivant
          });
        } else {
          player.addFrame(frame); // Ajouter le frame au joueur
          playFrame(playerIndex + 1); // Passer au joueur suivant
        }
      });
    }
  };

  playFrame(0);  // Commencer le jeu avec le premier joueur
}

function addScore(players) { // focntion qui va afficher le Scores
  console.log('Score final :');

  let maxScore = -1;
  let winners = [];

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const score = player.calculateScore();
    console.log(`${player.name}: ${score}`);

    if (score > maxScore) {
      maxScore = score;
      winners = [player.name];
    } else if (score === maxScore) {
      winners.push(player.name);
    }
  }

  if (winners.length === 1) {
    console.log(`${winners[0]} est le gagnant !`);
  } else {
    console.log(`Egalité ! Les gagnants sont : ${winners.join(', ')}`);
  }
}

startBowlingGame();  // Démarrer le jeu en demandant le nombre de joueurs