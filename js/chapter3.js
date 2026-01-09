// chapter3.js - 分子对称性3D动画演示 - 修复几何体错误版

console.log("chapter3.js 加载成功");

// 全局变量
let scene, camera, renderer, controls;
let currentMolecule = null;
let moleculeGroup = null;
let autoRotate = true;
let isAnimating = false;

// 分子数据
const molecules = {
    methane: {
        name: "甲烷 (CH₄)",
        atoms: [
            { element: 'C', x: 0, y: 0, z: 0, radius: 0.5, color: 0x888888 },
            { element: 'H', x: 0, y: 0, z: 1.09, radius: 0.3, color: 0xFFFFFF },
            { element: 'H', x: 1.03, y: 0, z: -0.36, radius: 0.3, color: 0xFFFFFF },
            { element: 'H', x: -0.51, y: 0.89, z: -0.36, radius: 0.3, color: 0xFFFFFF },
            { element: 'H', x: -0.51, y: -0.89, z: -0.36, radius: 0.3, color: 0xFFFFFF }
        ],
        bonds: [
            { from: 0, to: 1 },
            { from: 0, to: 2 },
            { from: 0, to: 3 },
            { from: 0, to: 4 }
        ]
    },
    benzene: {
        name: "苯 (C₆H₆)",
        atoms: [
            // 碳原子
            { element: 'C', x: 1.40, y: 0, z: 0, radius: 0.5, color: 0x888888 },
            { element: 'C', x: 0.70, y: 1.21, z: 0, radius: 0.5, color: 0x888888 },
            { element: 'C', x: -0.70, y: 1.21, z: 0, radius: 0.5, color: 0x888888 },
            { element: 'C', x: -1.40, y: 0, z: 0, radius: 0.5, color: 0x888888 },
            { element: 'C', x: -0.70, y: -1.21, z: 0, radius: 0.5, color: 0x888888 },
            { element: 'C', x: 0.70, y: -1.21, z: 0, radius: 0.5, color: 0x888888 },
            // 氢原子
            { element: 'H', x: 2.48, y: 0, z: 0, radius: 0.3, color: 0xFFFFFF },
            { element: 'H', x: 1.24, y: 2.15, z: 0, radius: 0.3, color: 0xFFFFFF },
            { element: 'H', x: -1.24, y: 2.15, z: 0, radius: 0.3, color: 0xFFFFFF },
            { element: 'H', x: -2.48, y: 0, z: 0, radius: 0.3, color: 0xFFFFFF },
            { element: 'H', x: -1.24, y: -2.15, z: 0, radius: 0.3, color: 0xFFFFFF },
            { element: 'H', x: 1.24, y: -2.15, z: 0, radius: 0.3, color: 0xFFFFFF }
        ],
        bonds: [
            // C-C 键
            { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
            { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 0 },
            // C-H 键
            { from: 0, to: 6 }, { from: 1, to: 7 }, { from: 2, to: 8 },
            { from: 3, to: 9 }, { from: 4, to: 10 }, { from: 5, to: 11 }
        ]
    },
    water: {
        name: "水 (H₂O)",
        atoms: [
            { element: 'O', x: 0, y: 0, z: 0, radius: 0.55, color: 0xFF4444 },
            { element: 'H', x: 0.76, y: 0.59, z: 0, radius: 0.3, color: 0xFFFFFF },
            { element: 'H', x: -0.76, y: 0.59, z: 0, radius: 0.3, color: 0xFFFFFF }
        ],
        bonds: [
            { from: 0, to: 1 },
            { from: 0, to: 2 }
        ]
    }
};

// 初始化函数
function init() {
    console.log("开始初始化3D场景...");
    
    try {
        // 检查必需库
        if (typeof THREE === 'undefined') {
            throw new Error("Three.js库未加载");
        }
        
        // 创建场景
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8f9fa);
        
        // 获取容器
        const container = document.getElementById('moleculeCanvas');
        if (!container) {
            throw new Error("找不到3D画布容器");
        }
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // 创建相机
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(5, 3, 5);
        camera.lookAt(0, 0, 0);
        
        // 创建渲染器
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);
        
        // 添加轨道控制
        try {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
        } catch (e) {
            console.warn("OrbitControls初始化失败:", e);
        }
        
        // 添加光源
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        scene.add(directionalLight);
        
        // 添加网格地面
        const gridHelper = new THREE.GridHelper(10, 10, 0xcccccc, 0xcccccc);
        gridHelper.position.y = -2;
        scene.add(gridHelper);
        
        // 加载默认分子
        loadMolecule('methane');
        
        // 窗口大小调整
        window.addEventListener('resize', onWindowResize);
        
        // 开始动画循环
        animate();
        
        console.log("3D场景初始化成功");
        showMessage("3D场景加载成功！", 'success');
        
    } catch (error) {
        console.error("初始化失败:", error);
        showError("3D场景初始化失败: " + error.message);
    }
}

