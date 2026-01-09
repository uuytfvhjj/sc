// chapter3.js - 分子对称性3D动画演示（重构版）
console.log("chapter3.js 加载成功");

// 全局变量
let scene, camera, renderer, controls;
let currentMolecule = null;
let moleculeGroup = null;
let autoRotate = true;
let isAnimating = false;

// 分子数据 - 使用准确的分子坐标
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
        ],
        symmetry: "四面体对称 (Td)"
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
        ],
        symmetry: "六重旋转对称 (D6h)"
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
        ],
        symmetry: "C₂v对称"
    },
    ammonia: {
        name: "氨 (NH₃)",
        atoms: [
            { element: 'N', x: 0, y: 0.3, z: 0, radius: 0.56, color: 0x3050F8 },
            { element: 'H', x: 0, y: -0.3, z: 1.01, radius: 0.3, color: 0xFFFFFF },
            { element: 'H', x: 0.94, y: -0.3, z: -0.33, radius: 0.3, color: 0xFFFFFF },
            { element: 'H', x: -0.47, y: -0.3, z: -0.33, radius: 0.3, color: 0xFFFFFF }
        ],
        bonds: [
            { from: 0, to: 1 },
            { from: 0, to: 2 },
            { from: 0, to: 3 }
        ],
        symmetry: "C₃v对称"
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
        
        if (typeof TWEEN === 'undefined') {
            console.warn("TWEEN.js未加载，动画效果可能受限");
        }
        
        // 创建场景
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8f9fa);
        
        // 获取容器并设置相机
        const container = document.getElementById('moleculeCanvas');
        if (!container) {
            throw new Error("找不到3D画布容器");
        }
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(5, 3, 5);
        camera.lookAt(0, 0, 0);
        
        // 创建渲染器
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);
        
        // 添加轨道控制
        try {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 2;
            controls.maxDistance = 20;
        } catch (e) {
            console.warn("OrbitControls初始化失败:", e);
        }
        
        // 添加光源
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        
        // 添加坐标轴辅助（可选）
        // const axesHelper = new THREE.AxesHelper(2);
        // scene.add(axesHelper);
        
        // 创建网格地面
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
        return true;
        
    } catch (error) {
        console.error("初始化失败:", error);
        showError("3D场景初始化失败: " + error.message);
        return false;
    }
}

// 加载分子模型
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
    
    // 1. 先创建所有原子
    const atomObjects = [];
    
    for (let i = 0; i < atoms.length; i++) {
        const atom = atoms[i];
        
        // 创建原子球体
        const geometry = new THREE.SphereGeometry(atom.radius, 24, 24);
        const material = new THREE.MeshPhongMaterial({ 
            color: atom.color,
            shininess: 30,
            specular: 0x222222
        });
        
        const atomMesh = new THREE.Mesh(geometry, material);
        atomMesh.position.set(atom.x, atom.y, atom.z);
        atomMesh.castShadow = true;
        atomMesh.receiveShadow = true;
        
        // 添加原子标签
        const label = createAtomLabel(atom.element);
        label.position.set(0, atom.radius + 0.15, 0);
        atomMesh.add(label);
        
        atomObjects.push(atomMesh);
        moleculeGroup.add(atomMesh);
    }
    
    // 2. 创建化学键（正确连接到原子）
    for (let i = 0; i < bonds.length; i++) {
        const bond = bonds[i];
        const atomA = atoms[bond.from];
        const atomB = atoms[bond.to];
        
        // 创建键的圆柱体
        const bondMesh = createBond(atomA, atomB);
        moleculeGroup.add(bondMesh);
    }
    
    // 将分子组添加到场景
    scene.add(moleculeGroup);
    
    // 更新UI信息
    updateMoleculeInfo();
    showMessage(`已加载: ${currentMolecule.name}`, 'success');
}

// 创建化学键函数 - 确保正确连接原子
function createBond(atomA, atomB) {
    // 计算两个原子间的向量
    const start = new THREE.Vector3(atomA.x, atomA.y, atomA.z);
    const end = new THREE.Vector3(atomB.x, atomB.y, atomB.z);
    
    // 计算距离和方向
    const distance = start.distanceTo(end);
    const direction = new THREE.Vector3().subVectors(end, start).normalize();
    
    // 创建圆柱体（化学键）
    const radius = 0.08; // 键的半径
    const geometry = new THREE.CylinderGeometry(radius, radius, distance, 8);
    
    // 旋转圆柱体到正确方向
    const axis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction);
    geometry.applyQuaternion(quaternion);
    
    // 移动到两个原子的中点
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    geometry.translate(midpoint.x, midpoint.y, midpoint.z);
    
    // 创建材质
    const material = new THREE.MeshPhongMaterial({ 
        color: 0xCCCCCC,
        shininess: 20
    });
    
    const bondMesh = new THREE.Mesh(geometry, material);
    bondMesh.castShadow = true;
    bondMesh.receiveShadow = true;
    
    return bondMesh;
}

