// chapter3.js - 分子对称性3D动画演示

// 全局变量
let scene, camera, renderer, controls;
let currentMolecule = null;
let moleculeGroup = null;
let axesHelper = null;
let symmetryPlane = null;
let autoRotate = false;
let showLabels = true;

// 分子数据定义
const molecules = {
    methane: {
        name: "甲烷 (CH₄)",
        atoms: [
            { element: 'C', x: 0, y: 0, z: 0, color: 0x888888 },
            { element: 'H', x: 1, y: 1, z: 1, color: 0xFFFFFF },
            { element: 'H', x: -1, y: -1, z: 1, color: 0xFFFFFF },
            { element: 'H', x: -1, y: 1, z: -1, color: 0xFFFFFF },
            { element: 'H', x: 1, y: -1, z: -1, color: 0xFFFFFF }
        ],
        bonds: [
            { from: 0, to: 1 },
            { from: 0, to: 2 },
            { from: 0, to: 3 },
            { from: 0, to: 4 }
        ],
        symmetry: {
            rotationAxes: [
                { axis: [1, 1, 1], order: 3 },
                { axis: [1, -1, -1], order: 3 },
                { axis: [-1, 1, -1], order: 3 },
                { axis: [-1, -1, 1], order: 3 }
            ],
            reflectionPlanes: [
                { normal: [1, 0, 0] },
                { normal: [0, 1, 0] },
                { normal: [0, 0, 1] }
            ]
        }
    },
    benzene: {
        name: "苯 (C₆H₆)",
        atoms: [
            { element: 'C', x: 1, y: 0, z: 0, color: 0x888888 },
            { element: 'C', x: 0.5, y: Math.sqrt(3)/2, z: 0, color: 0x888888 },
            { element: 'C', x: -0.5, y: Math.sqrt(3)/2, z: 0, color: 0x888888 },
            { element: 'C', x: -1, y: 0, z: 0, color: 0x888888 },
            { element: 'C', x: -0.5, y: -Math.sqrt(3)/2, z: 0, color: 0x888888 },
            { element: 'C', x: 0.5, y: -Math.sqrt(3)/2, z: 0, color: 0x888888 },
            { element: 'H', x: 2, y: 0, z: 0, color: 0xFFFFFF },
            { element: 'H', x: 1, y: Math.sqrt(3), z: 0, color: 0xFFFFFF },
            { element: 'H', x: -1, y: Math.sqrt(3), z: 0, color: 0xFFFFFF },
            { element: 'H', x: -2, y: 0, z: 0, color: 0xFFFFFF },
            { element: 'H', x: -1, y: -Math.sqrt(3), z: 0, color: 0xFFFFFF },
            { element: 'H', x: 1, y: -Math.sqrt(3), z: 0, color: 0xFFFFFF }
        ],
        bonds: [
            { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
            { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 0 },
            { from: 0, to: 6 }, { from: 1, to: 7 }, { from: 2, to: 8 },
            { from: 3, to: 9 }, { from: 4, to: 10 }, { from: 5, to: 11 }
        ],
        symmetry: {
            rotationAxes: [
                { axis: [0, 0, 1], order: 6 },
                { axis: [1, 0, 0], order: 2 },
                { axis: [0, 1, 0], order: 2 }
            ],
            reflectionPlanes: [
                { normal: [0, 0, 1] },
                { normal: [1, 0, 0] },
                { normal: [0, 1, 0] }
            ]
        }
    },
    water: {
        name: "水 (H₂O)",
        atoms: [
            { element: 'O', x: 0, y: 0, z: 0, color: 0xFF4444 },
            { element: 'H', x: 0.76, y: 0.59, z: 0, color: 0xFFFFFF },
            { element: 'H', x: -0.76, y: 0.59, z: 0, color: 0xFFFFFF }
        ],
        bonds: [
            { from: 0, to: 1 },
            { from: 0, to: 2 }
        ],
        symmetry: {
            rotationAxes: [
                { axis: [0, 1, 0], order: 2 }
            ],
            reflectionPlanes: [
                { normal: [1, 0, 0] }
            ]
        }
    },
    ammonia: {
        name: "氨 (NH₃)",
        atoms: [
            { element: 'N', x: 0, y: 0.5, z: 0, color: 0x3050F8 },
            { element: 'H', x: 0, y: -0.5, z: 0.8, color: 0xFFFFFF },
            { element: 'H', x: 0.69, y: -0.5, z: -0.4, color: 0xFFFFFF },
            { element: 'H', x: -0.69, y: -0.5, z: -0.4, color: 0xFFFFFF }
        ],
        bonds: [
            { from: 0, to: 1 },
            { from: 0, to: 2 },
            { from: 0, to: 3 }
        ],
        symmetry: {
            rotationAxes: [
                { axis: [0, 1, 0], order: 3 }
            ],
            reflectionPlanes: [
                { normal: [1, 0, 0] }
            ]
        }
    }
};

// 原子半径和颜色映射
const atomProperties = {
    'H': { radius: 0.3, color: 0xFFFFFF },
    'C': { radius: 0.5, color: 0x888888 },
    'O': { radius: 0.55, color: 0xFF4444 },
    'N': { radius: 0.56, color: 0x3050F8 }
};

// 初始化Three.js场景
function init() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    
    // 创建相机
    camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.set(5, 5, 5);
    
    // 创建渲染器
    const canvasContainer = document.getElementById('moleculeCanvas');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvasContainer.appendChild(renderer.domElement);
    
    // 添加轨道控制
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 2;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI;
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // 添加坐标轴辅助
    axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);
    
    // 初始加载甲烷分子
    loadMolecule('methane');
    
    // 窗口大小调整事件
    window.addEventListener('resize', onWindowResize);
    
    // 开始动画循环
    animate();
}