// 加载分子模型 - 简化版，确保原子正确插在键中
function loadMolecule(moleculeKey) {
    console.log("加载分子:", moleculeKey);
    
    if (!molecules[moleculeKey]) {
        console.error("未知的分子类型:", moleculeKey);
        return;
    }
    
    // 移除之前的分子
    if (moleculeGroup) {
        scene.remove(moleculeGroup);
        moleculeGroup = null;
    }
    
    currentMolecule = molecules[moleculeKey];
    moleculeGroup = new THREE.Group();
    
    const atoms = currentMolecule.atoms;
    const bonds = currentMolecule.bonds;
    
    // 先创建所有原子
    for (let i = 0; i < atoms.length; i++) {
        const atom = atoms[i];
        
        // 创建原子球体
        const geometry = new THREE.SphereGeometry(atom.radius, 16, 16);
        const material = new THREE.MeshPhongMaterial({ 
            color: atom.color,
            shininess: 30
        });
        
        const atomMesh = new THREE.Mesh(geometry, material);
        atomMesh.position.set(atom.x, atom.y, atom.z);
        atomMesh.castShadow = true;
        atomMesh.receiveShadow = true;
        
        moleculeGroup.add(atomMesh);
    }
    
    // 创建化学键（使用简单方法，确保正确连接）
    for (let i = 0; i < bonds.length; i++) {
        const bond = bonds[i];
        const atomA = atoms[bond.from];
        const atomB = atoms[bond.to];
        
        // 计算两个原子间的距离和方向
        const start = new THREE.Vector3(atomA.x, atomA.y, atomA.z);
        const end = new THREE.Vector3(atomB.x, atomB.y, atomB.z);
        const distance = start.distanceTo(end);
        
        // 创建化学键（圆柱体）
        // 化学键半径比原子半径小，这样看起来原子在键的末端
        const bondRadius = 0.1;
        const geometry = new THREE.CylinderGeometry(bondRadius, bondRadius, distance, 8);
        const material = new THREE.MeshPhongMaterial({ color: 0xCCCCCC });
        const bondMesh = new THREE.Mesh(geometry, material);
        
        // 将化学键放在两个原子的中点
        const midpoint = new THREE.Vector3();
        midpoint.addVectors(start, end).multiplyScalar(0.5);
        bondMesh.position.copy(midpoint);
        
        // 旋转化学键使其指向正确的方向
        // 默认圆柱体是沿着Y轴的，我们需要旋转它指向end-start方向
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        
        // 计算旋转轴和角度
        const axis = new THREE.Vector3(0, 1, 0); // 圆柱体初始方向是Y轴
        const rotationAxis = new THREE.Vector3().crossVectors(axis, direction).normalize();
        const angle = Math.acos(axis.dot(direction));
        
        // 设置旋转
        bondMesh.quaternion.setFromAxisAngle(rotationAxis, angle);
        
        bondMesh.castShadow = true;
        bondMesh.receiveShadow = true;
        
        moleculeGroup.add(bondMesh);
    }
    
    // 将分子组添加到场景
    scene.add(moleculeGroup);
    
    // 显示成功消息
    showMessage(`已加载: ${currentMolecule.name}`, 'success');
}

// 简单动画函数
function performIdentityOperation() {
    if (isAnimating) return;
    isAnimating = true;
    
    showMessage("恒等操作 (E): 分子保持不变");
    
    if (moleculeGroup) {
        // 简单缩放动画
        const scaleUp = () => {
            moleculeGroup.scale.set(1.1, 1.1, 1.1);
            setTimeout(() => {
                moleculeGroup.scale.set(1, 1, 1);
                isAnimating = false;
            }, 300);
        };
        
        scaleUp();
    } else {
        isAnimating = false;
    }
}

function performRotationOperation(order) {
    if (isAnimating) return;
    isAnimating = true;
    
    const angles = {
        'C2': Math.PI,
        'C3': (2 * Math.PI) / 3,
        'C4': Math.PI / 2,
        'C6': Math.PI / 3
    };
    
    const names = {
        'C2': "C₂ (180°旋转)",
        'C3': "C₃ (120°旋转)", 
        'C4': "C₄ (90°旋转)",
        'C6': "C₆ (60°旋转)"
    };
    
    const angle = angles[order];
    const name = names[order] || "旋转";
    
    showMessage(`${name}: 绕轴旋转`);
    
    if (moleculeGroup) {
        const targetRotation = moleculeGroup.rotation.y + angle;
        
        // 简单动画：直接设置旋转
        moleculeGroup.rotation.y = targetRotation;
        
        setTimeout(() => {
            moleculeGroup.rotation.y = targetRotation - angle;
            isAnimating = false;
        }, 1500);
    } else {
        isAnimating = false;
    }
}

