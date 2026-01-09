/**
 * 原子结构三维动画 - Chapter 2
 * 原子轨道可视化与量子数交互
 */

// 主Three.js变量
let scene, camera, renderer, controls;
let nucleus, electrons = [], orbitals = [];
let animationId = null;
let isAnimating = true;
let rotationSpeed = 0.005;

// 配置参数
const config = {
    currentOrbital: 's',
    opacity: 0.7,
    density: 0.5,
    showNucleus: true,
    showElectrons: true,
    showLabels: false,
    quantumNumbers: {
        n: 1,
        l: 0,
        m: 0
    }
};

// 颜色定义
const colors = {
    nucleus: 0xff4040,
    sOrbital: 0x40a9ff,
    pOrbital: 0xffaa40,
    dOrbital: 0x40ff80,
    electron: 0xffff00,
    background: 0x050f1e
};

// 初始化函数
function init() {
    console.log("原子结构三维动画 - 第二章");
    
    // 获取canvas元素
    const canvas = document.getElementById('atom-canvas');
    const loadingElement = document.getElementById('loading');
    
    if (!canvas) {
        loadingElement.innerHTML = '<span style="color:#ff4040">找不到Canvas元素</span>';
        return;
    }
    
    // 检查Three.js是否加载
    if (typeof THREE === 'undefined') {
        loadingElement.innerHTML = '<span style="color:#ff4040">Three.js库加载失败，请刷新页面</span>';
        return;
    }
    
    // 检查WebGL支持
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        loadingElement.innerHTML = `
            <div style="color:#ff4040;text-align:center;padding:20px;">
                <h3>WebGL不支持</h3>
                <p>您的浏览器不支持WebGL，无法显示3D内容。</p>
                <p>请使用Chrome、Firefox或Edge浏览器，并确保启用WebGL。</p>
                <button onclick="init2DFallback()" style="margin-top:10px;padding:8px 16px;background:#40a9ff;border:none;border-radius:4px;color:white;cursor:pointer;">
                    使用2D备用方案
                </button>
            </div>
        `;
        return;
    }
    
    try {
        // 1. 创建场景
        scene = new THREE.Scene();
        scene.background = new THREE.Color(colors.background);
        
        // 2. 创建相机
        const aspect = canvas.clientWidth / canvas.clientHeight;
        camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        camera.position.set(15, 10, 15);
        
        // 3. 创建渲染器
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            canvas: canvas 
        });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // 4. 添加轨道控制器
        if (typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 5;
            controls.maxDistance = 50;
        } else {
            console.warn("OrbitControls未加载，使用基础控制");
        }
        
        // 5. 添加灯光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 15);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        
        // 6. 创建原子模型
        createAtomModel();
        
        // 7. 隐藏加载提示
        loadingElement.style.opacity = '0';
        setTimeout(() => {
            loadingElement.style.display = 'none';
        }, 500);
        
        console.log("3D场景初始化成功!");
        
        // 8. 开始动画循环
        animate();
        
        // 9. 窗口大小调整监听
        window.addEventListener('resize', onWindowResize);
        
        // 10. 初始化UI事件
        initUIEvents();
        
    } catch (error) {
        console.error("初始化失败:", error);
        loadingElement.innerHTML = `
            <div style="color:#ff4040;text-align:center;padding:20px;">
                <h3>3D初始化失败</h3>
                <p>${error.message}</p>
                <button onclick="init2DFallback()" style="margin-top:10px;padding:8px 16px;background:#40a9ff;border:none;border-radius:4px;color:white;cursor:pointer;">
                    使用2D备用方案
                </button>
            </div>
        `;
    }
}

// 创建原子模型
function createAtomModel() {
    // 清空现有对象
    if (nucleus) scene.remove(nucleus);
    electrons.forEach(electron => scene.remove(electron));
    orbitals.forEach(orbital => scene.remove(orbital));
    
    electrons = [];
    orbitals = [];
    
    // 创建原子核
    if (config.showNucleus) {
        const nucleusGeometry = new THREE.SphereGeometry(1.2, 24, 24);
        const nucleusMaterial = new THREE.MeshPhongMaterial({ 
            color: colors.nucleus,
            shininess: 50,
            emissive: 0x660000
        });
        nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
        nucleus.castShadow = true;
        scene.add(nucleus);
    }
    
    // 根据当前配置创建轨道
    createOrbitals();
    
    // 创建电子
    if (config.showElectrons) {
        createElectrons();
    }
}