// 加载分子模型
function loadMolecule(moleculeKey) {
    if (moleculeGroup) {
        scene.remove(moleculeGroup);
    }
    
    currentMolecule = molecules[moleculeKey];
    moleculeGroup = new THREE.Group();
    moleculeGroup.name = moleculeKey;
    
    // 创建原子
    const atoms = currentMolecule.atoms;
    for (let i = 0; i < atoms.length; i++) {
        const atom = atoms[i];
        const properties = atomProperties[atom.element] || { radius: 0.4, color: 0x888888 };
        
        // 创建原子球体
        const geometry = new THREE.SphereGeometry(properties.radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: atom.color || properties.color,
            shininess: 30
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(atom.x, atom.y, atom.z);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        sphere.userData = { type: 'atom', element: atom.element, index: i };
        
        // 添加原子标签
        if (showLabels) {
            const label = createAtomLabel(atom.element, i);
            label.position.set(atom.x, atom.y + properties.radius + 0.2, atom.z);
            sphere.add(label);
        }
        
        moleculeGroup.add(sphere);
    }
    
    // 创建化学键
    const bonds = currentMolecule.bonds;
    for (let i = 0; i < bonds.length; i++) {
        const bond = bonds[i];
        const fromAtom = atoms[bond.from];
        const toAtom = atoms[bond.to];
        
        const from = new THREE.Vector3(fromAtom.x, fromAtom.y, fromAtom.z);
        const to = new THREE.Vector3(toAtom.x, toAtom.y, toAtom.z);
        const bondGeometry = createBondGeometry(from, to);
        
        const bondMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xCCCCCC,
            shininess: 10
        });
        const bondMesh = new THREE.Mesh(bondGeometry, bondMaterial);
        bondMesh.castShadow = true;
        bondMesh.receiveShadow = true;
        
        moleculeGroup.add(bondMesh);
    }
    
    scene.add(moleculeGroup);
    
    // 更新UI中的分子名称
    updateMoleculeInfo();
}

// 创建化学键几何体
function createBondGeometry(from, to) {
    const direction = new THREE.Vector3().subVectors(to, from);
    const length = direction.length();
    
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, length, 8);
    geometry.rotateZ(Math.PI / 2);
    
    const midpoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    geometry.translate(midpoint.x, midpoint.y, midpoint.z);
    
    return geometry;
}

// 创建原子标签
function createAtomLabel(element, index) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 32;
    
    // 绘制标签背景
    context.fillStyle = 'rgba(255, 255, 255, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制文本
    context.fillStyle = '#2c3e50';
    context.font = 'bold 20px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(element, canvas.width / 2, canvas.height / 2);
    
    // 创建纹理
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true 
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1, 0.5, 1);
    
    return sprite;
}

