// js/chapter1-animation.js - 原子结构三维动画

let scene, camera, renderer;
let controls;
let atoms = [];
let orbitals = [];
let electronClouds = [];
let animationId = null;
let isRotating = true;
let currentOrbitalType = 's';
let showLabels = true;
let showOrbitals = true;
let showElectronClouds = true;

// 原子轨道参数
const orbitalParams = {
    s: { lobes: 1, color: 0xff0000, size: 2, complexity: 1 },
    p: { lobes: 2, color: 0x00ff00, size: 3, complexity: 2 },
    d: { lobes: 4, color: 0x0000ff, size: 4, complexity: 3 },
    f: { lobes: 6, color: 0xff00ff, size: 5, complexity: 4 }
};

// 初始化场景
function init() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    
    // 创建相机
    camera = new THREE.PerspectiveCamera(45, 
        window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(15, 10, 15);
    
    // 创建渲染器
    const canvas = document.getElementById('atomCanvas') || document.getElementById('moleculeCanvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // 添加轨道控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 15);
    scene.add(directionalLight);
    
    // 创建坐标系
    createCoordinateSystem();
    
    // 创建原子核
    createNucleus();
    
    // 初始创建s轨道
    createOrbital('s');
    
    // 创建电子云
    createElectronCloud('1s');
    
    // 创建量子数显示
    createQuantumNumbersDisplay();
    
    // 添加窗口大小调整监听
    window.addEventListener('resize', onWindowResize);
    
    // 开始动画循环
    animate();
}

// 创建坐标系
function createCoordinateSystem() {
    const axesHelper = new THREE.AxesHelper(8);
    scene.add(axesHelper);
    
    // 添加坐标轴标签
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 64;
    labelCanvas.height = 64;
    const labelContext = labelCanvas.getContext('2d');
    
    const axisLabels = ['x', 'y', 'z'];
    const axisColors = [0xff0000, 0x00ff00, 0x0000ff];
    
    axisLabels.forEach((label, index) => {
        labelContext.clearRect(0, 0, 64, 64);
        labelContext.fillStyle = 'white';
        labelContext.font = '48px Arial';
        labelContext.textAlign = 'center';
        labelContext.textBaseline = 'middle';
        labelContext.fillText(label, 32, 32);
        
        const texture = new THREE.CanvasTexture(labelCanvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        
        const position = [8, 0, 0];
        if (index === 1) position = [0, 8, 0];
        if (index === 2) position = [0, 0, 8];
        
        sprite.position.set(...position);
        sprite.scale.set(2, 2, 1);
        scene.add(sprite);
    });
}

// 创建原子核
function createNucleus() {
    const geometry = new THREE.SphereGeometry(1.5, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0xff9900,
        emissive: 0x442200,
        shininess: 100
    });
    const nucleus = new THREE.Mesh(geometry, material);
    scene.add(nucleus);
    atoms.push(nucleus);
    
    // 添加质子中子标签
    if (showLabels) {
        const protonCount = 6; // 碳原子示例
        const neutronCount = 6;
        
        const protonLabel = createTextLabel(`质子: ${protonCount}`, 0, 2.5, 0);
        const neutronLabel = createTextLabel(`中子: ${neutronCount}`, 0, 1.5, 0);
        
        scene.add(protonLabel);
        scene.add(neutronLabel);
    }
}

// 创建轨道
function createOrbital(type) {
    // 清除现有轨道
    orbitals.forEach(orbital => scene.remove(orbital));
    orbitals = [];
    
    const params = orbitalParams[type];
    if (!params) return;
    
    // 创建轨道曲面
    const geometry = createOrbitalGeometry(type);
    const material = new THREE.MeshPhongMaterial({
        color: params.color,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    
    const orbital = new THREE.Mesh(geometry, material);
    scene.add(orbital);
    orbitals.push(orbital);
    
    // 创建轨道轮廓线
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: params.color,
        linewidth: 2
    });
    const orbitalLines = new THREE.LineSegments(edges, lineMaterial);
    scene.add(orbitalLines);
    orbitals.push(orbitalLines);
    
    // 创建轨道标签
    if (showLabels) {
        const orbitalLabel = createTextLabel(`${type.toUpperCase()}轨道`, 0, 0, params.size + 1);
        scene.add(orbitalLabel);
        orbitals.push(orbitalLabel);
    }
    
    currentOrbitalType = type;
    
    // 更新量子数显示
    updateQuantumNumbers(type);
}

// 创建轨道几何体
function createOrbitalGeometry(type) {
    switch(type) {
        case 's':
            return new THREE.SphereGeometry(4, 32, 32);
        
        case 'p':
            // p轨道 - 两个相切的球体
            const group = new THREE.Group();
            const sphere1 = new THREE.SphereGeometry(2.5, 32, 32);
            const sphere2 = new THREE.SphereGeometry(2.5, 32, 32);
            
            const mesh1 = new THREE.Mesh(sphere1);
            mesh1.position.y = 2.5;
            
            const mesh2 = new THREE.Mesh(sphere2);
            mesh2.position.y = -2.5;
            
            group.add(mesh1);
            group.add(mesh2);
            
            return new THREE.BufferGeometry().fromGeometry(group);
        
        case 'd':
            // d轨道 - 四个叶瓣
            const dGroup = new THREE.Group();
            const positions = [
                [3, 3, 0], [-3, -3, 0],
                [3, -3, 0], [-3, 3, 0]
            ];
            
            positions.forEach(pos => {
                const sphere = new THREE.SphereGeometry(1.8, 32, 32);
                const mesh = new THREE.Mesh(sphere);
                mesh.position.set(pos[0], pos[1], pos[2]);
                dGroup.add(mesh);
            });
            
            return new THREE.BufferGeometry().fromGeometry(dGroup);
        
        case 'f':
            // f轨道 - 六个叶瓣
            const fGroup = new THREE.Group();
            const fPositions = [
                [4, 0, 0], [-4, 0, 0],
                [0, 4, 0], [0, -4, 0],
                [2.8, 2.8, 0], [-2.8, -2.8, 0]
            ];
            
            fPositions.forEach(pos => {
                const sphere = new THREE.SphereGeometry(1.5, 32, 32);
                const mesh = new THREE.Mesh(sphere);
                mesh.position.set(pos[0], pos[1], pos[2]);
                fGroup.add(mesh);
            });
            
            return new THREE.BufferGeometry().fromGeometry(fGroup);
        
        default:
            return new THREE.SphereGeometry(3, 32, 32);
    }
}

// 创建电子云
function createElectronCloud(orbitalName) {
    // 清除现有电子云
    electronClouds.forEach(cloud => scene.remove(cloud));
    electronClouds = [];
    
    // 创建电子云点群
    const pointCount = 1000;
    const positions = new Float32Array(pointCount * 3);
    const colors = new Float32Array(pointCount * 3);
    
    for (let i = 0; i < pointCount; i++) {
        // 根据轨道类型生成不同的概率分布
        const radius = 4 + Math.random() * 2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        // 概率密度函数（简化版）
        let probability = 1;
        if (currentOrbitalType === 'p') {
            probability = Math.abs(Math.cos(phi));
        } else if (currentOrbitalType === 'd') {
            probability = Math.pow(Math.sin(phi), 2) * Math.abs(Math.cos(2 * theta));
        }
        
        // 根据概率决定是否显示该点
        if (Math.random() > probability) {
            i--;
            continue;
        }
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // 根据距离设置颜色（越远越淡）
        const intensity = 1 - (radius - 4) / 2;
        colors[i * 3] = 0.2 + 0.8 * intensity; // R
        colors[i * 3 + 1] = 0.5 + 0.5 * intensity; // G
        colors[i * 3 + 2] = 1.0; // B
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const electronCloud = new THREE.Points(geometry, material);
    scene.add(electronCloud);
    electronClouds.push(electronCloud);
    
    // 添加电子云标签
    if (showLabels) {
        const cloudLabel = createTextLabel(`电子云: ${orbitalName}`, 0, 6, 0);
        scene.add(cloudLabel);
        electronClouds.push(cloudLabel);
    }
}

// 创建量子数显示
function createQuantumNumbersDisplay() {
    const quantumNumbers = {
        n: { value: 1, description: "主量子数 (能层)" },
        l: { value: 0, description: "角量子数 (能级)" },
        m: { value: 0, description: "磁量子数 (轨道方向)" },
        s: { value: "+1/2", description: "自旋量子数" }
    };
    
    const quantumNumbersDiv = document.getElementById('quantumNumbers') || createQuantumNumbersDiv();
    
    let html = '<h3><i class="fas fa-atom"></i> 量子数</h3>';
    html += '<div class="quantum-grid">';
    
    Object.entries(quantumNumbers).forEach(([key, data]) => {
        html += `
            <div class="quantum-item">
                <div class="quantum-label">${key.toUpperCase()}</div>
                <div class="quantum-value">${data.value}</div>
                <div class="quantum-desc">${data.description}</div>
            </div>
        `;
    });
    
    html += '</div>';
    quantumNumbersDiv.innerHTML = html;
}

// 更新量子数显示
function updateQuantumNumbers(orbitalType) {
    const quantumNumbers = {
        s: { n: 1, l: 0, m: 0, s: "+1/2" },
        p: { n: 2, l: 1, m: [-1, 0, 1], s: "±1/2" },
        d: { n: 3, l: 2, m: [-2, -1, 0, 1, 2], s: "±1/2" },
        f: { n: 4, l: 3, m: [-3, -2, -1, 0, 1, 2, 3], s: "±1/2" }
    };
    
    const params = quantumNumbers[orbitalType];
    if (!params) return;
    
    // 更新显示
    const quantumItems = document.querySelectorAll('.quantum-item');
    
    // 主量子数 n
    quantumItems[0].querySelector('.quantum-value').textContent = params.n;
    quantumItems[1].querySelector('.quantum-value').textContent = params.l;
    
    // 磁量子数 m
    const mValue = Array.isArray(params.m) ? params.m.join(', ') : params.m;
    quantumItems[2].querySelector('.quantum-value').textContent = mValue;
    quantumItems[3].querySelector('.quantum-value').textContent = params.s;
}

// 创建文本标签
function createTextLabel(text, x, y, z) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // 绘制背景
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制文本
    context.fillStyle = 'white';
    context.font = 'bold 24px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    sprite.position.set(x, y, z);
    sprite.scale.set(4, 2, 1);
    
    return sprite;
}

// 创建量子数显示容器（如果不存在）
function createQuantumNumbersDiv() {
    const container = document.createElement('div');
    container.id = 'quantumNumbers';
    container.className = 'controls-panel';
    container.style.marginTop = '20px';
    
    const controlsPanel = document.querySelector('.controls-panel');
    if (controlsPanel) {
        controlsPanel.parentNode.insertBefore(container, controlsPanel.nextSibling);
    }
    
    return container;
}

// 窗口大小调整处理
function onWindowResize() {
    const canvas = document.getElementById('atomCanvas') || document.getElementById('moleculeCanvas');
    camera.aspect = canvas.parentElement.clientWidth / canvas.parentElement.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
}

// 动画循环
function animate() {
    animationId = requestAnimationFrame(animate);
    
    if (isRotating) {
        // 缓慢旋转整个场景
        scene.rotation.y += 0.001;
        
        // 电子云动画
        electronClouds.forEach(cloud => {
            if (cloud.geometry.attributes.position) {
                const positions = cloud.geometry.attributes.position.array;
                for (let i = 0; i < positions.length; i += 3) {
                    // 添加轻微的脉动效果
                    const pulse = Math.sin(Date.now() * 0.001 + i * 0.01) * 0.02;
                    positions[i] *= (1 + pulse);
                    positions[i + 1] *= (1 + pulse);
                    positions[i + 2] *= (1 + pulse);
                }
                cloud.geometry.attributes.position.needsUpdate = true;
            }
        });
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// 切换轨道类型
function switchOrbital(type) {
    if (orbitalParams[type]) {
        createOrbital(type);
        createElectronCloud(type === 's' ? '1s' : 
                           type === 'p' ? '2p' : 
                           type === 'd' ? '3d' : '4f');
        
        // 更新按钮状态
        document.querySelectorAll('.orbital-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }
}

// 切换旋转状态
function toggleRotation() {
    isRotating = !isRotating;
    const button = document.getElementById('toggleRotation');
    const icon = button.querySelector('i');
    
    if (isRotating) {
        button.innerHTML = '<i class="fas fa-pause"></i> 暂停旋转';
    } else {
        button.innerHTML = '<i class="fas fa-play"></i> 开始旋转';
    }
}

// 切换标签显示
function toggleLabels() {
    showLabels = !showLabels;
    
    // 更新所有标签的可见性
    scene.children.forEach(child => {
        if (child.type === 'Sprite') {
            child.visible = showLabels;
        }
    });
    
    const button = document.getElementById('toggleLabels');
    button.innerHTML = showLabels ? 
        '<i class="fas fa-eye-slash"></i> 隐藏标签' : 
        '<i class="fas fa-eye"></i> 显示标签';
}

// 切换电子云显示
function toggleElectronClouds() {
    showElectronClouds = !showElectronClouds;
    electronClouds.forEach(cloud => {
        cloud.visible = showElectronClouds;
    });
    
    const button = document.getElementById('toggleClouds');
    if (button) {
        button.innerHTML = showElectronClouds ? 
            '<i class="fas fa-cloud"></i> 隐藏电子云' : 
            '<i class="fas fa-cloud"></i> 显示电子云';
    }
}

// 重置视图
function resetView() {
    controls.reset();
    camera.position.set(15, 10, 15);
    scene.rotation.set(0, 0, 0);
}

// 初始化页面交互
function initUI() {
    // 轨道选择按钮
    document.querySelectorAll('.orbital-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchOrbital(this.dataset.orbital);
        });
    });
    
    // 控制按钮
    document.getElementById('toggleRotation')?.addEventListener('click', toggleRotation);
    document.getElementById('resetView')?.addEventListener('click', resetView);
    document.getElementById('toggleLabels')?.addEventListener('click', toggleLabels);
    document.getElementById('toggleClouds')?.addEventListener('click', toggleElectronClouds);
    
    // 速度控制滑块
    const speedSlider = document.getElementById('rotationSpeed');
    const speedValue = document.getElementById('speedValue');
    
    if (speedSlider && speedValue) {
        speedSlider.addEventListener('input', function() {
            const speed = this.value / 100;
            isRotating = speed > 0;
            
            if (speed === 0) {
                speedValue.textContent = '静止';
            } else if (speed < 0.5) {
                speedValue.textContent = '慢速';
            } else if (speed < 1.5) {
                speedValue.textContent = '正常速度';
            } else {
                speedValue.textContent = '快速';
            }
            
            // 调整旋转速度
            scene.rotation.y += (speed - 1) * 0.001;
        });
    }
    
    // 电子排布规则显示
    const rules = [
        { title: "能量最低原理", desc: "电子优先占据能量最低的轨道" },
        { title: "泡利不相容原理", desc: "同一轨道最多容纳两个自旋相反的电子" },
        { title: "洪特规则", desc: "电子在等价轨道上尽量分占不同轨道且自旋平行" }
    ];
    
    const rulesDiv = document.getElementById('electronRules') || createElectronRulesDiv();
    let html = '<h3><i class="fas fa-list-ol"></i> 电子排布规律</h3><div class="rules-grid">';
    
    rules.forEach(rule => {
        html += `
            <div class="rule-item">
                <div class="rule-title">${rule.title}</div>
                <div class="rule-desc">${rule.desc}</div>
            </div>
        `;
    });
    
    html += '</div>';
    rulesDiv.innerHTML = html;
}

// 创建电子排布规则容器
function createElectronRulesDiv() {
    const container = document.createElement('div');
    container.id = 'electronRules';
    container.className = 'controls-panel';
    container.style.marginTop = '20px';
    
    const quantumNumbersDiv = document.getElementById('quantumNumbers');
    if (quantumNumbersDiv) {
        quantumNumbersDiv.parentNode.insertBefore(container, quantumNumbersDiv.nextSibling);
    }
    
    return container;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 修改HTML标题和内容以匹配第1章
    const titleElement = document.querySelector('.chapter-title');
    if (titleElement) {
        titleElement.innerHTML = '<i class="fas fa-atom"></i> 第1章：原子结构';
    }
    
    const chapterContent = document.querySelector('.chapter-content');
    if (chapterContent) {
        chapterContent.querySelector('.section-title').textContent = '本章内容概述';
        
        const list = chapterContent.querySelector('.concept-list');
        if (list) {
            list.innerHTML = `
                <li>
                    <i class="fas fa-circle concept-icon"></i>
                    <strong>原子轨道</strong>：s、p、d、f轨道的空间形状
                </li>
                <li>
                    <i class="fas fa-cloud concept-icon"></i>
                    <strong>电子云分布</strong>：电子在原子核周围出现的概率密度
                </li>
                <li>
                    <i class="fas fa-hashtag concept-icon"></i>
                    <strong>量子数</strong>：主量子数、角量子数、磁量子数、自旋量子数
                </li>
                <li>
                    <i class="fas fa-list-ol concept-icon"></i>
                    <strong>电子排布规律</strong>：能量最低原理、泡利不相容原理、洪特规则
                </li>
            `;
        }
    }
    
    // 初始化Three.js动画
    init();
    
    // 初始化UI交互
    initUI();
    
    // 添加CSS样式
    const style = document.createElement('style');
    style.textContent = `
        .quantum-grid, .rules-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .quantum-item, .rule-item {
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #3498db;
        }
        
        .quantum-label, .rule-title {
            font-weight: bold;
            color: #3498db;
            font-size: 1.2rem;
            margin-bottom: 5px;
        }
        
        .quantum-value {
            font-size: 1.5rem;
            color: white;
            margin: 10px 0;
        }
        
        .quantum-desc, .rule-desc {
            color: #bdc3c7;
            font-size: 0.9rem;
        }
        
        .orbital-selector {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 20px 0;
        }
        
        .orbital-btn {
            padding: 10px 20px;
            background: #2c3e50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .orbital-btn.active, .orbital-btn:hover {
            background: #3498db;
            transform: translateY(-2px);
        }
    `;
    document.head.appendChild(style);
});

// 清理资源
function dispose() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    if (controls) {
        controls.dispose();
    }
    
    // 清理几何体和材质
    orbitals.forEach(orbital => {
        if (orbital.geometry) orbital.geometry.dispose();
        if (orbital.material) {
            if (Array.isArray(orbital.material)) {
                orbital.material.forEach(m => m.dispose());
            } else {
                orbital.material.dispose();
            }
        }
    });
    
    electronClouds.forEach(cloud => {
        if (cloud.geometry) cloud.geometry.dispose();
        if (cloud.material) cloud.material.dispose();
    });
    
    window.removeEventListener('resize', onWindowResize);
}

// 页面卸载时清理
window.addEventListener('beforeunload', dispose);