// 创建轨道
function createOrbitals() {
    const orbitalType = config.currentOrbital;
    
    if (orbitalType === 's' || orbitalType === 'all') {
        createSOrbital();
    }
    
    if (orbitalType === 'p' || orbitalType === 'all') {
        createPOrbitals();
    }
    
    if (orbitalType === 'd' || orbitalType === 'all') {
        createDOrbitals();
    }
    
    updateOrbitalOpacity();
}

// 创建s轨道（球形）
function createSOrbital() {
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        color: colors.sOrbital,
        wireframe: true,
        transparent: true,
        opacity: config.opacity * 0.8,
        side: THREE.DoubleSide
    });
    
    const sOrbital = new THREE.Mesh(geometry, material);
    sOrbital.name = 's-orbital';
    scene.add(sOrbital);
    orbitals.push(sOrbital);
    
    // 创建电子云
    createElectronCloud('s', 5, colors.sOrbital);
}

// 创建p轨道（三个哑铃形轨道）
function createPOrbitals() {
    const pAxes = [
        { axis: 'x', rotation: { z: Math.PI / 2 } },
        { axis: 'y', rotation: {} },
        { axis: 'z', rotation: { x: Math.PI / 2 } }
    ];
    
    pAxes.forEach((axisObj, index) => {
        const pColors = [0xff6b6b, 0x4ecdc4, 0xffd166];
        
        // 创建哑铃形状
        const geometry = new THREE.CylinderGeometry(1.2, 1.2, 10, 8);
        const material = new THREE.MeshBasicMaterial({
            color: pColors[index],
            wireframe: true,
            transparent: true,
            opacity: config.opacity * 0.7,
            side: THREE.DoubleSide
        });
        
        const pOrbital = new THREE.Mesh(geometry, material);
        pOrbital.name = `p-orbital-${axisObj.axis}`;
        
        // 应用旋转
        Object.keys(axisObj.rotation).forEach(key => {
            pOrbital.rotation[key] = axisObj.rotation[key];
        });
        
        scene.add(pOrbital);
        orbitals.push(pOrbital);
        
        // 创建电子云
        createElectronCloud('p', 6, pColors[index], axisObj.axis);
    });
}

// 创建d轨道（简化版）
function createDOrbitals() {
    const dColors = [0x9d4edd, 0xff9e00, 0x4cc9f0, 0xf72585, 0x4361ee];
    
    for (let i = 0; i < 4; i++) {
        const geometry = new THREE.TorusGeometry(4, 1.2, 8, 16);
        const material = new THREE.MeshBasicMaterial({
            color: dColors[i],
            wireframe: true,
            transparent: true,
            opacity: config.opacity * 0.6,
            side: THREE.DoubleSide
        });
        
        const dOrbital = new THREE.Mesh(geometry, material);
        dOrbital.name = `d-orbital-${i}`;
        dOrbital.rotation.x = Math.PI / 4;
        dOrbital.rotation.y = (i * Math.PI) / 4;
        
        scene.add(dOrbital);
        orbitals.push(dOrbital);
        
        // 创建电子云
        createElectronCloud('d', 7, dColors[i]);
    }
}

// 创建电子云
function createElectronCloud(type, radius, color, axis = null) {
    const cloudPoints = Math.floor(config.density * 200);
    const pointsGeometry = new THREE.BufferGeometry();
    const pointsMaterial = new THREE.PointsMaterial({
        color: color,
        size: 0.2,
        transparent: true,
        opacity: config.opacity * 0.5
    });
    
    const positions = [];
    
    for (let i = 0; i < cloudPoints; i++) {
        let x, y, z;
        
        if (type === 's') {
            // 球形分布
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = radius * Math.random();
            
            x = r * Math.sin(phi) * Math.cos(theta);
            y = r * Math.sin(phi) * Math.sin(theta);
            z = r * Math.cos(phi);
        } else if (type === 'p') {
            // 哑铃形分布
            x = (Math.random() - 0.5) * radius * 2;
            y = (Math.random() - 0.5) * radius * 2;
            z = (Math.random() - 0.5) * radius * 2;
            
            // 根据轴增强分布
            if (axis === 'x') {
                x *= 1.5;
                y *= 0.4;
                z *= 0.4;
            } else if (axis === 'y') {
                x *= 0.4;
                y *= 1.5;
                z *= 0.4;
            } else if (axis === 'z') {
                x *= 0.4;
                y *= 0.4;
                z *= 1.5;
            }
        } else {
            // d轨道 - 复杂分布
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = radius * Math.random();
            
            x = r * Math.sin(phi) * Math.cos(theta);
            y = r * Math.sin(phi) * Math.sin(theta);
            z = r * Math.cos(phi);
            
            // 添加一些方向性
            const angle = Math.atan2(y, x);
            if (Math.abs(Math.cos(2 * angle)) > 0.5) {
                x *= 1.3;
                y *= 1.3;
            }
        }
        
        positions.push(x, y, z);
    }
    
    pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    points.name = `cloud-${type}`;
    scene.add(points);
    orbitals.push(points);
}