// 更新分子信息显示
function updateMoleculeInfo() {
    // 可以在这里添加更新UI显示分子信息的代码
    console.log(`当前分子: ${currentMolecule.name}`);
}

// 执行恒等操作
function performIdentityOperation() {
    // 恒等操作不做任何改变，只显示提示信息
    showOperationInfo("恒等操作 (E): 分子保持不变");
    
    // 添加一个简单的视觉反馈
    if (moleculeGroup) {
        const originalScale = moleculeGroup.scale.x;
        moleculeGroup.scale.set(originalScale * 1.1, originalScale * 1.1, originalScale * 1.1);
        
        setTimeout(() => {
            moleculeGroup.scale.set(originalScale, originalScale, originalScale);
        }, 300);
    }
}

// 执行旋转操作
function performRotationOperation(order) {
    let angle, axis, operationName;
    
    switch(order) {
        case 'C2':
            angle = Math.PI;
            axis = new THREE.Vector3(0, 1, 0);
            operationName = "C₂旋转 (180°)";
            break;
        case 'C3':
            angle = (2 * Math.PI) / 3;
            axis = new THREE.Vector3(0, 1, 0);
            operationName = "C₃旋转 (120°)";
            break;
        case 'C4':
            angle = Math.PI / 2;
            axis = new THREE.Vector3(0, 1, 0);
            operationName = "C₄旋转 (90°)";
            break;
        case 'C6':
            angle = Math.PI / 3;
            axis = new THREE.Vector3(0, 1, 0);
            operationName = "C₆旋转 (60°)";
            break;
        default:
            return;
    }
    
    showOperationInfo(`${operationName}: 分子绕轴旋转指定角度后与自身重合`);
    
    // 创建旋转动画
    if (moleculeGroup) {
        const startQuaternion = moleculeGroup.quaternion.clone();
        const endQuaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
        
        let progress = 0;
        const duration = 2000; // 2秒
        const startTime = Date.now();
        
        function animateRotation() {
            const currentTime = Date.now();
            progress = (currentTime - startTime) / duration;
            
            if (progress < 1) {
                THREE.Quaternion.slerp(startQuaternion, endQuaternion, moleculeGroup.quaternion, progress);
                requestAnimationFrame(animateRotation);
            } else {
                moleculeGroup.quaternion.copy(endQuaternion);
                // 动画完成后恢复原始方向
                setTimeout(() => {
                    const resetStart = moleculeGroup.quaternion.clone();
                    let resetProgress = 0;
                    const resetStartTime = Date.now();
                    
                    function resetRotation() {
                        const currentResetTime = Date.now();
                        resetProgress = (currentResetTime - resetStartTime) / duration;
                        
                        if (resetProgress < 1) {
                            THREE.Quaternion.slerp(resetStart, startQuaternion, moleculeGroup.quaternion, resetProgress);
                            requestAnimationFrame(resetRotation);
                        } else {
                            moleculeGroup.quaternion.copy(startQuaternion);
                        }
                    }
                    
                    resetRotation();
                }, 1000);
            }
        }
        
        animateRotation();
    }
}

// 执行反射操作
function performReflectionOperation(type) {
    let normal, planeColor, operationName;
    
    switch(type) {
        case 'horizontal':
            normal = new THREE.Vector3(0, 1, 0);
            planeColor = 0x3498db;
            operationName = "水平反射 σₕ";
            break;
        case 'vertical':
            normal = new THREE.Vector3(1, 0, 0);
            planeColor = 0x2ecc71;
            operationName = "垂直反射 σᵥ";
            break;
        case 'dihedral':
            normal = new THREE.Vector3(1, 1, 0).normalize();
            planeColor = 0xe74c3c;
            operationName = "对角反射 σₔ";
            break;
        default:
            return;
    }
    
    showOperationInfo(`${operationName}: 分子相对于平面进行镜像反射`);
    
    // 显示对称平面
    showSymmetryPlane(normal, planeColor);
    
    // 创建分子镜像
    if (moleculeGroup) {
        const mirrorGroup = moleculeGroup.clone();
        mirrorGroup.scale.set(1, 1, -1); // 创建镜像
        mirrorGroup.material = mirrorGroup.material.clone();
        mirrorGroup.material.transparent = true;
        mirrorGroup.material.opacity = 0.5;
        scene.add(mirrorGroup);
        
        // 3秒后移除镜像
        setTimeout(() => {
            scene.remove(mirrorGroup);
        }, 3000);
    }
}

