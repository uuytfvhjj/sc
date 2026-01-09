// chapter3.js - 分子对称性3D动画演示 - 修正版

console.log("chapter3.js 加载成功！");

// 全局变量
let scene, camera, renderer, controls;
let currentMolecule = null;
let moleculeGroup = null;
let axesHelper = null;
let symmetryPlane = null;
let autoRotate = true;
let showLabels = true;
let isAnimating = false;

// 分子数据定义
const molecules = {
    methane: {
        name: "甲烷 (CH₄)",
        atoms: [
            { element: 'C', x: 0, y: 0, z: 0, color: 0x888888, radius: 0.5 },
            { element: 'H', x: 0, y: 0, z: 1.09, color: 0xFFFFFF, radius: 0.3 },
            { element: 'H', x: 1.03, y: 0, z: -0.36, color: 0xFFFFFF, radius: 0.3 },
            { element: 'H', x: -0.51, y: 0.89, z: -0.36, color: 0xFFFFFF, radius: 0.3 },
            { element: 'H', x: -0.51, y: -0.89, z: -0.36, color: 0xFFFFFF, radius: 0.3 }
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
                { axis: [1, -1, -1], order: 3 }
            ],
            reflectionPlanes: [
                { normal: [1, 0, 0] },
                { normal: [0, 1, 0] }
            ]
        }
    },
    benzene: {
        name: "苯 (C₆H₆)",
        atoms: [
            // 碳原子环
            { element: 'C', x: 1.40, y: 0, z: 0, color: 0x888888, radius: 0.5 },
            { element: 'C', x: 0.70, y: 1.21, z: 0, color: 0x888888, radius: 0.5 },
            { element: 'C', x: -0.70, y: 1.21, z: 0, color: 0x888888, radius: 0.5 },
            { element: 'C', x: -1.40, y: 0, z: 0, color: 0x888888, radius: 0.5 },
            { element: 'C', x: -0.70, y: -1.21, z: 0, color: 0x888888, radius: 0.5 },
            { element: 'C', x: 0.70, y: -1.21, z: 0, color: 0x888888, radius: 0.5 },
            // 氢原子
            { element: 'H', x: 2.48, y: 0, z: 0, color: 0xFFFFFF, radius: 0.3 },
            { element: 'H', x: 1.24, y: 2.15, z: 0, color: 0xFFFFFF, radius: 0.3 },
            { element: 'H', x: -1.24, y: 2.15, z: 0, color: 0xFFFFFF, radius: 0.3 },
            { element: 'H', x: -2.48, y: 0, z: 0, color: 0xFFFFFF, radius: 0.3 },
            { element: 'H', x: -1.24, y: -2.15, z: 0, color: 0xFFFFFF, radius: 0.3 },
            { element: 'H', x: 1.24, y: -2.15, z: 0, color: 0xFFFFFF, radius: 0.3 }
        ],
        bonds: [
            // C-C 键（六元环）
            { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
            { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 0 },
            // C-H 键
            { from: 0, to: 6 }, { from: 1, to: 7 }, { from: 2, to: 8 },
            { from: 3, to: 9 }, { from: 4, to: 10 }, { from: 5, to: 11 }
        ],
        symmetry: {
            rotationAxes: [
                { axis: [0, 0, 1], order: 6 }
            ],
            reflectionPlanes: [
                { normal: [0, 0, 1] }
            ]
        }
    },
    water: {
        name: "水 (H₂O)",
        atoms: [
            { element: 'O', x: 0, y: 0, z: 0, color: 0xFF4444, radius: 0.55 },
            { element: 'H', x: 0.76, y: 0.59, z: 0, color: 0xFFFFFF, radius: 0.3 },
            { element: 'H', x: -0.76, y: 0.59, z: 0, color: 0xFFFFFF, radius: 0.3 }
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
            { element: 'N', x: 0, y: 0, z: 0, color: 0x3050F8, radius: 0.56 },
            { element: 'H', x: 0, y: 0, z: 1.01, color: 0xFFFFFF, radius: 0.3 },
            { element: 'H', x: 0.94, y: 0, z: -0.33, color: 0xFFFFFF, radius: 0.3 },
            { element: 'H', x: -0.47, y: 0.82, z: -0.33, color: 0xFFFFFF, radius: 0.3 }
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

// 初始化Three.js场景
function init() {
    console.log("初始化3D场景...");
    
    try {
        // 创建场景
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8f9fa);
        
        // 创建相机
        const canvasContainer = document.getElementById('moleculeCanvas');
        camera = new THREE.PerspectiveCamera(
            50, 
            canvasContainer.clientWidth / canvasContainer.clientHeight,
            0.1, 
            1000
        );
        camera.position.set(5, 5, 5);
        
        // 创建渲染器
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
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
        
        // 设置默认视图
        setTimeout(() => {
            if (moleculeGroup) {
                moleculeGroup.rotation.x = 0.3;
                moleculeGroup.rotation.y = 0.5;
            }
        }, 100);
        
        // 窗口大小调整
        window.addEventListener('resize', onWindowResize);
        
        // 开始动画循环
        animate();
        
        console.log("3D场景初始化完成");
        
    } catch (error) {
        console.error("初始化失败:", error);
        showErrorMessage("3D初始化错误: " + error.message);
        throw error;
    }
}

// 加载分子模型
function loadMolecule(moleculeKey) {
    if (moleculeGroup) {
        scene.remove(moleculeGroup);
        moleculeGroup = null;
    }
    
    currentMolecule = molecules[moleculeKey];
    moleculeGroup = new THREE.Group();
    moleculeGroup.name = moleculeKey;
    
    // 创建原子
    const atoms = currentMolecule.atoms;
    const atomMeshes = [];
    
    for (let i = 0; i < atoms.length; i++) {
        const atom = atoms[i];
        
        // 创建原子球体
        const geometry = new THREE.SphereGeometry(atom.radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: atom.color,
            shininess: 50,
            specular: 0x444444
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(atom.x, atom.y, atom.z);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        sphere.userData = { type: 'atom', element: atom.element, index: i };
        
        // 添加原子标签
        if (showLabels) {
            const label = createAtomLabel(atom.element, i);
            label.position.set(atom.x, atom.y + atom.radius + 0.2, atom.z);
            sphere.add(label);
        }
        
        atomMeshes.push(sphere);
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
        const bondMesh = createBondMesh(from, to);
        
        moleculeGroup.add(bondMesh);
    }
    
    scene.add(moleculeGroup);
    
    // 更新UI状态
    updateMoleculeInfo();
    showMessage(`已加载: ${currentMolecule.name}`);
}

// 创建化学键网格
function createBondMesh(from, to) {
    const direction = new THREE.Vector3().subVectors(to, from);
    const length = direction.length();
    const center = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    
    // 创建圆柱体几何体
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, length, 12);
    
    // 旋转圆柱体使其指向正确方向
    const axis = new THREE.Vector3(0, 1, 0);
    const rotationAxis = new THREE.Vector3().crossVectors(axis, direction).normalize();
    const rotationAngle = Math.acos(axis.dot(direction.normalize()));
    
    const quaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAngle);
    geometry.applyQuaternion(quaternion);
    
    // 移动到正确位置
    geometry.translate(center.x, center.y, center.z);
    
    // 创建材质
    const material = new THREE.MeshPhongMaterial({ 
        color: 0xCCCCCC,
        shininess: 30,
        specular: 0x222222
    });
    
    const bondMesh = new THREE.Mesh(geometry, material);
    bondMesh.castShadow = true;
    bondMesh.receiveShadow = true;
    bondMesh.userData = { type: 'bond' };
    
    return bondMesh;
}

// 创建原子标签
function createAtomLabel(element, index) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 32;
    
    // 绘制标签背景
    context.fillStyle = 'rgba(44, 62, 80, 0.85)';
    context.beginPath();
    context.roundRect(2, 2, canvas.width-4, canvas.height-4, 8);
    context.fill();
    
    // 绘制文本
    context.fillStyle = '#FFFFFF';
    context.font = 'bold 18px Arial, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(element, canvas.width / 2, canvas.height / 2);
    
    // 创建纹理
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        opacity: 0.9
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1.2, 0.6, 1);
    
    return sprite;
}