// 创建电子
function createElectrons() {
    let electronCount;
    let electronRadius;
    
    switch(config.currentOrbital) {
        case 's':
            electronCount = 2;
            electronRadius = 5;
            break;
        case 'p':
            electronCount = 6;
            electronRadius = 6;
            break;
        case 'd':
            electronCount = 10;
            electronRadius = 7;
            break;
        case 'all':
            electronCount = 18;
            electronRadius = 8;
            break;
        default:
            electronCount = 2;
            electronRadius = 5;
    }
    
    for (let i = 0; i < electronCount; i++) {
        let x, y, z;
        
        if (config.currentOrbital === 'all') {
            // 随机分布
            x = (Math.random() - 0.5) * 12;
            y = (Math.random() - 0.5) * 12;
            z = (Math.random() - 0.5) * 12;
        } else {
            // 轨道分布
            const angle = (i / electronCount) * Math.PI * 2;
            x = Math.cos(angle) * electronRadius;
            y = Math.sin(angle) * electronRadius;
            z = (Math.random() - 0.5) * 2;
        }
        
        const geometry = new THREE.SphereGeometry(0.2, 12, 12);
        const material = new THREE.MeshPhongMaterial({
            color: colors.electron,
            shininess: 100,
            emissive: 0x444400
        });
        
        const electron = new THREE.Mesh(geometry, material);
        electron.position.set(x, y, z);
        
        // 存储电子运动参数
        electron.userData = {
            originalPosition: { x, y, z },
            speed: 0.02 + Math.random() * 0.03,
            offset: Math.random() * Math.PI * 2,
            radius: electronRadius
        };
        
        electron.castShadow = true;
        scene.add(electron);
        electrons.push(electron);
    }
}

// 更新轨道不透明度
function updateOrbitalOpacity() {
    orbitals.forEach(orbital => {
        if (orbital.material) {
            if (orbital.name.includes('s')) {
                orbital.material.opacity = config.opacity * 0.8;
            } else if (orbital.name.includes('p')) {
                orbital.material.opacity = config.opacity * 0.7;
            } else if (orbital.name.includes('d')) {
                orbital.material.opacity = config.opacity * 0.6;
            } else if (orbital.name.includes('cloud')) {
                orbital.material.opacity = config.opacity * 0.5;
            }
        }
    });
}