function performReflectionOperation(type) {
    if (isAnimating) return;
    isAnimating = true;
    
    const names = {
        'horizontal': "水平反射 σₕ",
        'vertical': "垂直反射 σᵥ",
        'dihedral': "对角反射 σₔ"
    };
    
    const name = names[type] || "反射";
    showMessage(`${name}: 平面镜像操作`);
    
    // 创建对称平面
    const planeGeometry = new THREE.PlaneGeometry(4, 4);
    const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x3498db,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
    });
    
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    
    if (type === 'horizontal') {
        plane.rotation.x = Math.PI / 2;
    } else if (type === 'vertical') {
        plane.rotation.y = Math.PI / 2;
    } else {
        plane.rotation.x = Math.PI / 4;
        plane.rotation.y = Math.PI / 4;
    }
    
    scene.add(plane);
    
    // 3秒后移除平面
    setTimeout(() => {
        scene.remove(plane);
        isAnimating = false;
    }, 3000);
}

// 工具函数
function resetView() {
    if (isAnimating) return;
    
    if (camera) {
        camera.position.set(5, 3, 5);
        camera.lookAt(0, 0, 0);
    }
    
    if (controls) {
        controls.reset();
    }
    
    if (moleculeGroup) {
        moleculeGroup.rotation.set(0, 0, 0);
        moleculeGroup.scale.set(1, 1, 1);
    }
    
    showMessage("视图已重置");
}

function toggleAutoRotate() {
    autoRotate = !autoRotate;
    const btn = document.getElementById('autoRotateBtn');
    if (btn) {
        btn.classList.toggle('active', autoRotate);
        showMessage(autoRotate ? "自动旋转开启" : "自动旋转关闭");
    }
}

function showMessage(message, type = 'info') {
    console.log("消息:", message);
    
    // 创建消息元素
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#e74c3c' : '#2c3e50'};
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    // 添加动画样式
    if (!document.getElementById('messageStyles')) {
        const style = document.createElement('style');
        style.id = 'messageStyles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    msgDiv.textContent = message;
    document.body.appendChild(msgDiv);
    
    // 3秒后移除消息
    setTimeout(() => {
        msgDiv.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (msgDiv.parentNode) {
                msgDiv.parentNode.removeChild(msgDiv);
            }
        }, 300);
    }, 3000);
}

function showError(message) {
    console.error("错误:", message);
    
    // 简单错误提示
    const container = document.getElementById('moleculeCanvas');
    if (container) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #e74c3c;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem;"></i>
                <h3 style="margin: 20px 0 10px;">3D初始化错误</h3>
                <p style="color: #666; margin-bottom: 20px;">${message}</p>
                <button onclick="location.reload()" style="
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                ">
                    <i class="fas fa-sync-alt"></i> 刷新页面
                </button>
            </div>
        `;
    }
}

function onWindowResize() {
    const container = document.getElementById('moleculeCanvas');
    if (!container || !camera || !renderer) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function animate() {
    requestAnimationFrame(animate);
    
    // 自动旋转
    if (autoRotate && moleculeGroup && !isAnimating) {
        moleculeGroup.rotation.y += 0.002;
    }
    
    // 更新轨道控制
    if (controls) {
        controls.update();
    }
    
    // 渲染场景
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// 初始化事件监听器
function setupEventListeners() {
    console.log("设置事件监听器");
    
    // 重置视图
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetView);
    }
    
    // 自动旋转
    const autoRotateBtn = document.getElementById('autoRotateBtn');
    if (autoRotateBtn) {
        autoRotateBtn.addEventListener('click', toggleAutoRotate);
        if (autoRotate) autoRotateBtn.classList.add('active');
    }
    
    // 恒等操作
    const identityBtn = document.getElementById('identityBtn');
    if (identityBtn) identityBtn.addEventListener('click', performIdentityOperation);
    
    // 反演操作
    const inversionBtn = document.getElementById('inversionBtn');
    if (inversionBtn) inversionBtn.addEventListener('click', function() {
        showMessage("反演操作 (i): 关于中心点对称");
    });
    
    // 旋转操作
    document.querySelectorAll('[data-rotation]').forEach(btn => {
        btn.addEventListener('click', function() {
            performRotationOperation(this.getAttribute('data-rotation'));
        });
    });
    
    // 反射操作
    document.querySelectorAll('[data-reflection]').forEach(btn => {
        btn.addEventListener('click', function() {
            performReflectionOperation(this.getAttribute('data-reflection'));
        });
    });
    
    // 分子选择
    document.querySelectorAll('.molecule-option').forEach(option => {
        option.addEventListener('click', function() {
            if (isAnimating) return;
            
            // 更新活动状态
            document.querySelectorAll('.molecule-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
            
            // 加载分子
            const moleculeKey = this.getAttribute('data-molecule');
            loadMolecule(moleculeKey);
        });
    });
}

// 主初始化函数
function main() {
    console.log("启动分子对称性3D演示");
    
    // 等待DOM完全加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();
        });
    } else {
        initializeApp();
    }
}

function initializeApp() {
    console.log("初始化应用程序");
    
    // 设置事件监听器
    setupEventListeners();
    
    // 延迟初始化3D场景
    setTimeout(() => {
        try {
            init();
        } catch (error) {
            console.error("应用程序初始化失败:", error);
            showError("应用程序初始化失败: " + error.message);
        }
    }, 500);
}

// 启动应用程序
main();
