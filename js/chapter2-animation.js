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
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(colors.background);
    
    // 创建相机
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(15, 10, 15);
    
    // 创建渲染器
    const canvas = document.getElementById('atom-canvas');
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.shadowMap.enabled = true;
    canvas.appendChild(renderer.domElement);
    
    // 添加轨道控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 15);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // 创建原子模型的的
    createAtomModel();
    
    // 隐藏加载提示
    document.getElementById('loading').style.display = 'none';
    
    // 添加窗口大小调整监听
    window.addEventListener('resize', onWindowResize);
    
    // 初始化UI事件
    initUIEvents();
    
    // 开始动画循环
    animate();
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
        const nucleusGeometry = new THREE.SphereGeometry(1.5, 32, 32);
        const nucleusMaterial = new THREE.MeshPhongMaterial({ 
            color: colors.nucleus,
            shininess: 100,
            transparent: true,
            opacity: 0.9
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
    const { currentOrbital, quantumNumbers } = config;
    
    if (currentOrbital === 's' || currentOrbital === 'all') {
        createSOrbital();
    }
    
    if (currentOrbital === 'p' || currentOrbital === 'all') {
        createPOrbitals();
    }
    
    if (currentOrbital === 'd' || currentOrbital === 'all') {
        createDOrbitals();
    }
    
    // 更新轨道不透明度
    updateOrbitalOpacity();
}

// 创建s轨道（球形）
function createSOrbital() {
    const geometry = new THREE.SphereGeometry(6, 64, 64);
    const material = new THREE.MeshPhongMaterial({
        color: colors.sOrbital,
        transparent: true,
        opacity: config.opacity * 0.8,
        wireframe: true,
        side: THREE.DoubleSide
    });
    
    const sOrbital = new THREE.Mesh(geometry, material);
    sOrbital.name = 's-orbital';
    scene.add(sOrbital);
    orbitals.push(sOrbital);
    
    // 添加电子云点
    createElectronCloud('s', 6, colors.sOrbital);
}

// 创建p轨道（三个哑铃形轨道）
function createPOrbitals() {
    const pColors = [0xff6b6b, 0x4ecdc4, 0xffd166];
    const pAxes = ['x', 'y', 'z'];
    
    for (let i = 0; i < 3; i++) {
        // 创建p轨道哑铃形状
        const geometry = new THREE.TorusGeometry(4, 1.5, 16, 100);
        const material = new THREE.MeshPhongMaterial({
            color: pColors[i],
            transparent: true,
            opacity: config.opacity * 0.7,
            wireframe: true,
            side: THREE.DoubleSide
        });
        
        const pOrbital = new THREE.Mesh(geometry, material);
        pOrbital.name = `p-orbital-${pAxes[i]}`;
        
        // 根据轴旋转
        if (pAxes[i] === 'x') {
            pOrbital.rotation.z = Math.PI / 2;
        } else if (pAxes[i] === 'y') {
            // 默认方向就是y轴
        } else if (pAxes[i] === 'z') {
            pOrbital.rotation.x = Math.PI / 2;
        }
        
        scene.add(pOrbital);
        orbitals.push(pOrbital);
        
        // 添加电子云点
        createElectronCloud('p', 5, pColors[i], pAxes[i]);
    }
}

// 创建d轨道（五个花瓣形轨道）
function createDOrbitals() {
    const dColors = [0x9d4edd, 0xff9e00, 0x4cc9f0, 0xf72585, 0x4361ee];
    
    for (let i = 0; i < 5; i++) {
        // 创建d轨道形状（简化版本）
        const geometry = new THREE.TorusKnotGeometry(5, 1.2, 64, 8, 2, 3);
        const material = new THREE.MeshPhongMaterial({
            color: dColors[i],
            transparent: true,
            opacity: config.opacity * 0.6,
            wireframe: true,
            side: THREE.DoubleSide
        });
        
        const dOrbital = new THREE.Mesh(geometry, material);
        dOrbital.name = `d-orbital-${i}`;
        dOrbital.rotation.x = Math.PI / 4;
        dOrbital.rotation.y = (i * Math.PI) / 5;
        
        scene.add(dOrbital);
        orbitals.push(dOrbital);
        
        // 添加电子云点
        createElectronCloud('d', 7, dColors[i]);
    }
}

// 创建电子云点
function createElectronCloud(type, radius, color, axis = null) {
    const cloudPoints = Math.floor(config.density * 500);
    const pointsGeometry = new THREE.BufferGeometry();
    const pointsMaterial = new THREE.PointsMaterial({
        color: color,
        size: 0.1,
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
            // 哑铃形分布（沿轴方向）
            const axisFactor = axis === 'x' ? 1 : 0.3;
            const axisFactor2 = axis === 'y' ? 1 : 0.3;
            const axisFactor3 = axis === 'z' ? 1 : 0.3;
            
            x = (Math.random() - 0.5) * radius * 2 * axisFactor;
            y = (Math.random() - 0.5) * radius * 2 * axisFactor2;
            z = (Math.random() - 0.5) * radius * 2 * axisFactor3;
            
            // 增加轴方向的概率
            if (axis === 'x') x *= 2;
            if (axis === 'y') y *= 2;
            if (axis === 'z') z *= 2;
        } else {
            // d轨道 - 更复杂的分布
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = radius * Math.random();
            
            x = r * Math.sin(phi) * Math.cos(theta);
            y = r * Math.sin(phi) * Math.sin(theta);
            z = r * Math.cos(phi);
            
            // 添加花瓣效果
            if (Math.random() > 0.5) {
                x *= 1.5;
                z *= 0.5;
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
    const electronCount = config.currentOrbital === 'all' ? 12 : 
                         config.currentOrbital === 's' ? 2 :
                         config.currentOrbital === 'p' ? 6 : 10;
    
    for (let i = 0; i < electronCount; i++) {
        const radius = config.currentOrbital === 's' ? 4 : 
                      config.currentOrbital === 'p' ? 5 : 6;
        
        // 电子位置计算
        let angle = (i / electronCount) * Math.PI * 2;
        let x = Math.cos(angle) * radius;
        let y = Math.sin(angle) * radius;
        let z = (Math.random() - 0.5) * 2;
        
        // 对于所有轨道模式，随机分布电子
        if (config.currentOrbital === 'all') {
            x = (Math.random() - 0.5) * 12;
            y = (Math.random() - 0.5) * 12;
            z = (Math.random() - 0.5) * 12;
        }
        
        const electronGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const electronMaterial = new THREE.MeshPhongMaterial({
            color: colors.electron,
            shininess: 100,
            emissive: 0x444400
        });
        
        const electron = new THREE.Mesh(electronGeometry, electronMaterial);
        electron.position.set(x, y, z);
        electron.userData = {
            originalPosition: { x, y, z },
            speed: 0.02 + Math.random() * 0.03,
            offset: Math.random() * Math.PI * 2
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
            orbital.material.opacity = config.opacity * 
                (orbital.name.includes('s') ? 0.8 : 
                 orbital.name.includes('p') ? 0.7 : 0.6);
            
            // 更新电子云点的不透明度
            if (orbital.name.includes('cloud')) {
                orbital.material.opacity = config.opacity * 0.5;
            }
        }
    });
}

// 动画循环
function animate() {
    animationId = requestAnimationFrame(animate);
    
    // 更新控制器
    controls.update();
    
    // 旋转轨道
    if (isAnimating) {
        orbitals.forEach(orbital => {
            if (orbital.name && !orbital.name.includes('cloud')) {
                orbital.rotation.y += rotationSpeed;
                orbital.rotation.x += rotationSpeed * 0.3;
            }
        });
        
        // 电子运动
        electrons.forEach((electron, index) => {
            const time = Date.now() * 0.001;
            const data = electron.userData;
            
            // 电子绕轨道运动
            const orbitRadius = 4 + (index % 3);
            const angle = time * data.speed + data.offset;
            
            electron.position.x = data.originalPosition.x + Math.cos(angle) * orbitRadius * 0.3;
            electron.position.y = data.originalPosition.y + Math.sin(angle) * orbitRadius * 0.3;
            electron.position.z = data.originalPosition.z + Math.sin(angle * 1.5) * orbitRadius * 0.2;
            
            // 电子自转
            electron.rotation.x += 0.02;
            electron.rotation.y += 0.03;
        });
    }
    
    // 渲染场景
    renderer.render(scene, camera);
}

// 窗口大小调整处理
function onWindowResize() {
    const canvas = document.getElementById('atom-canvas');
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

// 初始化UI事件
function initUIEvents() {
    // 轨道按钮
    document.querySelectorAll('.orbital-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // 更新按钮状态
            document.querySelectorAll('.orbital-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 更新配置并重新创建模型
            config.currentOrbital = this.dataset.orbital;
            createAtomModel();
        });
    });
    
    // 不透明度滑块
    const opacitySlider = document.getElementById('opacity-slider');
    const opacityValue = document.getElementById('opacity-value');
    
    opacitySlider.addEventListener('input', function() {
        const value = this.value;
        opacityValue.textContent = `${value}%`;
        config.opacity = value / 100;
        updateOrbitalOpacity();
    });
    
    // 密度滑块
    const densitySlider = document.getElementById('density-slider');
    const densityValue = document.getElementById('density-value');
    
    densitySlider.addEventListener('input', function() {
        const value = this.value;
        densityValue.textContent = `${value}%`;
        config.density = value / 100;
        // 密度变化需要重新创建电子云
        createAtomModel();
    });
    
    // 旋转速度滑块
    const rotationSlider = document.getElementById('rotation-slider');
    const rotationValue = document.getElementById('rotation-value');
    
    rotationSlider.addEventListener('input', function() {
        const value = this.value / 100;
        rotationValue.textContent = value.toFixed(2);
        rotationSpeed = value * 0.01;
    });
    
    // 缩放滑块
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomValue = document.getElementById('zoom-value');
    
    zoomSlider.addEventListener('input', function() {
        const value = this.value / 100;
        zoomValue.textContent = value.toFixed(1);
        camera.position.set(15 * value, 10 * value, 15 * value);
    });
    
    // 显示/隐藏复选框
    document.getElementById('show-nucleus').addEventListener('change', function() {
        config.showNucleus = this.checked;
        createAtomModel();
    });
    
    document.getElementById('show-electrons').addEventListener('change', function() {
        config.showElectrons = this.checked;
        createAtomModel();
    });
    
    // 量子数滑块
    const nSlider = document.getElementById('n-slider');
    const nValue = document.getElementById('n-value');
    const lSlider = document.getElementById('l-slider');
    const lValue = document.getElementById('l-value');
    const mSlider = document.getElementById('m-slider');
    const mValue = document.getElementById('m-value');
    
    nSlider.addEventListener('input', function() {
        const value = parseInt(this.value);
        nValue.textContent = value;
        config.quantumNumbers.n = value;
        updateQuantumDisplay();
    });
    
    lSlider.addEventListener('input', function() {
        const value = parseInt(this.value);
        lValue.textContent = value;
        config.quantumNumbers.l = value;
        updateQuantumDisplay();
    });
    
    mSlider.addEventListener('input', function() {
        const value = parseInt(this.value);
        mValue.textContent = value;
        config.quantumNumbers.m = value;
        updateQuantumDisplay();
    });
    
    // 更新量子数显示
    function updateQuantumDisplay() {
        document.getElementById('current-n').textContent = config.quantumNumbers.n;
        
        const l = config.quantumNumbers.l;
        let lText = '';
        if (l === 0) lText = '0 (s轨道)';
        else if (l === 1) lText = '1 (p轨道)';
        else if (l === 2) lText = '2 (d轨道)';
        else if (l === 3) lText = '3 (f轨道)';
        
        document.getElementById('current-l').textContent = lText;
        document.getElementById('current-m').textContent = config.quantumNumbers.m;
    }
    
    // 元素选择
    document.getElementById('element-select').addEventListener('change', function() {
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
        
        document.getElementById('selected-element').textContent = `${elementNames[element]} 电子排布`;
        document.getElementById('electron-config-display').innerHTML = `
            <div style="font-size: 24px; text-align: center; color: #40a9ff; margin: 10px 0;">${electronConfigs[element]}</div>
            <div style="font-size: 14px; color: #a0d2ff; text-align: center;">
                ${getElementDescription(element)}
            </div>
        `;
    });
    
    // 标签切换
    document.getElementById('show-labels').addEventListener('change', function() {
        config.showLabels = this.checked;
        // 这里可以添加标签显示/隐藏的逻辑
    });
    
    // 标签切换
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // 更新标签状态
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应的内容
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // 重置视图按钮
    document.getElementById('reset-view').addEventListener('click', function() {
        controls.reset();
        camera.position.set(15, 10, 15);
        zoomSlider.value = 100;
        zoomValue.textContent = '1.0';
    });
    
    // 播放/暂停动画按钮
    document.getElementById('toggle-animation').addEventListener('click', function() {
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

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);