// 动画循环
function animate() {
    animationId = requestAnimationFrame(animate);
    
    // 更新控制器
    if (controls) {
        controls.update();
    }
    
    // 旋转轨道
    if (isAnimating) {
        orbitals.forEach(orbital => {
            if (orbital.name && !orbital.name.includes('cloud')) {
                orbital.rotation.y += rotationSpeed;
                orbital.rotation.x += rotationSpeed * 0.3;
            }
        });
        
        // 电子运动
        electrons.forEach((electron) => {
            const data = electron.userData;
            const time = Date.now() * 0.001;
            
            // 电子绕轨道运动
            const orbitRadius = data.radius || 5;
            const angle = time * data.speed + data.offset;
            
            electron.position.x = data.originalPosition.x + Math.cos(angle) * orbitRadius * 0.2;
            electron.position.y = data.originalPosition.y + Math.sin(angle) * orbitRadius * 0.2;
            electron.position.z = data.originalPosition.z + Math.sin(angle * 1.5) * orbitRadius * 0.1;
            
            // 电子自转
            electron.rotation.x += 0.02;
            electron.rotation.y += 0.03;
        });
    }
    
    // 渲染场景
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// 窗口大小调整处理
function onWindowResize() {
    const canvas = document.getElementById('atom-canvas');
    if (!canvas || !camera || !renderer) return;
    
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

// 初始化UI事件
function initUIEvents() {
    // 轨道按钮
    document.querySelectorAll('.orbital-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.orbital-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            config.currentOrbital = this.dataset.orbital;
            createAtomModel();
        });
    });
    
    // 不透明度滑块
    const opacitySlider = document.getElementById('opacity-slider');
    const opacityValue = document.getElementById('opacity-value');
    
    if (opacitySlider && opacityValue) {
        opacitySlider.addEventListener('input', function() {
            const value = this.value;
            opacityValue.textContent = `${value}%`;
            config.opacity = value / 100;
            updateOrbitalOpacity();
        });
    }
    
    // 密度滑块
    const densitySlider = document.getElementById('density-slider');
    const densityValue = document.getElementById('density-value');
    
    if (densitySlider && densityValue) {
        densitySlider.addEventListener('input', function() {
            const value = this.value;
            densityValue.textContent = `${value}%`;
            config.density = value / 100;
            createAtomModel();
        });
    }
    
    // 旋转速度滑块
    const rotationSlider = document.getElementById('rotation-slider');
    const rotationValue = document.getElementById('rotation-value');
    
    if (rotationSlider && rotationValue) {
        rotationSlider.addEventListener('input', function() {
            const value = this.value / 100;
            rotationValue.textContent = value.toFixed(2);
            rotationSpeed = value * 0.01;
        });
    }
    
    // 缩放滑块
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomValue = document.getElementById('zoom-value');
    
    if (zoomSlider && zoomValue) {
        zoomSlider.addEventListener('input', function() {
            const value = this.value / 100;
            zoomValue.textContent = value.toFixed(1);
            if (camera) {
                camera.position.set(15 * value, 10 * value, 15 * value);
            }
        });
    }
    
    // 显示/隐藏复选框
    const showNucleus = document.getElementById('show-nucleus');
    const showElectrons = document.getElementById('show-electrons');
    
    if (showNucleus) {
        showNucleus.addEventListener('change', function() {
            config.showNucleus = this.checked;
            createAtomModel();
        });
    }
    
    if (showElectrons) {
        showElectrons.addEventListener('change', function() {
            config.showElectrons = this.checked;
            createAtomModel();
        });
    }
    
    // 量子数滑块
    const nSlider = document.getElementById('n-slider');
    const nValue = document.getElementById('n-value');
    const lSlider = document.getElementById('l-slider');
    const lValue = document.getElementById('l-value');
    const mSlider = document.getElementById('m-slider');
    const mValue = document.getElementById('m-value');
    
    if (nSlider && nValue) {
        nSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            nValue.textContent = value;
            config.quantumNumbers.n = value;
            updateQuantumDisplay();
        });
    }
    
    if (lSlider && lValue) {
        lSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            lValue.textContent = value;
            config.quantumNumbers.l = value;
            updateQuantumDisplay();
        });
    }
    
    if (mSlider && mValue) {
        mSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            mValue.textContent = value;
            config.quantumNumbers.m = value;
            updateQuantumDisplay();
        });
    }
    
    // 更新量子数显示
    function updateQuantumDisplay() {
        const currentN = document.getElementById('current-n');
        const currentL = document.getElementById('current-l');
        const currentM = document.getElementById('current-m');
        
        if (currentN) currentN.textContent = config.quantumNumbers.n;
        
        if (currentL) {
            const l = config.quantumNumbers.l;
            let lText = '';
            if (l === 0) lText = '0 (s轨道)';
            else if (l === 1) lText = '1 (p轨道)';
            else if (l === 2) lText = '2 (d轨道)';
            else if (l === 3) lText = '3 (f轨道)';
            
            currentL.textContent = lText;
        }
        
        if (currentM) currentM.textContent = config.quantumNumbers.m;
    }
    
    // 元素选择
    const elementSelect = document.getElementById('element-select');
    if (elementSelect) {
        elementSelect.addEventListener('change', function() {
            const element = this.value;
            const elementNames = {
                'H': '氢 (H)',
                'He': '氦 (He)',
                'C': '碳 (C)',
                'Ne': '氖 (Ne)',
                'Na': '钠 (Na)',
                'Fe': '铁 (Fe)'
            };
            
            const electronConfigs = {
                'H': '1s¹',
                'He': '1s²',
                'C': '1s² 2s² 2p²',
                'Ne': '1s² 2s² 2p⁶',
                'Na': '[Ne] 3s¹',
                'Fe': '[Ar] 4s² 3d⁶'
            };
            
            const selectedElement = document.getElementById('selected-element');
            const configDisplay = document.getElementById('electron-config-display');
            
            if (selectedElement) {
                selectedElement.textContent = `${elementNames[element]} 电子排布`;
            }
            
            if (configDisplay) {
                configDisplay.innerHTML = `
                    <div style="font-size: 24px; text-align: center; color: #40a9ff; margin: 10px 0;">
                        ${electronConfigs[element]}
                    </div>
                    <div style="font-size: 14px; color: #a0d2ff; text-align: center;">
                        ${getElementDescription(element)}
                    </div>
                `;
            }
        });
    }
    
    // 标签切换
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            const targetPane = document.getElementById(tabId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
    
    // 重置视图按钮
    const resetBtn = document.getElementById('reset-view');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (controls) {
                controls.reset();
            }
            if (camera) {
                camera.position.set(15, 10, 15);
            }
            if (zoomSlider) {
                zoomSlider.value = 100;
                if (zoomValue) {
                    zoomValue.textContent = '1.0';
                }
            }
        });
    }
    
    // 播放/暂停动画按钮
    const toggleBtn = document.getElementById('toggle-animation');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            isAnimating = !isAnimating;
            const icon = this.querySelector('i');
            const text = this.querySelector('span');
            
            if (isAnimating) {
                icon.className = 'fas fa-pause';
                text.textContent = '暂停动画';
            } else {
                icon.className = 'fas fa-play';
                text.textContent = '播放动画';
            }
        });
    }
    
    // 标签显示复选框
    const showLabels = document.getElementById('show-labels');
    if (showLabels) {
        showLabels.addEventListener('change', function() {
            config.showLabels = this.checked;
            console.log("显示标签:", config.showLabels);
        });
    }
}