// 执行恒等操作
function performIdentityOperation() {
    if (isAnimating) return;
    isAnimating = true;
    
    showMessage("恒等操作 (E): 分子保持不变");
    
    // 添加一个简单的视觉反馈
    if (moleculeGroup) {
        const originalScale = moleculeGroup.scale.clone();
        
        // 缩放动画
        const scaleUp = { value: 1 };
        new TWEEN.Tween(scaleUp)
            .to({ value: 1.2 }, 300)
            .easing(TWEEN.Easing.Cubic.Out)
            .onUpdate(() => {
                moleculeGroup.scale.set(originalScale.x * scaleUp.value, 
                                      originalScale.y * scaleUp.value, 
                                      originalScale.z * scaleUp.value);
            })
            .chain(
                new TWEEN.Tween(scaleUp)
                    .to({ value: 1 }, 300)
                    .easing(TWEEN.Easing.Cubic.In)
                    .onUpdate(() => {
                        moleculeGroup.scale.set(originalScale.x * scaleUp.value, 
                                              originalScale.y * scaleUp.value, 
                                              originalScale.z * scaleUp.value);
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

// 执行旋转操作
function performRotationOperation(order) {
    if (isAnimating) return;
    isAnimating = true;
    
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
            isAnimating = false;
            return;
    }
    
    showMessage(`${operationName}: 分子绕轴旋转指定角度后与自身重合`);
    
    if (moleculeGroup) {
        // 显示旋转轴
        const axisHelper = new THREE.ArrowHelper(
            axis.normalize(),
            new THREE.Vector3(0, 0, 0),
            3,
            0xFF0000,
            0.3,
            0.2
        );
        scene.add(axisHelper);
        
        // 创建旋转动画
        const startQuaternion = moleculeGroup.quaternion.clone();
        const endQuaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
        
        const rotationProgress = { t: 0 };
        new TWEEN.Tween(rotationProgress)
            .to({ t: 1 }, 2000)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => {
                THREE.Quaternion.slerp(startQuaternion, endQuaternion, moleculeGroup.quaternion, rotationProgress.t);
            })
            .onComplete(() => {
                // 延迟后旋转回来
                setTimeout(() => {
                    const resetProgress = { t: 0 };
                    new TWEEN.Tween(resetProgress)
                        .to({ t: 1 }, 2000)
                        .easing(TWEEN.Easing.Cubic.InOut)
                        .onUpdate(() => {
                            THREE.Quaternion.slerp(endQuaternion, startQuaternion, moleculeGroup.quaternion, resetProgress.t);
                        })
                        .onComplete(() => {
                            scene.remove(axisHelper);
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

// 执行反射操作
function performReflectionOperation(type) {
    if (isAnimating) return;
    isAnimating = true;
    
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
            isAnimating = false;
            return;
    }
    
    showMessage(`${operationName}: 分子相对于平面进行镜像反射`);
    
    // 显示对称平面
    showSymmetryPlane(normal, planeColor);
    
    if (moleculeGroup) {
        // 创建分子镜像
        const mirrorGroup = moleculeGroup.clone();
        
        // 根据平面法线进行镜像
        let scaleVector;
        if (type === 'horizontal') {
            scaleVector = new THREE.Vector3(1, -1, 1);
        } else if (type === 'vertical') {
            scaleVector = new THREE.Vector3(-1, 1, 1);
        } else {
            // 对角反射：需要特殊处理
            scaleVector = new THREE.Vector3(-1, -1, 1);
        }
        
        mirrorGroup.scale.copy(scaleVector);
        
        // 设置半透明材质
        mirrorGroup.traverse(function(child) {
            if (child.isMesh) {
                child.material = child.material.clone();
                child.material.transparent = true;
                child.material.opacity = 0.5;
                child.material.needsUpdate = true;
            }
        });
        
        scene.add(mirrorGroup);
        
        // 动画：显示镜像
        const mirrorScale = { value: 0 };
        new TWEEN.Tween(mirrorScale)
            .to({ value: 1 }, 1000)
            .easing(TWEEN.Easing.Back.Out)
            .onUpdate(() => {
                mirrorGroup.scale.set(
                    scaleVector.x * mirrorScale.value,
                    scaleVector.y * mirrorScale.value,
                    scaleVector.z * mirrorScale.value
                );
            })
            .onComplete(() => {
                // 3秒后移除镜像
                setTimeout(() => {
                    const fadeOut = { opacity: 0.5 };
                    new TWEEN.Tween(fadeOut)
                        .to({ opacity: 0 }, 500)
                        .onUpdate(() => {
                            mirrorGroup.traverse(function(child) {
                                if (child.isMesh && child.material) {
                                    child.material.opacity = fadeOut.opacity;
                                }
                            });
                        })
                        .onComplete(() => {
                            scene.remove(mirrorGroup);
                            isAnimating = false;
                        })
                        .start();
                }, 3000);
            })
            .start();
    } else {
        isAnimating = false;
    }
}

// 执行反演操作
function performInversionOperation() {
    if (isAnimating) return;
    isAnimating = true;
    
    showMessage("反演操作 (i): 每个原子通过中心映射到对面位置");
    
    if (moleculeGroup) {
        // 显示反演中心
        const centerGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const centerMaterial = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
        const centerSphere = new THREE.Mesh(centerGeometry, centerMaterial);
        scene.add(centerSphere);
        
        // 存储原始位置
        const originalPositions = [];
        moleculeGroup.children.forEach(child => {
            if (child.userData && child.userData.type === 'atom') {
                originalPositions.push(child.position.clone());
            }
        });
        
        // 动画：原子移动到反演位置
        const animationProgress = { t: 0 };
        new TWEEN.Tween(animationProgress)
            .to({ t: 1 }, 1500)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => {
                moleculeGroup.children.forEach((child, index) => {
                    if (child.userData && child.userData.type === 'atom') {
                        const originalPos = originalPositions[index];
                        const invertedPos = originalPos.clone().multiplyScalar(-1);
                        
                        if (animationProgress.t < 0.5) {
                            // 第一阶段：向中心移动
                            const progressToCenter = animationProgress.t * 2;
                            child.position.lerpVectors(originalPos, new THREE.Vector3(0, 0, 0), progressToCenter);
                        } else {
                            // 第二阶段：从中心移动到反演位置
                            const progressFromCenter = (animationProgress.t - 0.5) * 2;
                            child.position.lerpVectors(new THREE.Vector3(0, 0, 0), invertedPos, progressFromCenter);
                        }
                    }
                });
            })
            .onComplete(() => {
                // 延迟后恢复
                setTimeout(() => {
                    const resetProgress = { t: 0 };
                    new TWEEN.Tween(resetProgress)
                        .to({ t: 1 }, 1500)
                        .easing(TWEEN.Easing.Cubic.InOut)
                        .onUpdate(() => {
                            moleculeGroup.children.forEach((child, index) => {
                                if (child.userData && child.userData.type === 'atom') {
                                    const originalPos = originalPositions[index];
                                    const currentPos = child.position.clone();
                                    child.position.lerpVectors(currentPos, originalPos, resetProgress.t);
                                }
                            });
                        })
                        .onComplete(() => {
                            scene.remove(centerSphere);
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

// 显示对称平面
function showSymmetryPlane(normal, color) {
    // 移除之前的对称平面
    if (symmetryPlane) {
        scene.remove(symmetryPlane);
    }
    
    // 创建平面几何体
    const planeGeometry = new THREE.PlaneGeometry(6, 6);
    const planeMaterial = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2
    });
    
    symmetryPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    
    // 将平面对齐到法线方向
    symmetryPlane.lookAt(normal);
    
    scene.add(symmetryPlane);
    
    // 5秒后移除平面
    setTimeout(() => {
        if (symmetryPlane) {
            const fadeOut = { opacity: 0.2 };
            new TWEEN.Tween(fadeOut)
                .to({ opacity: 0 }, 500)
                .onUpdate(() => {
                    symmetryPlane.material.opacity = fadeOut.opacity;
                })
                .onComplete(() => {
                    scene.remove(symmetryPlane);
                    symmetryPlane = null;
                })
                .start();
        }
    }, 5000);
}

// 重置视图
function resetView() {
    if (isAnimating) return;
    
    camera.position.set(5, 5, 5);
    controls.reset();
    
    if (moleculeGroup) {
        moleculeGroup.rotation.set(0.3, 0.5, 0);
        moleculeGroup.scale.set(1, 1, 1);
    }
    
    // 移除对称平面
    if (symmetryPlane) {
        scene.remove(symmetryPlane);
        symmetryPlane = null;
    }
    
    showMessage("视图已重置");
}

// 切换自动旋转
function toggleAutoRotate() {
    autoRotate = !autoRotate;
    const autoRotateBtn = document.getElementById('autoRotateBtn');
    
    if (autoRotate) {
        autoRotateBtn.classList.add('active');
        showMessage("自动旋转已开启");
    } else {
        autoRotateBtn.classList.remove('active');
        showMessage("自动旋转已关闭");
    }
}

// 切换标签显示
function toggleLabels() {
    if (isAnimating) return;
    
    showLabels = !showLabels;
    const toggleLabelsBtn = document.getElementById('toggleLabelsBtn');
    
    // 重新加载当前分子以更新标签
    if (moleculeGroup) {
        loadMolecule(moleculeGroup.name);
    }
    
    if (showLabels) {
        toggleLabelsBtn.classList.add('active');
        showMessage("原子标签已显示");
    } else {
        toggleLabelsBtn.classList.remove('active');
        showMessage("原子标签已隐藏");
    }
}

// 更新分子信息显示
function updateMoleculeInfo() {
    // 在实际应用中，这里可以更新UI显示分子信息
    console.log(`当前分子: ${currentMolecule.name}`);
}

// 显示消息
function showMessage(message) {
    console.log("消息:", message);
    
    // 创建消息元素
    let messageDiv = document.getElementById('operationMessage');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'operationMessage';
        messageDiv.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            background: rgba(44, 62, 80, 0.9);
            color: white;
            padding: 12px 18px;
            border-radius: 8px;
            z-index: 1000;
            font-size: 14px;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: opacity 0.3s;
        `;
        document.body.appendChild(messageDiv);
    }
    
    messageDiv.textContent = message;
    messageDiv.style.opacity = '1';
    
    // 3秒后淡出
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// 显示错误消息
function showErrorMessage(message) {
    console.error("错误:", message);
    
    const canvasContainer = document.getElementById('moleculeCanvas');
    if (canvasContainer) {
        canvasContainer.innerHTML = `
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

// 窗口大小调整处理
function onWindowResize() {
    const canvasContainer = document.getElementById('moleculeCanvas');
    if (!canvasContainer) return;
    
    camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    // TWEEN动画更新
    TWEEN.update();
    
    // 自动旋转
    if (autoRotate && moleculeGroup && !isAnimating) {
        moleculeGroup.rotation.y += 0.002;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// 事件监听器设置
function setupEventListeners() {
    // 重置视图按钮
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) resetBtn.addEventListener('click', resetView);
    
    // 自动旋转按钮
    const autoRotateBtn = document.getElementById('autoRotateBtn');
    if (autoRotateBtn) {
        autoRotateBtn.addEventListener('click', toggleAutoRotate);
        if (autoRotate) autoRotateBtn.classList.add('active');
    }
    
    // 切换标签按钮
    const toggleLabelsBtn = document.getElementById('toggleLabelsBtn');
    if (toggleLabelsBtn) {
        toggleLabelsBtn.addEventListener('click', toggleLabels);
        if (showLabels) toggleLabelsBtn.classList.add('active');
    }
    
    // 恒等操作按钮
    const identityBtn = document.getElementById('identityBtn');
    if (identityBtn) identityBtn.addEventListener('click', performIdentityOperation);
    
    // 反演操作按钮
    const inversionBtn = document.getElementById('inversionBtn');
    if (inversionBtn) inversionBtn.addEventListener('click', performInversionOperation);
    
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
    
    // 分子选择按钮
    document.querySelectorAll('.molecule-option').forEach(option => {
        option.addEventListener('click', function() {
            if (isAnimating) return;
            
            // 更新活动状态
            document.querySelectorAll('.molecule-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
            
            // 加载选中的分子
            const moleculeKey = this.getAttribute('data-molecule');
            loadMolecule(moleculeKey);
        });
    });
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM加载完成");
    
    // 检查Three.js是否已加载
    if (typeof THREE === 'undefined') {
        console.error('Three.js未正确加载。请检查CDN链接或网络连接。');
        showErrorMessage('Three.js库加载失败。请检查网络连接后刷新页面。');
        return;
    }
    
    // 检查TWEEN.js是否已加载，如果没有则动态加载
    if (typeof TWEEN === 'undefined') {
        console.warn('TWEEN.js未加载，正在动态加载...');
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js';
        script.onload = function() {
            console.log('TWEEN.js动态加载成功');
            initThreeJS();
        };
        script.onerror = function() {
            console.error('TWEEN.js动态加载失败');
            showErrorMessage('动画库加载失败，部分动画效果可能无法显示。');
            initThreeJS();
        };
        document.head.appendChild(script);
    } else {
        initThreeJS();
    }
    
    function initThreeJS() {
        try {
            init();
            setupEventListeners();
            console.log('分子对称性3D演示初始化成功');
        } catch (error) {
            console.error('初始化失败:', error);
            showErrorMessage('3D演示初始化失败: ' + error.message);
        }
    }
});