// 创建原子标签
function createAtomLabel(element) {
    // 创建一个画布来绘制标签
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 32;
    
    // 绘制背景
    context.fillStyle = 'rgba(44, 62, 80, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制文本
    context.fillStyle = '#FFFFFF';
    context.font = 'bold 16px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(element, canvas.width / 2, canvas.height / 2);
    
    // 创建纹理和精灵
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.8, 0.4, 1);
    
    return sprite;
}

// 对称操作函数
function performIdentityOperation() {
    if (isAnimating) return;
    isAnimating = true;
    
    showMessage("恒等操作 (E): 分子保持不变");
    
    if (moleculeGroup && TWEEN) {
        const scale = { x: 1, y: 1, z: 1 };
        
        new TWEEN.Tween(scale)
            .to({ x: 1.1, y: 1.1, z: 1.1 }, 300)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                moleculeGroup.scale.set(scale.x, scale.y, scale.z);
            })
            .chain(
                new TWEEN.Tween(scale)
                    .to({ x: 1, y: 1, z: 1 }, 300)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .onUpdate(() => {
                        moleculeGroup.scale.set(scale.x, scale.y, scale.z);
                    })
                    .onComplete(() => {
                        isAnimating = false;
                    })
            )
            .start();
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
    
    if (moleculeGroup && TWEEN) {
        const rotation = { y: 0 };
        
        new TWEEN.Tween(rotation)
            .to({ y: angle }, 1500)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => {
                moleculeGroup.rotation.y = rotation.y;
            })
            .onComplete(() => {
                setTimeout(() => {
                    new TWEEN.Tween(rotation)
                        .to({ y: 0 }, 1500)
                        .easing(TWEEN.Easing.Cubic.InOut)
                        .onUpdate(() => {
                            moleculeGroup.rotation.y = rotation.y;
                        })
                        .onComplete(() => {
                            isAnimating = false;
                        })
                        .start();
                }, 500);
            })
            .start();
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
    
    // 创建镜像分子
    const mirrorGroup = moleculeGroup.clone();
    mirrorGroup.traverse(function(child) {
        if (child.isMesh) {
            child.material = child.material.clone();
            child.material.transparent = true;
            child.material.opacity = 0.5;
        }
    });
    
    if (type === 'horizontal') {
        mirrorGroup.scale.y *= -1;
    } else if (type === 'vertical') {
        mirrorGroup.scale.x *= -1;
    } else {
        mirrorGroup.scale.x *= -1;
        mirrorGroup.scale.y *= -1;
    }
    
    scene.add(mirrorGroup);
    
    // 动画：淡入淡出
    if (TWEEN) {
        const mirrorAlpha = { opacity: 0 };
        
        new TWEEN.Tween(mirrorAlpha)
            .to({ opacity: 0.5 }, 800)
            .onUpdate(() => {
                mirrorGroup.traverse(function(child) {
                    if (child.isMesh && child.material) {
                        child.material.opacity = mirrorAlpha.opacity;
                    }
                });
            })
            .onComplete(() => {
                setTimeout(() => {
                    new TWEEN.Tween(mirrorAlpha)
                        .to({ opacity: 0 }, 800)
                        .onUpdate(() => {
                            mirrorGroup.traverse(function(child) {
                                if (child.isMesh && child.material) {
                                    child.material.opacity = mirrorAlpha.opacity;
                                }
                            });
                            plane.material.opacity = mirrorAlpha.opacity * 0.6;
                        })
                        .onComplete(() => {
                            scene.remove(mirrorGroup);
                            scene.remove(plane);
                            isAnimating = false;
                        })
                        .start();
                }, 1500);
            })
            .start();
    } else {
        setTimeout(() => {
            scene.remove(mirrorGroup);
            scene.remove(plane);
            isAnimating = false;
        }, 3000);
    }
}

function performInversionOperation() {
    if (isAnimating) return;
    isAnimating = true;
    
    showMessage("反演操作 (i): 关于中心点对称");
    
    if (moleculeGroup && TWEEN) {
        // 显示反演中心
        const centerGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const centerMaterial = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        scene.add(center);
        
        // 保存原始位置
        const originalPositions = [];
        moleculeGroup.children.forEach(child => {
            if (child.isMesh && child.geometry.type === 'SphereGeometry') {
                originalPositions.push(child.position.clone());
            }
        });
        
        // 动画：反演
        const progress = { t: 0 };
        
        new TWEEN.Tween(progress)
            .to({ t: 1 }, 2000)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => {
                moleculeGroup.children.forEach((child, index) => {
                    if (child.isMesh && child.geometry.type === 'SphereGeometry' && originalPositions[index]) {
                        const originalPos = originalPositions[index];
                        const invertedPos = originalPos.clone().multiplyScalar(-1);
                        
                        if (progress.t <= 0.5) {
                            // 向中心移动
                            child.position.lerpVectors(originalPos, new THREE.Vector3(0, 0, 0), progress.t * 2);
                        } else {
                            // 从中心向反方向移动
                            child.position.lerpVectors(new THREE.Vector3(0, 0, 0), invertedPos, (progress.t - 0.5) * 2);
                        }
                    }
                });
            })
            .onComplete(() => {
                setTimeout(() => {
                    // 恢复原始位置
                    const restoreProgress = { t: 0 };
                    new TWEEN.Tween(restoreProgress)
                        .to({ t: 1 }, 2000)
                        .easing(TWEEN.Easing.Cubic.InOut)
                        .onUpdate(() => {
                            moleculeGroup.children.forEach((child, index) => {
                                if (child.isMesh && child.geometry.type === 'SphereGeometry' && originalPositions[index]) {
                                    const currentPos = child.position.clone();
                                    const targetPos = originalPositions[index];
                                    child.position.lerpVectors(currentPos, targetPos, restoreProgress.t);
                                }
                            });
                        })
                        .onComplete(() => {
                            scene.remove(center);
                            isAnimating = false;
                        })
                        .start();
                }, 1000);
            })
            .start();
    } else {
        isAnimating = false;
    }
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