// 获取元素描述
function getElementDescription(element) {
    const descriptions = {
        'H': '氢原子是最简单的原子，只有1个电子占据1s轨道。',
        'He': '氦原子有2个电子，完全填满1s轨道，是惰性气体。',
        'C': '碳原子有6个电子，电子排布为1s² 2s² 2p²，是生命的基础元素。',
        'Ne': '氖原子有10个电子，所有轨道都被填满，是稳定的惰性气体。',
        'Na': '钠原子有11个电子，电子排布为[Ne] 3s¹，最外层只有1个电子。',
        'Fe': '铁原子有26个电子，电子排布为[Ar] 4s² 3d⁶，是重要的过渡金属。'
    };
    
    return descriptions[element] || '该元素的电子排布遵循能量最低原理、泡利不相容原理和洪特规则。';
}

// 2D备用方案
function init2DFallback() {
    const canvas = document.getElementById('atom-canvas');
    const loading = document.getElementById('loading');
    
    if (!canvas) return;
    
    loading.style.display = 'none';
    
    // 创建2D上下文
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // 2D动画参数
    let currentOrbital = 's';
    let animationRunning = true;
    let angle = 0;
    
    // 绘制原子函数
    function draw2DAtom() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const scale = Math.min(canvas.width, canvas.height) / 300;
        
        // 绘制原子核
        ctx.beginPath();
        ctx.arc(centerX, centerY, 15 * scale, 0, Math.PI * 2);
        ctx.fillStyle = '#ff4040';
        ctx.fill();
        
        // 根据轨道类型绘制
        switch(currentOrbital) {
            case 's':
                draw2DSOrbital(ctx, centerX, centerY, scale);
                break;
            case 'p':
                draw2DPOrbital(ctx, centerX, centerY, scale);
                break;
            case 'd':
                draw2DDOrbital(ctx, centerX, centerY, scale);
                break;
            case 'all':
                draw2DAllOrbitals(ctx, centerX, centerY, scale);
                break;
        }
        
        angle += 0.01;
        
        if (animationRunning) {
            requestAnimationFrame(draw2DAtom);
        }
    }
    
    // 绘制2D s轨道
    function draw2DSOrbital(ctx, x, y, scale) {
        // 轨道圆
        ctx.beginPath();
        ctx.arc(x, y, 80 * scale, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(64, 169, 255, 0.7)';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();
        
        // 电子
        for (let i = 0; i < 2; i++) {
            const electronAngle = angle + i * Math.PI;
            const px = x + Math.cos(electronAngle) * 80 * scale;
            const py = y + Math.sin(electronAngle) * 80 * scale;
            
            ctx.beginPath();
            ctx.arc(px, py, 6 * scale, 0, Math.PI * 2);
            ctx.fillStyle = '#ffff00';
            ctx.fill();
        }
    }
    
    // 绘制2D p轨道
    function draw2DPOrbital(ctx, x, y, scale) {
        // 三个p轨道
        const orbitals = [
            { rotation: 0, color: 'rgba(255, 107, 107, 0.7)' },
            { rotation: Math.PI / 2, color: 'rgba(78, 205, 196, 0.7)' },
            { rotation: Math.PI / 4, color: 'rgba(255, 209, 102, 0.7)' }
        ];
        
        orbitals.forEach((orbital, index) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(orbital.rotation + angle * 0.3);
            
            // 哑铃形状
            ctx.beginPath();
            ctx.ellipse(0, 0, 100 * scale, 30 * scale, 0, 0, Math.PI * 2);
            ctx.strokeStyle = orbital.color;
            ctx.lineWidth = 2 * scale;
            ctx.stroke();
            
            // 电子
            for (let i = 0; i < 2; i++) {
                const electronAngle = angle * 0.5 + i * Math.PI;
                const px = Math.cos(electronAngle) * 100 * scale;
                const py = Math.sin(electronAngle) * 30 * scale;
                
                ctx.beginPath();
                ctx.arc(px, py, 5 * scale, 0, Math.PI * 2);
                ctx.fillStyle = '#ffff00';
                ctx.fill();
            }
            
            ctx.restore();
        });
    }
    
    // 绘制2D d轨道
    function draw2DDOrbital(ctx, x, y, scale) {
        // 五个d轨道
        for (let i = 0; i < 5; i++) {
            const orbitAngle = (i / 5) * Math.PI * 2;
            const color = i % 2 === 0 ? 'rgba(64, 255, 128, 0.7)' : 'rgba(157, 78, 221, 0.7)';
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(orbitAngle + angle * 0.2);
            
            // 花瓣形状
            ctx.beginPath();
            for (let a = 0; a < Math.PI * 2; a += 0.1) {
                const r = 80 * scale * (1 + 0.3 * Math.cos(4 * a));
                const px = Math.cos(a) * r;
                const py = Math.sin(a) * r;
                
                if (a === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.closePath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2 * scale;
            ctx.stroke();
            
            // 电子
            for (let j = 0; j < 2; j++) {
                const electronAngle = angle * 0.4 + j * Math.PI;
                const r = 80 * scale * (1 + 0.3 * Math.cos(4 * electronAngle));
                const px = Math.cos(electronAngle) * r;
                const py = Math.sin(electronAngle) * r;
                
                ctx.beginPath();
                ctx.arc(px, py, 4 * scale, 0, Math.PI * 2);
                ctx.fillStyle = '#ffff00';
                ctx.fill();
            }
            
            ctx.restore();
        }
    }
    
    // 绘制所有轨道
    function draw2DAllOrbitals(ctx, x, y, scale) {
        draw2DSOrbital(ctx, x, y, scale * 0.7);
        draw2DPOrbital(ctx, x, y, scale * 0.8);
        draw2DDOrbital(ctx, x, y, scale);
    }
    
    // 更新轨道类型
    window.updateOrbital2D = function(type) {
        currentOrbital = type;
    };
    
    // 切换动画
    window.toggleAnimation2D = function() {
        animationRunning = !animationRunning;
        const btn = document.getElementById('toggle-animation');
        const icon = btn.querySelector('i');
        const text = btn.querySelector('span');
        
        if (animationRunning) {
            icon.className = 'fas fa-pause';
            text.textContent = '暂停动画';
            draw2DAtom();
        } else {
            icon.className = 'fas fa-play';
            text.textContent = '播放动画';
        }
    };
    
    // 更新轨道按钮事件
    document.querySelectorAll('.orbital-btn').forEach(btn => {
        const originalClick = btn.onclick;
        btn.onclick = function() {
            if (originalClick) originalClick.call(this);
            window.updateOrbital2D(this.dataset.orbital);
        };
    });
    
    // 更新播放/暂停按钮事件
    const toggleBtn = document.getElementById('toggle-animation');
    if (toggleBtn) {
        const originalClick = toggleBtn.onclick;
        toggleBtn.onclick = function() {
            if (originalClick) originalClick.call(this);
            window.toggleAnimation2D();
        };
    }
    
    // 开始绘制
    draw2DAtom();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM加载完成，开始初始化...");
    
    // 等待一小段时间确保所有资源加载
    setTimeout(() => {
        if (typeof THREE !== 'undefined') {
            init();
        } else {
            console.error("Three.js未加载，使用2D备用方案");
            init2DFallback();
        }
    }, 500);
});

// 清理函数
window.addEventListener('beforeunload', function() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
});