// 执行反演操作
function performInversionOperation() {
    showOperationInfo("反演操作 (i): 每个原子通过中心映射到对面位置");
    
    if (moleculeGroup) {
        const originalPositions = [];
        moleculeGroup.children.forEach(child => {
            if (child.userData.type === 'atom') {
                originalPositions.push(child.position.clone());
            }
        });
        
        // 动画：原子移动到反演位置
        let progress = 0;
        const duration = 1500;
        const startTime = Date.now();
        
        function animateInversion() {
            const currentTime = Date.now();
            progress = (currentTime - startTime) / duration;
            
            if (progress < 0.5) {
                // 第一阶段：原子向中心移动
                moleculeGroup.children.forEach((child, index) => {
                    if (child.userData.type === 'atom') {
                        const originalPos = originalPositions[index];
                        child.position.lerp(new THREE.Vector3(0, 0, 0), progress * 2);
                    }
                });
                requestAnimationFrame(animateInversion);
            } else if (progress < 1) {
                // 第二阶段：原子从中心移动到反演位置
                moleculeGroup.children.forEach((child, index) => {
                    if (child.userData.type === 'atom') {
                        const originalPos = originalPositions[index];
                        const invertedPos = originalPos.clone().multiplyScalar(-1);
                        child.position.lerp(invertedPos, (progress - 0.5) * 2);
                    }
                });
                requestAnimationFrame(animateInversion);
            } else {
                // 动画完成后恢复原始位置
                setTimeout(() => {
                    let resetProgress = 0;
                    const resetStartTime = Date.now();
                    
                    function resetInversion() {
                        const currentResetTime = Date.now();
                        resetProgress = (currentResetTime - resetStartTime) / duration;
                        
                        if (resetProgress < 1) {
                            moleculeGroup.children.forEach((child, index) => {
                                if (child.userData.type === 'atom') {
                                    const originalPos = originalPositions[index];
                                    const currentPos = child.position.clone();
                                    child.position.lerp(originalPos, resetProgress);
                                }
                            });
                            requestAnimationFrame(resetInversion);
                        }
                    }
                    
                    resetInversion();
                }, 1000);
            }
        }
        
        animateInversion();
    }
}

// 执行旋转反射操作
function performRotationReflectionOperation(type) {
    let rotationAngle, operationName;
    
    switch(type) {
        case 'S4':
            rotationAngle = Math.PI / 2;
            operationName = "S₄旋转反射 (90°旋转 + 垂直反射)";
            break;
        case 'S6':
            rotationAngle = Math.PI / 3;
            operationName = "S₆旋转反射 (60°旋转 + 垂直反射)";
            break;
        default:
            return;
    }
    
    showOperationInfo(`${operationName}: 先旋转后反射的组合操作`);
    
    // 先执行旋转
    performRotationOperation(type === 'S4' ? 'C4' : 'C6');
    
    // 延迟执行反射
    setTimeout(() => {
        performReflectionOperation('vertical');
    }, 1000);
}

// 显示对称平面
function showSymmetryPlane(normal, color) {
    // 移除之前的对称平面
    if (symmetryPlane) {
        scene.remove(symmetryPlane);
    }
    
    // 创建平面几何体
    const planeGeometry = new THREE.PlaneGeometry(5, 5);
    const planeMaterial = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
    });
    
    symmetryPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    
    // 将平面对齐到法线方向
    symmetryPlane.lookAt(normal);
    
    scene.add(symmetryPlane);
    
    // 5秒后移除平面
    setTimeout(() => {
        if (symmetryPlane) {
            scene.remove(symmetryPlane);
            symmetryPlane = null;
        }
    }, 5000);
}