function toggleLabels() {
    if (!moleculeGroup || isAnimating) return;
    
    moleculeGroup.traverse(function(child) {
        if (child.type === 'Sprite') {
            child.visible = !child.visible;
        }
    });
    
    const btn = document.getElementById('toggleLabelsBtn');
    if (btn) {
        const labelsVisible = moleculeGroup.children[0]?.children[0]?.visible !== false;
        btn.classList.toggle('active', labelsVisible);
        showMessage(labelsVisible ? "原子标签显示" : "原子标签隐藏");
    }
}

function updateMoleculeInfo() {
    if (!currentMolecule) return;
    
    const infoDiv = document.getElementById('moleculeInfo');
    if (infoDiv) {
        infoDiv.innerHTML = `
            <strong>${currentMolecule.name}</strong><br>
            对称性: ${currentMolecule.symmetry}<br>
            原子数: ${currentMolecule.atoms.length}<br>
            键数: ${currentMolecule.bonds.length}
        `;
    }
}

function showMessage(message, type = 'info') {
    console.log("消息:", message);
    
    // 创建或获取消息容器
    let msgContainer = document.getElementById('messageContainer');
    if (!msgContainer) {
        msgContainer = document.createElement('div');
        msgContainer.id = 'messageContainer';
        msgContainer.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 1000;
            max-width: 300px;
        `;
        document.body.appendChild(msgContainer);
    }
    
    // 创建消息元素
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = `
        background: ${type === 'error' ? '#e74c3c' : '#2c3e50'};
        color: white;
        padding: 10px 15px;
        margin-bottom: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
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
    msgContainer.appendChild(msgDiv);
    
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
    
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    
    if (errorContainer && errorMessage) {
        errorMessage.textContent = message;
        errorContainer.style.display = 'block';
    } else {
        alert("3D初始化错误: " + message);
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
    
    // 更新TWEEN动画
    if (typeof TWEEN !== 'undefined') {
        TWEEN.update();
    }
    
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
    
    // 切换标签
    const toggleLabelsBtn = document.getElementById('toggleLabelsBtn');
    if (toggleLabelsBtn) {
        toggleLabelsBtn.addEventListener('click', toggleLabels);
        toggleLabelsBtn.classList.add('active'); // 默认显示标签
    }
    
    // 对称操作按钮
    const identityBtn = document.getElementById('identityBtn');
    if (identityBtn) identityBtn.addEventListener('click', performIdentityOperation);
    
    const inversionBtn = document.getElementById('inversionBtn');
    if (inversionBtn) inversionBtn.addEventListener('click', performInversionOperation);
    
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
    
    // 旋转反射操作
    document.querySelectorAll('[data-rotation-reflection]').forEach(btn => {
        btn.addEventListener('click', function() {
            // 简化的旋转反射操作
            const type = this.getAttribute('data-rotation-reflection');
            showMessage(`S${type.charAt(1)}操作: 旋转+反射`);
            performRotationOperation('C' + type.charAt(1));
            setTimeout(() => performReflectionOperation('vertical'), 800);
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
    
    // 延迟初始化3D场景，确保所有资源加载完成
    setTimeout(() => {
        if (!init()) {
            console.error("3D初始化失败");
            return;
        }
        
        // 显示成功消息
        showMessage("3D分子对称性演示已就绪", 'success');
        
        // 添加分子信息面板
        const canvasContainer = document.getElementById('moleculeCanvas');
        if (canvasContainer) {
            const infoPanel = document.createElement('div');
            infoPanel.id = 'moleculeInfo';
            infoPanel.style.cssText = `
                position: absolute;
                bottom: 10px;
                left: 10px;
                background: rgba(44, 62, 80, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 100;
                max-width: 200px;
            `;
            canvasContainer.appendChild(infoPanel);
            updateMoleculeInfo();
        }
    }, 500);
}

// 启动应用程序
main();
