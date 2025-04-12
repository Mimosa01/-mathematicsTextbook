const canvas = document.getElementById('tree-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

const mathSymbols = [
  '+', '-', '*', '/', '=', 'π', '√', '∑', '∫', '∞',
  '≠', '≈', '≤', '≥', '∓', '×', '÷', '∂', '∇', '∝',
  '∈', '∉', '⊂', '⊃', '∩', '∪', '∧', '∨', '→', '←',
  '↔', '⇒', '⇔', '∀', '∃', '∅', '⊥', '∠', '°'
];
const mathFormulas = [
  "E = mc²", "a² + b² = c²", "∫ f(x) dx", "lim (x → ∞)",
  "∑ n = n(n+1)/2", "F = ma", "y = mx + b", "sin²θ + cos²θ = 1",
  "e^(iπ) + 1 = 0", "logₐ(b) = c", 
  "f(x) = ax² + bx + c", "A = πr²", "V = 4/3 πr³",
  "d/dx [xⁿ] = nx^(n-1)", "Δ = b² - 4ac", "x = (-b ± √Δ) / 2a",
  "P(A ∪ B) = P(A) + P(B) - P(A ∩ B)", "P(A|B) = P(A ∩ B) / P(B)",
  "∮ E · dA = Q_enc / ε₀", "∇ × E = -∂B/∂t", "∇ · B = 0",
  "F = G(m₁m₂)/r²", "v = u + at", "s = ut + ½at²",
  "KE = ½mv²", "PE = mgh", "W = F·d·cosθ",
  "p = mv", "I = F·Δt", "τ = r × F",
  "λ = h/p", "E = hf", "c = λf",
  "z = x + yi", "|z| = √(x² + y²)", "arg(z) = arctan(y/x)",
  "det(A) = ad - bc", "A⁻¹ = (1/det(A)) adj(A)",
  "sin(2θ) = 2sinθcosθ", "cos(2θ) = cos²θ - sin²θ",
  "tanθ = sinθ / cosθ", "cotθ = 1 / tanθ",
  "secθ = 1 / cosθ", "cscθ = 1 / sinθ",
  "Γ(n) = (n-1)!", "ζ(s) = ∑ 1/nˢ", "φ(n) = n ∏ (1 - 1/p)",
  "H = -∑ pᵢ log₂(pᵢ)", "S = k ln(W)", "U = Q - W",
  "PV = nRT", "Q = mcΔT", "ΔG = ΔH - TΔS",
  "ρ = m/V", "F = ρgV", "P = F/A",
  "v = fλ", "Z = R + jX", "Y = G + jB",
  "L = μ₀N²A/l", "C = ε₀A/d", "R = ρl/A",
  "∇²ψ + k²ψ = 0", "ψ(x,t) = A sin(kx - ωt)",
  "x̄ = (Σxᵢ) / n", "σ² = Σ(xᵢ - x̄)² / n",
  "P(X = k) = C(n,k) pᵏ (1-p)ⁿ⁻ᵏ", "E[X] = np", "Var(X) = np(1-p)",
  "P(A|B) = P(B|A)P(A) / P(B)", "KL(P||Q) = ∑ P(x) log(P(x)/Q(x))",
  "H(X,Y) = H(X) + H(Y|X)", "I(X;Y) = H(X) - H(X|Y)"
];
const maxParticles = 10;
const maxTwinklingPoints = 15;
const maxFormulas = 3;
const pointCount = 50;
const gridSpacing = 100;

let width, height, startX, startY;
const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = document.querySelector('.hero').clientHeight + document.querySelector('.header').clientHeight + 30;
    startX = width >> 1;
    startY = height >> 1;
};
resize();

const fallingElements = [];
const twinklingPoints = [];
const formulasOnScreen = [];
const backgroundPoints = Array(pointCount);

let time = 0;
const speed = 0.01;

for (let i = 0; i < pointCount; i++) {
    backgroundPoints[i] = {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.2 - 0.1
    };
}

