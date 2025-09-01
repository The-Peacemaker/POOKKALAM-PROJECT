document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const canvas = document.getElementById('pookkalam-canvas');
    const ctx = canvas.getContext('2d');
    const paletteContainer = document.getElementById('palette');
    const symmetrySlider = document.getElementById('symmetry-slider');
    const symmetryValue = document.getElementById('symmetry-value');
    const sizeSlider = document.getElementById('size-slider');
    const sizeValue = document.getElementById('size-value');
    const undoBtn = document.getElementById('undo-btn');

    // State
    let symmetry = 8;
    let brushSize = 20;
    let history = [];
    let currentFlower = null;
    let isDrawing = false;
    
    // --- Flower definitions ---
    const flowers = [
        {
            id: 'petal-red',
            svg: `<svg viewBox="0 0 100 100"><path d="M50 0 Q65 40 50 100 Q35 40 50 0 Z" fill="#ef4444"/></svg>`,
            draw: (c, size) => { c.fillStyle = '#ef4444'; c.beginPath(); c.moveTo(0, -size / 2); c.quadraticCurveTo(size / 4, 0, 0, size / 2); c.quadraticCurveTo(-size / 4, 0, 0, -size / 2); c.fill(); }
        },
        {
            id: 'petal-yellow',
            svg: `<svg viewBox="0 0 100 100"><path d="M50 0 Q65 40 50 100 Q35 40 50 0 Z" fill="#f59e0b"/></svg>`,
            draw: (c, size) => { c.fillStyle = '#f59e0b'; c.beginPath(); c.moveTo(0, -size / 2); c.quadraticCurveTo(size / 4, 0, 0, size / 2); c.quadraticCurveTo(-size / 4, 0, 0, -size / 2); c.fill(); }
        },
        {
            id: 'circle-pink',
            svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#ec4899"/></svg>`,
            draw: (c, size) => { c.fillStyle = '#ec4899'; c.beginPath(); c.arc(0, 0, size / 2, 0, Math.PI * 2); c.fill(); }
        },
        {
            id: 'circle-orange',
            svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#f97316"/></svg>`,
            draw: (c, size) => { c.fillStyle = '#f97316'; c.beginPath(); c.arc(0, 0, size / 2, 0, Math.PI * 2); c.fill(); }
        },
        {
            id: 'leaf-green',
            svg: `<svg viewBox="0 0 100 100"><path d="M20 50 Q50 20 80 50 Q50 80 20 50 Z" fill="#22c55e"/></svg>`,
             draw: (c, size) => { c.fillStyle = '#22c55e'; c.beginPath(); c.moveTo(-size/2, 0); c.quadraticCurveTo(0, -size/2, size/2, 0); c.quadraticCurveTo(0, size/2, -size/2, 0); c.fill(); }
        },
        {
            id: 'leaf-lime',
            svg: `<svg viewBox="0 0 100 100"><path d="M20 50 Q50 20 80 50 Q50 80 20 50 Z" fill="#84cc16"/></svg>`,
             draw: (c, size) => { c.fillStyle = '#84cc16'; c.beginPath(); c.moveTo(-size/2, 0); c.quadraticCurveTo(0, -size/2, size/2, 0); c.quadraticCurveTo(0, size/2, -size/2, 0); c.fill(); }
        },
        {
            id: 'teardrop-blue',
            svg: `<svg viewBox="0 0 100 100"><path d="M50 10 C 20 40, 20 70, 50 90 C 80 70, 80 40, 50 10 Z" fill="#3b82f6"/></svg>`,
             draw: (c, size) => { c.fillStyle = '#3b82f6'; c.beginPath(); c.moveTo(0, -size/2); c.bezierCurveTo(-size/2, -size/4, -size/3, size/2, 0, size/2); c.bezierCurveTo(size/3, size/2, size/2, -size/4, 0, -size/2); c.fill(); }
        },
        {
            id: 'teardrop-purple',
            svg: `<svg viewBox="0 0 100 100"><path d="M50 10 C 20 40, 20 70, 50 90 C 80 70, 80 40, 50 10 Z" fill="#8b5cf6"/></svg>`,
             draw: (c, size) => { c.fillStyle = '#8b5cf6'; c.beginPath(); c.moveTo(0, -size/2); c.bezierCurveTo(-size/2, -size/4, -size/3, size/2, 0, size/2); c.bezierCurveTo(size/3, size/2, size/2, -size/4, 0, -size/2); c.fill(); }
        },
        {
            id: 'star-gold',
            svg: `<svg viewBox="0 0 100 100"><path d="M50 0 L61 35 L98 35 L68 57 L79 91 L50 68 L21 91 L32 57 L2 35 L39 35 Z" fill="#facc15"/></svg>`,
            draw: (c, size) => { c.fillStyle = '#facc15'; c.beginPath(); const r = size/2; for(let i=0; i<5; i++){ c.lineTo(Math.cos((18+i*72)/180*Math.PI)*r, -Math.sin((18+i*72)/180*Math.PI)*r); c.lineTo(Math.cos((54+i*72)/180*Math.PI)*r*0.5, -Math.sin((54+i*72)/180*Math.PI)*r*0.5); } c.closePath(); c.fill(); }
        },
        {
            id: 'ring-rose',
            svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" stroke="#f43f5e" stroke-width="15" fill="none"/></svg>`,
            draw: (c, size) => { c.strokeStyle = '#f43f5e'; c.lineWidth = size/4; c.beginPath(); c.arc(0, 0, size/2 - c.lineWidth/2, 0, 2*Math.PI); c.stroke(); }
        },
        {
            id: 'diamond-cyan',
            svg: `<svg viewBox="0 0 100 100"><path d="M50 0 L100 50 L50 100 L0 50 Z" fill="#06b6d4"/></svg>`,
            draw: (c, size) => { c.fillStyle = '#06b6d4'; c.beginPath(); c.moveTo(0, -size/2); c.lineTo(size/2, 0); c.lineTo(0, size/2); c.lineTo(-size/2, 0); c.closePath(); c.fill(); }
        },
         {
            id: 'heart-love',
            svg: `<svg viewBox="0 0 100 100"><path d="M50 85 C-20 45, 25 0, 50 30 C 75 0, 120 45, 50 85 Z" fill="#e11d48"/></svg>`,
            draw: (c, size) => { c.fillStyle = '#e11d48'; c.beginPath(); const s = size*0.06; c.moveTo(0*s, 1.25*s); c.bezierCurveTo(-3*s, -1.5*s, -6*s, 0.5*s, 0*s, 4*s); c.moveTo(0*s, 1.25*s); c.bezierCurveTo(3*s, -1.5*s, 6*s, 0.5*s, 0*s, 4*s); c.fill(); }
        },
        {
            id: 'slash-white',
            svg: `<svg viewBox="0 0 100 100" transform="rotate(45)"><rect x="45" y="10" width="10" height="80" fill="#f1f5f9"/></svg>`,
            draw: (c, size) => { c.fillStyle = '#f1f5f9'; c.fillRect(-size/8, -size/2, size/4, size); }
        },
        {
            id: 'gradient-sphere-purple',
            svg: `<svg viewBox="0 0 100 100"><defs><radialGradient id="grad1" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#d8b4fe"/><stop offset="100%" stop-color="#7e22ce"/></radialGradient></defs><circle cx="50" cy="50" r="40" fill="url(#grad1)"/></svg>`,
            draw: (c, size) => { const r = size/2; const grad = c.createRadialGradient(-r*0.3, -r*0.3, 0, 0, 0, r); grad.addColorStop(0, '#d8b4fe'); grad.addColorStop(1, '#7e22ce'); c.fillStyle = grad; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill(); }
        },
         {
            id: 'chevron-indigo',
            svg: `<svg viewBox="0 0 100 100"><path d="M20 30 L50 60 L80 30 L50 0 Z" fill="#4f46e5"/></svg>`,
            draw: (c, size) => { c.fillStyle = '#4f46e5'; c.beginPath(); const s = size/2; c.moveTo(-s*0.8, -s*0.3); c.lineTo(0, s*0.4); c.lineTo(s*0.8, -s*0.3); c.lineTo(0, -s); c.closePath(); c.fill(); }
        }

    ];

    // --- Initialization ---
    function init() {
        setupCanvas();
        populatePalette();
        addEventListeners();
        selectFlower(flowers[0]);
        redrawCanvas();
    }

    function setupCanvas() {
        const container = canvas.parentElement;
        const size = Math.min(container.clientWidth, container.clientHeight) * 0.9;
        canvas.width = size;
        canvas.height = size;
    }

    function populatePalette() {
        flowers.forEach(flower => {
            const item = document.createElement('div');
            item.className = 'palette-item w-full aspect-square bg-slate-100 rounded-lg p-2 cursor-pointer hover:bg-slate-200';
            item.innerHTML = flower.svg;
            item.dataset.flowerId = flower.id;
            item.addEventListener('click', () => selectFlower(flower));
            paletteContainer.appendChild(item);
        });
    }

    function selectFlower(flower) {
        currentFlower = flower;
        document.querySelectorAll('.palette-item').forEach(el => {
            el.classList.toggle('selected', el.dataset.flowerId === flower.id);
        });
    }

    // --- Event Listeners ---
    function addEventListeners() {
        window.addEventListener('resize', () => {
           setupCanvas();
           redrawCanvas();
        });
        
        symmetrySlider.addEventListener('input', e => {
            symmetry = parseInt(e.target.value);
            symmetryValue.textContent = symmetry;
            redrawCanvas();
        });

        sizeSlider.addEventListener('input', e => {
            brushSize = parseInt(e.target.value);
            sizeValue.textContent = brushSize;
        });
        
        undoBtn.addEventListener('click', undo);
        
        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerup', handlePointerUp);
        canvas.addEventListener('pointerleave', handlePointerUp);

    }
    
    // --- Drawing Logic ---
    
    function handlePointerDown(e) {
        isDrawing = true;
        drawOnCanvas(e);
    }
    
    function handlePointerMove(e) {
        if (isDrawing) {
            drawOnCanvas(e);
        }
    }

    function handlePointerUp() {
        isDrawing = false;
    }

    function drawOnCanvas(e) {
        e.preventDefault();
        if (!currentFlower) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        const dx = x - centerX;
        const dy = y - centerY;

        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        const newAction = {
            flower: currentFlower,
            size: brushSize,
            points: []
        };

        for (let i = 0; i < symmetry; i++) {
            const currentAngle = angle + (i * 2 * Math.PI) / symmetry;
            const newX = dist * Math.cos(currentAngle);
            const newY = dist * Math.sin(currentAngle);
            newAction.points.push({ x: newX, y: newY, angle: currentAngle });
        }
        
        history.push(newAction);
        redrawCanvas();
    }
    
    function redrawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGuides();
        
        history.forEach(action => {
            const flowerDrawer = action.flower.draw;
            action.points.forEach(p => {
                ctx.save();
                ctx.translate(canvas.width / 2 + p.x, canvas.height / 2 + p.y);
                ctx.rotate(p.angle + Math.PI / 2); // Rotate to point outwards
                flowerDrawer(ctx, action.size);
                ctx.restore();
            });
        });
    }

    function drawGuides() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        ctx.strokeStyle = '#fde68a'; // amber-200
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);

        for (let i = 0; i < symmetry; i++) {
            const angle = (i * 2 * Math.PI) / symmetry;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + centerX * Math.cos(angle),
                centerY + centerY * Math.sin(angle)
            );
            ctx.stroke();
        }
        ctx.setLineDash([]);
    }

    // --- Actions ---
    function undo() {
        history.pop();
        redrawCanvas();
    }

    // Let's go!
    init();
});
