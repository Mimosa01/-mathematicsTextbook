import { quotes } from "./quotes.js";

const quoteElement = document.getElementById('quote');
const authorElement = document.getElementById('author');

let index = 0;

function getRandomBinary() {
  return Math.random() > 0.5 ? '1' : '0';
}

async function animateTextChange(targetText, element) {
  const originalText = element.textContent;
  const binarySteps = 50;       // Увеличено количество шагов для плавности
  const frameDelay = 80;        // Увеличена задержка для замедления анимации

  // Превращение в бинарный код
  let charStates = new Array(originalText.length).fill(0);
  let binaryText = originalText;
  for (let i = 0; i <= binarySteps; i++) {
    const progress = i / binarySteps;
    let newBinaryText = '';
    for (let j = 0; j < originalText.length; j++) {
      if (charStates[j] === 0 && Math.random() < progress * 0.1) {
        charStates[j] = 1;
      }
      newBinaryText += charStates[j] === 1 ? getRandomBinary() : originalText[j];
    }
    if (binaryText !== newBinaryText) {  // Обновляем DOM только при изменении
      binaryText = newBinaryText;
      element.textContent = binaryText;
    }
    await new Promise(resolve => setTimeout(resolve, frameDelay));
  }

  // Окончательное раскрытие текста
  charStates = new Array(targetText.length).fill(1);
  for (let i = 0; i <= binarySteps; i++) {
    const progress = i / binarySteps;
    let newText = '';
    for (let j = 0; j < targetText.length; j++) {
      if (charStates[j] === 1 && Math.random() < progress * 0.1) {
        charStates[j] = 0;
      }
      newText += charStates[j] === 1 ? getRandomBinary() : targetText[j];
    }
    if (binaryText !== newText) {  // Обновляем DOM только при изменении
      binaryText = newText;
      element.textContent = binaryText;
    }
    await new Promise(resolve => setTimeout(resolve, frameDelay));
  }

  element.textContent = targetText;  // Завершаем анимацию
}

async function cycleQuotes() {
  while (true) {
    const { quote, author } = quotes[index];
    
    // Сначала показываем цитату с эффектами
    await Promise.all([
      animateTextChange(quote, quoteElement),
      animateTextChange(author, authorElement)
    ]);

    // Даем пользователю время насладиться цитатой (60 секунд)
    const pauseTime = 60000; // Пауза 60 секунд
    await new Promise(resolve => setTimeout(resolve, pauseTime));

    // Переходим к следующей цитате
    index = (index + 1) % quotes.length;
  }
}

// Запускаем цикл
cycleQuotes();
