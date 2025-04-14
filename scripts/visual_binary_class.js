
document.addEventListener('DOMContentLoaded', () => {
  // DOM элементы
  const dataInput = document.getElementById('data-input');
  const addRowBtn = document.getElementById('add-row');
  const randomDataBtn = document.getElementById('random-data');
  const runBtn = document.getElementById('run');
  const errorDiv = document.getElementById('error');
  const linearFormula = document.getElementById('linear-formula');
  const sigmoidFormula = document.getElementById('sigmoid-formula');

  const linearCanvas = document.getElementById('linear-canvas');
  const sigmoidCanvas = document.getElementById('sigmoid-canvas');
  const gradientCanvas = document.getElementById('gradient-canvas');
  const linearCtx = linearCanvas.getContext('2d');
  const sigmoidCtx = sigmoidCanvas.getContext('2d');
  const gradientCtx = gradientCanvas.getContext('2d');

  const width = 300;
  const height = 200;

  let data = [];
  let w0 = 0, w1 = 0;
  let gradientSteps = [];
  const eta = 0.1;
  const maxPoints = 10;

  let linearAxes, sigmoidAxes, gradientAxes;

  function sigmoid(z) {
    if (z > 20) return 1;
    if (z < -20) return 0;
    return 1 / (1 + Math.exp(-z));
  }

  function updateFormulas() {
    linearFormula.innerHTML = `z = ${w0.toFixed(2)} + ${w1.toFixed(2)}x`;
  }

  function typesetFormulas() {
    MathJax.typeset();
  }

  function validateData(x, y) {
    const xNum = parseFloat(x);
    const yNum = parseInt(y);
    return !isNaN(xNum) && !isNaN(yNum) && xNum >= -10 && xNum <= 10 && (yNum === 0 || yNum === 1);
  }

  addRowBtn.addEventListener('click', () => {
    if (dataInput.children.length < maxPoints) {
      const row = document.createElement('div');
      row.className = 'visual__data-row';
      row.innerHTML = `
        <span>${dataInput.children.length + 1} - </span>
        <input type="number" placeholder="x" step="any" class="visual__input">
        <input type="number" placeholder="y" min="0" max="1" step="1" class="visual__input">
      `;
      dataInput.appendChild(row);
    }
  });

  randomDataBtn.addEventListener('click', () => {
    dataInput.innerHTML = '';
    const numPoints = Math.floor(Math.random() * 6) + 5;
    for (let i = 0; i < numPoints; i++) {
      const row = document.createElement('div');
      row.className = 'visual__data-row';
      const x = (Math.random() * 20 - 10).toFixed(2);
      const y = Math.round(Math.random());
      row.innerHTML = `
        <span>${dataInput.children.length + 1} - </span>
        <input type="number" value="${x}" step="any" class="visual__input">
        <input type="number" value="${y}" min="0" max="1" step="1" class="visual__input">
      `;
      dataInput.appendChild(row);
    }
  });

  function toCanvasCoords(x, y, type) {
    let canvasX, canvasY;
    if (type === 'linear') {
      canvasX = ((x + 10) / 20) * width;
      canvasY = height - ((y + 20) / 40) * height;
    } else if (type === 'sigmoid') {
      canvasX = ((x + 10) / 20) * width;
      canvasY = height - y * height;
    } else {
      canvasX = ((x + 2) / 4) * width;
      canvasY = height - ((y + 2) / 4) * height;
    }
    return { canvasX, canvasY };
  }

  function createAxesCache(type) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
  
    ctx.strokeStyle = '#a5a5a5';
    ctx.lineWidth = 1;
    ctx.beginPath();
  
    // Оси
    if (type === 'linear' || type === 'gradient') {
      // X
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      // Y
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
    } else if (type === 'sigmoid') {
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
    }
    ctx.stroke();
  
    // ✏️ Подписи и деления
    ctx.fillStyle = '#444';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
  
    if (type === 'linear' || type === 'sigmoid') {
      // X подписи
      for (let x = -10; x <= 10; x += 5) {
        const cx = ((x + 10) / 20) * width;
        ctx.beginPath();
        ctx.moveTo(cx, height / 2 - 4);
        ctx.lineTo(cx, height / 2 + 4);
        ctx.stroke();
        ctx.fillText(x.toString(), cx, height / 2 + 6);
      }
  
      // Y подписи
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const yRange = type === 'linear' ? 40 : 1;
      const yMin = type === 'linear' ? -20 : 0;
      const yMax = type === 'linear' ? 20 : 1;
      const step = type === 'linear' ? 10 : 0.25;
      for (let y = yMin; y <= yMax; y += step) {
        const cy = height - ((y - yMin) / yRange) * height;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 4, cy);
        ctx.lineTo(width / 2 + 4, cy);
        ctx.stroke();
        ctx.fillText(y.toFixed(1), width / 2 - 6, cy);
      }
  
      // Обозначения осей
      ctx.textAlign = 'left';
      ctx.fillText('x', width - 10, height / 2 + 10);
      ctx.textAlign = 'right';
      ctx.fillText('y', width / 2 - 10, 10);
    }
  
    if (type === 'gradient') {
      // X и Y от -2 до 2
      for (let x = -2; x <= 2; x++) {
        const cx = ((x + 2) / 4) * width;
        ctx.beginPath();
        ctx.moveTo(cx, height / 2 - 4);
        ctx.lineTo(cx, height / 2 + 4);
        ctx.stroke();
        ctx.fillText(x.toString(), cx, height / 2 + 6);
      }
  
      ctx.textAlign = 'right';
      for (let y = -2; y <= 2; y++) {
        const cy = height - ((y + 2) / 4) * height;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 4, cy);
        ctx.lineTo(width / 2 + 4, cy);
        ctx.stroke();
        ctx.fillText(y.toString(), width / 2 - 6, cy);
      }
  
      // Подписи осей
      ctx.textAlign = 'left';
      ctx.fillText('w₀', width - 10, height / 2 + 10);
      ctx.textAlign = 'right';
      ctx.fillText('w₁', width / 2 - 10, 10);
    }
  
    return canvas;
  }
  

  function drawLinear() {
    linearCtx.clearRect(0, 0, width, height);
    linearCtx.drawImage(linearAxes, 0, 0);

    linearCtx.strokeStyle = '#00b8d9';
    linearCtx.lineWidth = 2;
    linearCtx.beginPath();
    const p1 = toCanvasCoords(-10, w0 + w1 * -10, 'linear');
    const p2 = toCanvasCoords(10, w0 + w1 * 10, 'linear');
    linearCtx.moveTo(p1.canvasX, p1.canvasY);
    linearCtx.lineTo(p2.canvasX, p2.canvasY);
    linearCtx.stroke();

    data.forEach(point => {
      const z = w0 + w1 * point.x;
      const { canvasX, canvasY } = toCanvasCoords(point.x, z, 'linear');
      linearCtx.fillStyle = point.y === 1 ? '#aa2222' : '#00b8d9';
      linearCtx.beginPath();
      linearCtx.arc(canvasX, canvasY, 5, 0, Math.PI * 2);
      linearCtx.fill();
    });
  }

  function drawSigmoid() {
    sigmoidCtx.clearRect(0, 0, width, height);
    sigmoidCtx.drawImage(sigmoidAxes, 0, 0);

    sigmoidCtx.strokeStyle = '#00b8d9';
    sigmoidCtx.lineWidth = 2;
    sigmoidCtx.beginPath();
    for (let x = -10; x <= 10; x += 0.1) {
      const z = w0 + w1 * x;
      const y = sigmoid(z);
      const { canvasX, canvasY } = toCanvasCoords(x, y, 'sigmoid');
      if (x === -10) {
        sigmoidCtx.moveTo(canvasX, canvasY);
      } else {
        sigmoidCtx.lineTo(canvasX, canvasY);
      }
    }
    sigmoidCtx.stroke();

    data.forEach(point => {
      const z = w0 + w1 * point.x;
      const y = sigmoid(z);
      const { canvasX, canvasY } = toCanvasCoords(point.x, y, 'sigmoid');
      sigmoidCtx.fillStyle = point.y === 1 ? '#aa2222' : '#00b8d9';
      sigmoidCtx.beginPath();
      sigmoidCtx.arc(canvasX, canvasY, 5, 0, Math.PI * 2);
      sigmoidCtx.fill();
    });
  }

  function drawGradient(t) {
    gradientCtx.clearRect(0, 0, width, height);
    gradientCtx.drawImage(gradientAxes, 0, 0);

    gradientCtx.strokeStyle = '#00b8d9';
    gradientCtx.lineWidth = 2;
    gradientCtx.beginPath();
    gradientSteps.forEach((step, i) => {
      const { canvasX, canvasY } = toCanvasCoords(step.w0, step.w1, 'gradient');
      if (i === 0) gradientCtx.moveTo(canvasX, canvasY);
      else gradientCtx.lineTo(canvasX, canvasY);
    });
    gradientCtx.stroke();

    const step = Math.floor(t);
    const frac = t - step;
    if (step < gradientSteps.length - 1) {
      const curr = gradientSteps[step];
      const next = gradientSteps[step + 1];
      const interpW0 = curr.w0 + (next.w0 - curr.w0) * frac;
      const interpW1 = curr.w1 + (next.w1 - curr.w1) * frac;
      const { canvasX, canvasY } = toCanvasCoords(interpW0, interpW1, 'gradient');
      gradientCtx.fillStyle = '#aa2222';
      gradientCtx.beginPath();
      gradientCtx.arc(canvasX, canvasY, 5, 0, Math.PI * 2);
      gradientCtx.fill();
    }
  }

  function computeGradientSteps() {
    gradientSteps = [{ w0, w1 }];
    let currW0 = w0, currW1 = w1;
    for (let i = 0; i < 50; i++) {
      let gradW0 = 0, gradW1 = 0;
      data.forEach(point => {
        const z = currW0 + currW1 * point.x;
        const yHat = sigmoid(z);
        const error = yHat - point.y;
        gradW0 += error;
        gradW1 += error * point.x;
      });
      currW0 -= eta * gradW0 / data.length;
      currW1 -= eta * gradW1 / data.length;
      currW0 = Math.max(-2, Math.min(2, currW0));
      currW1 = Math.max(-2, Math.min(2, currW1));
      gradientSteps.push({ w0: currW0, w1: currW1 });
    }
  }

  let startTime = null;
  let isRunning = false;
  const animationDuration = 7;

  function animate(timestamp) {
    if (!isRunning) return;
    if (!startTime) startTime = timestamp;
    const elapsed = (timestamp - startTime) / 1000;
    const progress = Math.min(elapsed / animationDuration, 1);
    const currentStep = progress * (gradientSteps.length - 1);

    const step = Math.floor(currentStep);
    const frac = currentStep - step;
    const curr = gradientSteps[step];
    const next = gradientSteps[step + 1] || curr;
    w0 = curr.w0 + (next.w0 - curr.w0) * frac;
    w1 = curr.w1 + (next.w1 - curr.w1) * frac;

    drawLinear();
    drawSigmoid();
    drawGradient(currentStep);
    updateFormulas();

    if (progress >= 1) {
      isRunning = false;
      typesetFormulas();
    } else {
      requestAnimationFrame(animate);
    }
  }

  runBtn.addEventListener('click', () => {
    data = [];
    const rows = dataInput.querySelectorAll('.visual__data-row');
    let valid = true;
    rows.forEach(row => {
      const inputs = row.querySelectorAll('.visual__input');
      const x = inputs[0].value;
      const y = inputs[1].value;
      if (validateData(x, y)) {
        data.push({ x: parseFloat(x), y: parseInt(y) });
      } else {
        valid = false;
      }
    });

    if (!valid || data.length === 0) {
      errorDiv.style.display = 'block';
      return;
    }
    errorDiv.style.display = 'none';

    w0 = Math.random() * 4 - 2;
    w1 = Math.random() * 4 - 2;

    computeGradientSteps();

    isRunning = true;
    startTime = null;
    updateFormulas();
    typesetFormulas();
    requestAnimationFrame(animate);
  });

  linearAxes = createAxesCache('linear');
  sigmoidAxes = createAxesCache('sigmoid');
  gradientAxes = createAxesCache('gradient');

  randomDataBtn.click();
  updateFormulas();
  typesetFormulas();
});