// 显示操作信息
function showOperationInfo(message) {
    // 在实际应用中，这里可以更新UI显示操作信息
    console.log(`操作: ${message}`);
    
    // 创建临时提示
    const infoDiv = document.createElement('div');
    infoDiv.style.position = 'fixed';
    infoDiv.style.top = '100px';
    infoDiv.style.right = '20px';
    infoDiv.style.backgroundColor = 'rgba(44, 62, 80, 0.9)';
    infoDiv.style.color = 'white';
    infoDiv.style.padding = '10px 15px';
    infoDiv.style.borderRadius = '5px';
    infoDiv.style.zIndex = '1000';
    infoDiv.style.fontSize = '14px';
    infoDiv.style.maxWidth = '300px';
    infoDiv.textContent = message;
    
    document.body.appendChild(infoDiv);
    
    // 3秒后移除提示
    setTimeout(() => {
        if (infoDiv.parentNode) {
            infoDiv.parentNode.removeChild(infoDiv);
        }
    }, 3000);
}

// 重置视图
function resetView() {
    camera.position.set(5, 5, 5);
    controls.reset();
    
    if (moleculeGroup) {
        moleculeGroup.rotation.set(0, 0, 0);
        moleculeGroup.scale.set(1, 1, 1);
    }
    
    // 移除对称平面
    if (symmetryPlane) {
        scene.remove(symmetryPlane);
        symmetryPlane = null;
    }
    
    showOperationInfo("视图已重置");
}

// 切换自动旋转
function toggleAutoRotate() {
    autoRotate = !autoRotate;
    const autoRotateBtn = document.getElementById('autoRotateBtn');
    
    if (autoRotate) {
        autoRotateBtn.classList.add('active');
        showOperationInfo("自动旋转已开启");
    } else {
        autoRotateBtn.classList.remove('active');
        showOperationInfo("自动旋转已关闭");
    }
}

// 切换标签显示
function toggleLabels() {
    showLabels = !showLabels;
    const toggleLabelsBtn = document.getElementById('toggleLabelsBtn');
    
    // 重新加载当前分子以更新标签
    if (moleculeGroup) {
        loadMolecule(moleculeGroup.name);
    }
    
    if (showLabels) {
        toggleLabelsBtn.classList.add('active');
        showOperationInfo("原子标签已显示");
    } else {
        toggleLabelsBtn.classList.remove('active');
        showOperationInfo("原子标签已隐藏");
    }
}

// 窗口大小调整处理
function onWindowResize() {
    const canvasContainer = document.getElementById('moleculeCanvas');
    camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    // 自动旋转
    if (autoRotate && moleculeGroup) {
        moleculeGroup.rotation.y += 0.005;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// 事件监听器设置
function setupEventListeners() {
    // 重置视图按钮
    document.getElementById('resetBtn').addEventListener('click', resetView);
    
    // 自动旋转按钮
    document.getElementById('autoRotateBtn').addEventListener('click', toggleAutoRotate);
    
    // 切换标签按钮
    document.getElementById('toggleLabelsBtn').addEventListener('click', toggleLabels);
    
    // 恒等操作按钮
    document.getElementById('identityBtn').addEventListener('click', performIdentityOperation);
    
    // 反演操作按钮
    document.getElementById('inversionBtn').addEventListener('click', performInversionOperation);
    
    // 旋转操作按钮
    document.querySelectorAll('[data-rotation]').forEach(btn => {
        btn.addEventListener('click', function() {
            performRotationOperation(this.getAttribute('data-rotation'));
        });
    });
    
    // 反射操作按钮
    document.querySelectorAll('[data-reflection]').forEach(btn => {
        btn.addEventListener('click', function() {
            performReflectionOperation(this.getAttribute('data-reflection'));
        });
    });
    
    // 旋转反射操作按钮
    document.querySelectorAll('[data-rotation-reflection]').forEach(btn => {
        btn.addEventListener('click', function() {
            performRotationReflectionOperation(this.getAttribute('data-rotation-reflection'));
        });
    });
    
    // 分子选择按钮
    document.querySelectorAll('.molecule-option').forEach(option => {
        option.addEventListener('click', function() {
            // 更新活动状态
            document.querySelectorAll('.molecule-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
            
            // 加载选中的分子
            const moleculeKey = this.getAttribute('data-molecule');
            loadMolecule(moleculeKey);
            
            showOperationInfo(`已切换到${molecules[moleculeKey].name}`);
        });
    });
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    init();
    setupEventListeners();
});
