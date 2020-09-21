// Pages
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
// Splash Page
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');

// Equations
let questionAmount = 0;

let equationsArray = []; // contains right and wrong equations
let playerGuessArray = []; // store all the player's guesses

let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer; // represents interval to stop and start
let timePlayed = 0; // incremented every 1/10 of a second 
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = '0.0';


// Scroll
let valueY = 0;

// Refresh Splash Page Best Scores
function bestScoresToDOM() {

  bestScores.forEach((bestScore, index) => {

    const bestScoreEl = bestScore;
    bestScoreEl.textContent = `${bestScoreArray[index].bestScore}s`;
  });
}

// Check Local Storage for Best Scores, set bestScoreArray
function getSavedBestScores() {
  if (localStorage.getItem('bestScores')) {
    bestScoreArray = JSON.parse(localStorage.bestScores);
  } else {
    // if not found in local storage, create bestScoreArray
    bestScoreArray = [
      { questions: 10, bestScore: finalTimeDisplay },
      { questions: 25, bestScore: finalTimeDisplay },
      { questions: 50, bestScore: finalTimeDisplay },
      { questions: 99, bestScore: finalTimeDisplay },

    ];

    localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
  }

  bestScoresToDOM();
}


// Update Best Score Array
function updateBestScore() {
  bestScoreArray.forEach((score, index) => {
    // Select correct Best Score to update
    if (questionAmount == score.questions) {
      // Return Best Score as number with one decimal
      const savedBestScore = Number(bestScoreArray[index].bestScore);
      // Update if the new final score is less or replacing zero
      if (savedBestScore === 0 || savedBestScore > finalTime) {
        bestScoreArray[index].bestScore = finalTimeDisplay;
      }
    }
  });
  // Update Splash Page
  bestScoresToDOM();
  // Save to Local Storage
  localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
}

// Play Again / Reset Game
function playAgain() {
  gamePage.addEventListener('click', startTimer); // was removed in previous game in startTimer()
  scorePage.hidden = true;
  splashPage.hidden = false;
  // reset global arrays, values
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
  playAgainBtn.hidden = true;
}

function showScorePage() {
  // Show Play Again button after 1 second
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 1000);
  gamePage.hidden = true;
  scorePage.hidden = false;

}

// Format & Display Time in DOM
function scoresToDOM() {
  finalTimeDisplay = finalTime.toFixed(1); // leave only 1 number after decimal
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);

  // update DOM
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;

  // check/update best scores
  updateBestScore();

  // Scroll to Top, go to score page
  itemContainer.scrollTo({ top: 0, behavior: 'instant' });

  // show score page
  showScorePage();

}

// Stop Timer, Process Results, got to Score Page
function checkTime() {
  // console.log(timePlayed);
  if (playerGuessArray.length == questionAmount) {
    //   console.log('player guess array: ', playerGuessArray);
    clearInterval(timer);

    // check for wrong guesses, add penalty time
    equationsArray.forEach((equation, index) => {
      if (equation.evaluated === playerGuessArray[index]) {
        // Correct guess, no penalty

      } else {
        // Incorrect guess, add penalty
        penaltyTime += 5;
      }
    });

    finalTime = timePlayed + penaltyTime;
    // console.log('time', timePlayed, 'penalty: ', penaltyTime, 'final: ', finalTime);
    scoresToDOM();
  }
}

// Add 1/10 second to timePlayed
function addTime() {
  timePlayed += 0.1;
  checkTime();
}

// Start timer when game page is clicked
function startTimer() {
  // Reset times
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener('click', startTimer); // we only want to start the timer once
}

// Scroll AND Store user selection (Right or Wrong) in playerGuessArray
function select(guessedTrue) {
  // Scroll 80 pixels
  valueY += 80;
  itemContainer.scroll(0, valueY);
  // Add player guess to array
  return guessedTrue ? playerGuessArray.push('true') : playerGuessArray.push('false');

}


// Displays Game Page
function showGamePage() {
  gamePage.hidden = false;
  countdownPage.hidden = true;
}

// Get random # of right equations
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}


// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount);
  // console.log('correct equations', correctEquations);
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  // console.log('wrong equations', wrongEquations);
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9) + 1;
    secondNumber = getRandomInt(9) + 1;
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: 'true' };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9) + 1;
    secondNumber = getRandomInt(9) + 1;
    const equationValue = firstNumber * secondNumber;
    // randomly pick only one of these 3 equation 'mutations' to make them wrong, for each wrong equation
    wrongFormat[0] = `${firstNumber} x ${secondNumber} = ${equationValue + secondNumber}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - secondNumber}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber + 1} = ${equationValue}`;

    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: 'false' };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
}

// Add Equations to DOM 
function equationsToDOM() {
  equationsArray.forEach((equation) => {

    // Item
    const item = document.createElement('div');
    item.classList.add('item');
    // Equation Text
    const equationText = document.createElement('h1');
    equationText.textContent = equation.value;
    // Append
    item.appendChild(equationText);
    itemContainer.appendChild(item);

  });
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Empty Space Above
  itemContainer.textContent = '';
  // Spacer
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  // Selected Item
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();

  // Set Empty Space Below
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  itemContainer.appendChild(bottomSpacer);
}


// Displays 3, 2, 1, GO! countdown
function countdownStart() {
  countdown.textContent = '3';
  setTimeout(() => {
    countdown.textContent = '2';
  }, 1000);
  setTimeout(() => {
    countdown.textContent = '1';
  }, 2000);
  setTimeout(() => {
    countdown.textContent = 'GO!!';
  }, 3000);
}

// Navigate from Splash Page to Countdown Page
function showCountdown() {
  countdownPage.hidden = false;
  splashPage.hidden = true;
  countdownStart();
  populateGamePage();
  setTimeout(showGamePage, 40);
}

// Get the Number of Questions value from user selected radio button
function getRadioValue() {
  let radioValue;
  radioInputs.forEach((radioInput) => {

    if (radioInput.checked) {
      radioValue = radioInput.value;

    }
  });
  return radioValue;
}



// Form that decides amount of questions
function selectQuestionAmount(e) {
  e.preventDefault();
  questionAmount = getRadioValue();
  // console.log('question amount: ', questionAmount);
  if (questionAmount) {
    showCountdown();
  }



}

// Switch selected input styling
startForm.addEventListener('click', () => {
  radioContainers.forEach((radioEl) => {
    // Remove Selected Label Styling
    radioEl.classList.remove('selected-label');
    // Add it back if radio input is checked
    if (radioEl.children[1].checked) {
      radioEl.classList.add('selected-label');
    }
  });
});

// Event Listeners
gamePage.addEventListener('click', startTimer);
startForm.addEventListener('submit', selectQuestionAmount);

// On Load
getSavedBestScores();