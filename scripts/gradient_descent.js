document.addEventListener('DOMContentLoaded', () => {
  const calculateButton = document.getElementById('gradient_btn');
  const outputContainer = document.getElementById('output_gradient');

  // Функция для вычисления сигмоиды
  function sigmoid(z) {
    return 1 / (1 + Math.exp(-z));
  }

  // Функция для обновления параграфов с новыми значениями весов и результатами
  function updateOutputResults(weights, z, yHat) {
    // Очищаем контейнер
    outputContainer.innerHTML = '';

    // Добавляем результат линейной функции
    const zParagraph = document.createElement('p');
    zParagraph.className = 'article__formula';
    zParagraph.innerHTML = `\\(z = ${z.toFixed(4)}\\)`; // LaTeX-формат
    outputContainer.appendChild(zParagraph);

    // Добавляем результат сигмоиды
    const yHatParagraph = document.createElement('p');
    yHatParagraph.className = 'article__formula';
    yHatParagraph.innerHTML = `\\(\\hat{y} = \\sigma(z) = ${yHat.toFixed(4)}\\)`; // LaTeX-формат
    outputContainer.appendChild(yHatParagraph);

    // Создаём новый параграф для каждого веса в формате LaTeX
    weights.forEach((weight, index) => {
      const paragraph = document.createElement('p');
      paragraph.className = 'article__formula';
      paragraph.innerHTML = `\\(w_${index} = ${weight.toFixed(4)}\\)`; // LaTeX-формат
      outputContainer.appendChild(paragraph);
    });

    // Перерисовываем формулы с помощью MathJax
    MathJax.typeset();
  }

  // Обработчик нажатия на кнопку "Рассчитать"
  calculateButton.addEventListener('click', () => {
    // Получаем значения из инпутов
    const dotInput = document.getElementById('dot').value.trim();
    const weightsInput = document.getElementById('weights').value.trim();
    const stepInput = parseFloat(document.getElementById('step').value.trim());

    if (!dotInput || !weightsInput || isNaN(stepInput)) {
      alert('Заполните все поля!');
      return;
    }

    // Парсим координаты точки
    const dotValues = dotInput.split(',').map(val => parseFloat(val.trim()));
    if (dotValues.some(isNaN)) {
      alert('Координаты точки должны быть числами, разделёнными запятыми!');
      return;
    }

    // Проверяем, что последняя цифра в координатах точки равна 0 или 1
    const y = dotValues[dotValues.length - 1];
    if (y !== 1 && y !== 0) {
      alert('Последняя цифра в координатах точки должна быть равна 0 или 1!');
      return;
    }

    // Парсим веса
    const weights = weightsInput.split(',').map(val => parseFloat(val.trim()));
    if (weights.some(isNaN)) {
      alert('Веса должны быть числами, разделёнными запятыми!');
      return;
    }

    // Проверяем, что количество весов на один больше, чем количество координат точки (без учета y)
    if (weights.length !== dotValues.length) {
      alert('Количество весов должно быть на один больше, чем количество координат точки (без учета y)!');
      return;
    }

    // Извлекаем координаты (без последнего значения y)
    const x = dotValues.slice(0, -1);

    // Вычисляем z
    const z = weights.reduce((sum, weight, i) => sum + weight * (i === 0 ? 1 : x[i - 1]), 0);

    // Вычисляем предсказание сигмоиды
    const yHat = sigmoid(z);

    // Вычисляем новые веса
    const newWeights = weights.map((weight, i) => {
      // Для w_0 используем x = 1
      const xi = i === 0 ? 1 : x[i - 1]; // Для w_0 x = 1, для остальных x берём из координат
      return weight - stepInput * (yHat - y) * xi;
    });

    // Обновляем параграфы с новыми значениями весов и результатами
    updateOutputResults(newWeights, z, yHat);

    // Обновляем инпут с весами
    document.getElementById('weights').value = newWeights.join(', ');
  });
});