const drawGradient = () => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(1, 'rgb(6, 5, 34)');
    gradient.addColorStop(0, `hsl(${time * 10 & 255}, 30%, 5%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
};

const drawGrid = () => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const t = time * 2;
    
    for (let x = 0; x < width; x += gridSpacing) {
        const offset = Math.sin(t + x * 0.1) * 5;
        ctx.beginPath();
        ctx.moveTo(x + offset, 0);
        ctx.lineTo(x + offset, height);
        ctx.stroke();
    }
    
    for (let y = 0; y < height; y += gridSpacing) {
        const offset = Math.cos(t + y * 0.1) * 5;
        ctx.beginPath();
        ctx.moveTo(0, y + offset);
        ctx.lineTo(width, y + offset);
        ctx.stroke();
    }
};

const updatePoints = () => {
    backgroundPoints.forEach(p => {
        p.x = (p.x + p.speed + width) % width;
        p.y = (p.y + p.speed + height) % height;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, 6.28);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
    });
};

const drawBranch = (x, y, angle, length, depth) => {
    if (depth <= 0) return;

    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;
    const hue = (Math.sin(time * 0.1) * 180 + 180) % 360;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = `hsl(${hue}, 80%, ${45 - (10 - depth) * 3}%)`;
    ctx.lineWidth = depth;
    ctx.stroke();

    if (Math.random() < 0.01 && fallingElements.length < maxParticles) {
        fallingElements.push({
            x: endX,
            y: endY,
            size: Math.random() * 10 + 15,
            speed: Math.random() * 1 + 0.5,
            text: Math.random() < 0.4 ? 
                Math.random() * 10 | 0 : 
                mathSymbols[Math.random() * mathSymbols.length | 0],
            opacity: 1,
            fadeSpeed: 0.006
        });
    }

    const newLength = length * 0.7;
    const timeSin = Math.sin(time);
    drawBranch(endX, endY, angle - 0.785 + timeSin * 0.5, newLength, depth - 1);
    drawBranch(endX, endY, angle + 0.785 + Math.cos(time) * 0.5, newLength, depth - 1);
};

const updateElements = () => {
    for (let i = fallingElements.length - 1; i >= -1; i--) {
        if (i < 0) break;
        const el = fallingElements[i];
        el.y += el.speed;
        el.opacity -= el.fadeSpeed;

        if (el.opacity <= 0 || el.y > height) {
            fallingElements.splice(i, 1);
            continue;
        }

        ctx.font = `${el.size}px "Roboto Mono", monospace`;
        const hue = (Math.sin(time * 0.1) * 180 + 180) % 360;
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${el.opacity})`;
        ctx.fillText(el.text, el.x, el.y);
    }

    for (let i = twinklingPoints.length - 1; i >= -1; i--) {
        if (i < 0) break;
        const p = twinklingPoints[i];
        p.opacity += p.fadeSpeed * (p.isFadingOut ? -1 : 1);
        
        if (p.opacity <= 0 || p.opacity >= 1) p.isFadingOut = !p.isFadingOut;
        if (Math.random() < 0.01) twinklingPoints.splice(i, 1);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, 6.28);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
    }

    if (Math.random() < 0.02 && twinklingPoints.length < maxTwinklingPoints) {
        twinklingPoints.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 3 + 1,
            opacity: Math.random(),
            fadeSpeed: 0.015,
            isFadingOut: Math.random() < 0.5
        });
    }

    for (let i = formulasOnScreen.length - 1; i >= -1; i--) {
        if (i < 0) break;
        const f = formulasOnScreen[i];
        
        f.opacity += f.isAppearing ? 0.01 : -f.fadeSpeed;
        if (f.isAppearing && f.opacity >= f.targetOpacity) {
            f.opacity = f.targetOpacity;
            f.isAppearing = false;
        }
        
        if (f.opacity <= 0) {
            formulasOnScreen.splice(i, 1);
            continue;
        }

        ctx.font = `${f.size}px Arial`;
        ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
        ctx.fillText(f.text, f.x, f.y);
    }

    if (Math.random() < 0.05 && formulasOnScreen.length < maxFormulas) {
        formulasOnScreen.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 10 + 15,
            opacity: 0,
            targetOpacity: 0.5,
            fadeSpeed: 0.009,
            isAppearing: true,
            text: mathFormulas[Math.random() * mathFormulas.length | 0]
        });
    }
};

const animate = () => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    drawGradient();
    drawGrid();
    updatePoints();
    drawBranch(startX, startY, -1.571, 100, 12);
    updateElements();

    time += speed;
    requestAnimationFrame(animate);
};

animate();
window.addEventListener('resize', resize);