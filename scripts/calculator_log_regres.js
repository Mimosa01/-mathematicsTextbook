document.addEventListener('DOMContentLoaded', () => {
  const calculateButton = document.getElementById('log_regres_btn');
  const outputContainer = document.getElementById('output_regres');

  // Функция для вычисления сигмоиды
  function sigmoid(z) {
    return 1 / (1 + Math.exp(-z));
  }

  // Функция для обновления формул в output-контейнере
  function updateOutputFormulas(expression, z, sigmaZ) {
    const formulas = outputContainer.querySelectorAll('.article__formula');

    // Обновляем первую формулу: w0 + w1x1 + w2x2 = z
    formulas[0].innerHTML = `\\( ${expression} = ${z.toFixed(4)} \\)`;

    // Обновляем вторую формулу: 1 / (1 + e^(-z)) = σ(z)
    formulas[1].innerHTML = `\\( \\frac{1}{1 + e^{-${z.toFixed(4)}}} = ${sigmaZ.toFixed(4)} \\)`;

    // Перерисовываем формулы с помощью MathJax
    MathJax.typeset();
  }

  // Обработчик нажатия на кнопку "Рассчитать"
  calculateButton.addEventListener('click', () => {
    // Получаем значение из инпута
    const input = document.getElementById('log_regres_input');
    const expression = input.value.trim();

    if (!expression) {
      alert('Введите выражение!');
      return;
    }

    // Извлекаем правую часть выражения после знака "="
    const match = expression.match(/z\s*=\s*(.+)/);
    if (!match) {
      alert('Выражение должно быть в формате "z=..."');
      return;
    }

    const formula = match[1]; // Правая часть выражения (например, "10*5+3*2")

    try {
      // Вычисляем значение z
      const z = eval(formula); // Используем eval для вычисления выражения

      // Вычисляем сигмоиду
      const sigmaZ = sigmoid(z);

      // Обновляем формулы в output-контейнере
      updateOutputFormulas(expression, z, sigmaZ);
    } catch (error) {
      alert('Ошибка при вычислении выражения. Проверьте формат ввода.');
    }
  });
});