// chapter3.js - 分子对称性与群论基础交互演示

// 全局变量
let scene, camera, renderer, controls;
let moleculeGroup, axesHelper, symmetryElements;
let currentMolecule = 'methane';
let isAutoRotating = false;
let showLabels = false;
let rotationSpeed = 0.005;
let animationId;

// 分子数据定义
const molecules = {
    methane: {
        name: '甲烷 (CH₄)',
        symmetryGroup: 'T_d',
        atoms: [
            { element: 'C', x: 0, y: 0, z: 0, color: 0x808080 },  // 碳原子 - 灰色
            { element: 'H', x: 0, y: 1, z: 0, color: 0xFFCCCC },  // 氢原子 - 浅红色
            { element: 'H', x: 0.94, y: -0.33, z: 0, color: 0xFFCCCC },
            { element: 'H', x: -0.47, y: -0.33, z: 0.82, color: 0xFFCCCC },
            { element: 'H', x: -0.47, y: -0.33, z: -0.82, color: 0xFFCCCC }
        ],
        bonds: [
            { from: 0, to: 1 },
            { from: 0, to: 2 },
            { from: 0, to: 3 },
            { from: 0, to: 4 }
        ],
        symmetry: {
            rotationAxes: [
                { axis: 'x', angle: Math.PI/2, order: 4 },
                { axis: 'y', angle: Math.PI/2, order: 4 },
                { axis: 'z', angle: Math.PI/2, order: 4 }
            ],
            mirrorPlanes: [
                { plane: 'xy', normal: [0, 0, 1] },
                { plane: 'xz', normal: [0, 1, 0] },
                { plane: 'yz', normal: [1, 0, 0] }
            ],
            inversionCenter: { x: 0, y: 0, z: 0 }
        }
    },
    
    benzene: {
        name: '苯 (C₆H₆)',
        symmetryGroup: 'D_6h',
        atoms: [
            // 碳原子环
            { element: 'C', x: 1, y: 0, z: 0, color: 0x808080 },
            { element: 'C', x: 0.5, y: 0.866, z: 0, color: 0x808080 },
            { element: 'C', x: -0.5, y: 0.866, z: 0, color: 0x808080 },
            { element: 'C', x: -1, y: 0, z: 0, color: 0x808080 },
            { element: 'C', x: -0.5, y: -0.866, z: 0, color: 0x808080 },
            { element: 'C', x: 0.5, y: -0.866, z: 0, color: 0x808080 },
            // 氢原子
            { element: 'H', x: 2, y: 0, z: 0, color: 0xFFCCCC },
            { element: 'H', x: 1, y: 1.732, z: 0, color: 0xFFCCCC },
            { element: 'H', x: -1, y: 1.732, z: 0, color: 0xFFCCCC },
            { element: 'H', x: -2, y: 0, z: 0, color: 0xFFCCCC },
            { element: 'H', x: -1, y: -1.732, z: 0, color: 0xFFCCCC },
            { element: 'H', x: 1, y: -1.732, z: 0, color: 0xFFCCCC }
        ],
        bonds: [
            // 碳碳键
            { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
            { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 0 },
            // 碳氢键
            { from: 0, to: 6 }, { from: 1, to: 7 }, { from: 2, to: 8 },
            { from: 3, to: 9 }, { from: 4, to: 10 }, { from: 5, to: 11 }
        ]
    },
    
    water: {
        name: '水 (H₂O)',
        symmetryGroup: 'C_2v',
        atoms: [
            { element: 'O', x: 0, y: 0, z: 0, color: 0xFF0000 },  // 氧原子 - 红色
            { element: 'H', x: 0.76, y: 0.59, z: 0, color: 0xFFCCCC },
            { element: 'H', x: -0.76, y: 0.59, z: 0, color: 0xFFCCCC }
        ],
        bonds: [
            { from: 0, to: 1 },
            { from: 0, to: 2 }
        ]
    },
    
    ammonia: {
        name: '氨 (NH₃)',
        symmetryGroup: 'C_3v',
        atoms: [
            { element: 'N', x: 0, y: 0.4, z: 0, color: 0x0000FF },  // 氮原子 - 蓝色
            { element: 'H', x: 0, y: -0.3, z: 0.8, color: 0xFFCCCC },
            { element: 'H', x: 0.69, y: -0.3, z: -0.4, color: 0xFFCCCC },
            { element: 'H', x: -0.69, y: -0.3, z: -0.4, color: 0xFFCCCC }
        ],
        bonds: [
            { from: 0, to: 1 },
            { from: 0, to: 2 },
            { from: 0, to: 3 }
        ]
    }
};

// 初始化Three.js场景
function init() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    
    // 创建相机
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(document.getElementById('moleculeCanvas').offsetWidth, 
                     document.getElementById('moleculeCanvas').offsetHeight);
    document.getElementById('moleculeCanvas').appendChild(renderer.domElement);
    
    // 添加轨道控制
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);
    
    // 添加坐标轴
    axesHelper = new THREE.AxesHelper(3);
    axesHelper.position.y = 0.1;
    scene.add(axesHelper);
    
    // 初始化分子组
    moleculeGroup = new THREE.Group();
    scene.add(moleculeGroup);
    
    // 初始化对称元素组
    symmetryElements = new THREE.Group();
    scene.add(symmetryElements);
    
    // 加载初始分子
    loadMolecule(currentMolecule);
    
    // 设置窗口大小调整监听
    window.addEventListener('resize', onWindowResize);
    
    // 开始动画循环
    animate();
}

// 加载分子模型
function loadMolecule(moleculeName) {
    // 清除当前分子
    moleculeGroup.clear();
    symmetryElements.clear();
    
    const molecule = molecules[moleculeName];
    
    // 创建原子
    molecule.atoms.forEach((atom, index) => {
        // 创建原子球体
        const geometry = new THREE.SphereGeometry(0.3, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: atom.color });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(atom.x, atom.y, atom.z);
        
        // 添加标签
        if (showLabels) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 64;
            canvas.height = 64;
            
            context.fillStyle = '#000000';
            context.font = '24px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(atom.element, 32, 32);
            
            const texture = new THREE.CanvasTexture(canvas);
            const labelMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(labelMaterial);
            sprite.position.set(atom.x, atom.y + 0.5, atom.z);
            sprite.scale.set(1, 1, 1);
            moleculeGroup.add(sprite);
        }
        
        moleculeGroup.add(sphere);
    });
    
    // 创建化学键
    molecule.bonds.forEach(bond => {
        const atom1 = molecule.atoms[bond.from];
        const atom2 = molecule.atoms[bond.to];
        
        const start = new THREE.Vector3(atom1.x, atom1.y, atom1.z);
        const end = new THREE.Vector3(atom2.x, atom2.y, atom2.z);
        
        // 创建键的圆柱体
        const length = start.distanceTo(end);
        const geometry = new THREE.CylinderGeometry(0.1, 0.1, length, 8);
        geometry.rotateZ(Math.PI / 2);
        
        const material = new THREE.MeshPhongMaterial({ color: 0xCCCCCC });
        const cylinder = new THREE.Mesh(geometry, material);
        
        // 设置圆柱体的位置和方向
        const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        cylinder.position.copy(center);
        
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        cylinder.lookAt(end);
        cylinder.rotateX(Math.PI / 2);
        
        moleculeGroup.add(cylinder);
    });
    
    // 显示对称元素
    if (molecule.symmetry) {
        displaySymmetryElements(molecule);
    }
    
    // 重置相机位置
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    controls.update();
}

// 显示对称元素
function displaySymmetryElements(molecule) {
    // 显示旋转轴
    if (molecule.symmetry.rotationAxes) {
        molecule.symmetry.rotationAxes.forEach(axis => {
            const geometry = new THREE.CylinderGeometry(0.05, 0.05, 8, 8);
            const material = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
            const cylinder = new THREE.Mesh(geometry, material);
            
            // 根据轴方向旋转
            if (axis.axis === 'x') {
                cylinder.rotation.z = Math.PI / 2;
            } else if (axis.axis === 'y') {
                cylinder.rotation.x = Math.PI / 2;
            }
            
            cylinder.visible = false; // 默认隐藏
            symmetryElements.add(cylinder);
        });
    }
    
    // 显示对称平面
    if (molecule.symmetry.mirrorPlanes) {
        molecule.symmetry.mirrorPlanes.forEach(plane => {
            const geometry = new THREE.PlaneGeometry(6, 6);
            const material = new THREE.MeshBasicMaterial({ 
                color: 0xFFA500,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.3
            });
            const planeMesh = new THREE.Mesh(geometry, material);
            
            // 根据平面方向定位
            if (plane.plane === 'xy') {
                planeMesh.rotation.x = Math.PI / 2;
            } else if (plane.plane === 'xz') {
                // 已经是默认方向
            } else if (plane.plane === 'yz') {
                planeMesh.rotation.y = Math.PI / 2;
            }
            
            planeMesh.visible = false; // 默认隐藏
            symmetryElements.add(planeMesh);
        });
    }
    
    // 显示对称中心
    if (molecule.symmetry.inversionCenter) {
        const geometry = new THREE.SphereGeometry(0.2, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xFF00FF });
        const sphere = new THREE.Mesh(geometry, material);
        const center = molecule.symmetry.inversionCenter;
        sphere.position.set(center.x, center.y, center.z);
        sphere.visible = false; // 默认隐藏
        symmetryElements.add(sphere);
    }
}

// 执行恒等操作
function performIdentityOperation() {
    // 恒等操作：分子保持不变
    // 为了演示效果，我们可以添加一个短暂的闪光效果
    flashMolecule(0xFFFFFF, 500);
    
    // 显示提示信息
    showInfoMessage("恒等操作 (E): 分子保持不变，所有原子位置不变。");
}

// 执行旋转操作
function performRotationOperation(axis, angle) {
    // 根据轴和角度旋转分子
    const rotationAxis = new THREE.Vector3();
    
    if (axis === 'x') rotationAxis.set(1, 0, 0);
    else if (axis === 'y') rotationAxis.set(0, 1, 0);
    else if (axis === 'z') rotationAxis.set(0, 0, 1);
    
    // 显示旋转轴
    showSymmetryElement('rotation', axis);
    
    // 执行旋转动画
    let startTime = Date.now();
    const duration = 2000; // 2秒
    
    function animateRotation() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数使动画更自然
        const easedProgress = easeInOutCubic(progress);
        const currentAngle = angle * easedProgress;
        
        // 应用旋转
        moleculeGroup.rotation.set(0, 0, 0);
        moleculeGroup.rotateOnAxis(rotationAxis, currentAngle);
        
        if (progress < 1) {
            requestAnimationFrame(animateRotation);
        } else {
            // 动画完成后短暂暂停，然后返回
            setTimeout(() => {
                resetRotation();
                hideSymmetryElement('rotation', axis);
            }, 1000);
        }
    }
    
    animateRotation();
    
    // 显示提示信息
    const degree = Math.round(angle * 180 / Math.PI);
    showInfoMessage(`旋转操作 (C${degree === 180 ? '₂' : degree === 120 ? '₃' : degree === 90 ? '₄' : '₆'}): 绕${axis.toUpperCase()}轴旋转${degree}度。`);
}

// 执行反射操作
function performReflectionOperation(plane) {
    // 根据平面进行反射
    const scaleVector = new THREE.Vector3(1, 1, 1);
    
    if (plane === 'horizontal') {
        // 水平反射 (σ_h)
        scaleVector.y = -1;
        showSymmetryElement('mirror', 'xy');
    } else if (plane === 'vertical') {
        // 垂直反射 (σ_v)
        scaleVector.x = -1;
        showSymmetryElement('mirror', 'yz');
    } else if (plane === 'dihedral') {
        // 对角反射 (σ_d)
        scaleVector.z = -1;
        showSymmetryElement('mirror', 'xz');
    }
    
    // 执行反射动画
    let startTime = Date.now();
    const duration = 1500;
    
    function animateReflection() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easedProgress = easeInOutCubic(progress);
        const currentScale = 1 + (scaleVector.x < 0 ? -1 : 0) * easedProgress;
        
        // 应用缩放实现反射效果
        moleculeGroup.scale.set(
            plane === 'vertical' || plane === 'dihedral' ? (currentScale > 0 ? currentScale : -currentScale) : 1,
            plane === 'horizontal' ? (currentScale > 0 ? currentScale : -currentScale) : 1,
            plane === 'diagonal' ? (currentScale > 0 ? currentScale : -currentScale) : 1
        );
        
        if (progress < 1) {
            requestAnimationFrame(animateReflection);
        } else {
            // 动画完成后短暂暂停，然后返回
            setTimeout(() => {
                resetScale();
                hideSymmetryElement('mirror', plane);
            }, 1000);
        }
    }
    
    animateReflection();
    
    // 显示提示信息
    const planeSymbol = plane === 'horizontal' ? 'σ_h' : plane === 'vertical' ? 'σ_v' : 'σ_d';
    const planeDesc = plane === 'horizontal' ? '水平面' : plane === 'vertical' ? '垂直面' : '对角面';
    showInfoMessage(`反射操作 (${planeSymbol}): 相对于${planeDesc}进行镜像反射。`);
}

// 执行反演操作
function performInversionOperation() {
    // 反演操作：将所有坐标取反
    showSymmetryElement('inversion', 'center');
    
    // 执行反演动画
    let startTime = Date.now();
    const duration = 2000;
    
    function animateInversion() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easedProgress = easeInOutCubic(progress);
        
        // 应用缩放实现反演效果
        const scale = 1 - 2 * easedProgress;
        moleculeGroup.scale.set(scale, scale, scale);
        
        if (progress < 1) {
            requestAnimationFrame(animateInversion);
        } else {
            // 动画完成后短暂暂停，然后返回
            setTimeout(() => {
                resetScale();
                hideSymmetryElement('inversion', 'center');
            }, 1000);
        }
    }
    
    animateInversion();
    
    // 显示提示信息
    showInfoMessage("反演操作 (i): 通过分子中心进行反演，每个原子映射到中心对面的位置。");
}

// 执行旋转反射操作
function performRotationReflectionOperation(type) {
    // 旋转反射操作：先旋转后反射
    const rotationAngle = type === 'S4' ? Math.PI / 2 : Math.PI / 3; // 90° 或 60°
    
    // 显示对称元素
    showSymmetryElement('rotation', 'z');
    showSymmetryElement('mirror', 'xy');
    
    // 执行旋转反射动画
    let startTime = Date.now();
    const duration = 2500;
    
    function animateRotationReflection() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easedProgress = easeInOutCubic(progress);
        
        if (progress < 0.5) {
            // 前半段：旋转
            const currentAngle = rotationAngle * (easedProgress * 2);
            moleculeGroup.rotation.z = currentAngle;
        } else {
            // 后半段：反射
            const reflectionProgress = (progress - 0.5) * 2;
            const currentScale = 1 - 2 * reflectionProgress;
            moleculeGroup.scale.y = currentScale > 0 ? currentScale : -currentScale;
        }
        
        if (progress < 1) {
            requestAnimationFrame(animateRotationReflection);
        } else {
            // 动画完成后短暂暂停，然后返回
            setTimeout(() => {
                resetRotation();
                resetScale();
                hideSymmetryElement('rotation', 'z');
                hideSymmetryElement('mirror', 'xy');
            }, 1000);
        }
    }
    
    animateRotationReflection();
    
    // 显示提示信息
    const degree = type === 'S4' ? 90 : 60;
    showInfoMessage(`旋转反射操作 (${type}): 先旋转${degree}度，然后相对于水平面反射。`);
}

// 显示对称元素
function showSymmetryElement(type, identifier) {
    symmetryElements.children.forEach(child => {
        if (type === 'rotation' && child.geometry.type === 'CylinderGeometry') {
            child.visible = true;
        } else if (type === 'mirror' && child.geometry.type === 'PlaneGeometry') {
            child.visible = true;
        } else if (type === 'inversion' && child.geometry.type === 'SphereGeometry') {
            child.visible = true;
        }
    });
}

// 隐藏对称元素
function hideSymmetryElement(type, identifier) {
    symmetryElements.children.forEach(child => {
        if (type === 'rotation' && child.geometry.type === 'CylinderGeometry') {
            child.visible = false;
        } else if (type === 'mirror' && child.geometry.type === 'PlaneGeometry') {
            child.visible = false;
        } else if (type === 'inversion' && child.geometry.type === 'SphereGeometry') {
            child.visible = false;
        }
    });
}

// 重置旋转
function resetRotation() {
    moleculeGroup.rotation.set(0, 0, 0);
}

// 重置缩放
function resetScale() {
    moleculeGroup.scale.set(1, 1, 1);
}

// 分子闪光效果
function flashMolecule(color, duration) {
    const originalMaterials = [];
    
    // 保存原始材质
    moleculeGroup.traverse(child => {
        if (child.isMesh && child.material) {
            originalMaterials.push({
                mesh: child,
                originalColor: child.material.color.clone()
            });
            child.material.color.set(color);
        }
    });
    
    // 恢复原始颜色
    setTimeout(() => {
        originalMaterials.forEach(item => {
            item.mesh.material.color.copy(item.originalColor);
        });
    }, duration);
}

// 显示提示信息
function showInfoMessage(message) {
    // 创建临时提示框
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
    `;
    
    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    infoDiv.innerHTML = `<i class="fas fa-info-circle" style="margin-right: 8px;"></i>${message}`;
    document.body.appendChild(infoDiv);
    
    // 3秒后移除提示
    setTimeout(() => {
        infoDiv.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            document.body.removeChild(infoDiv);
        }, 300);
    }, 3000);
}

// 缓动函数
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// 窗口大小调整处理
function onWindowResize() {
    const canvasContainer = document.getElementById('moleculeCanvas');
    camera.aspect = canvasContainer.offsetWidth / canvasContainer.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
}

// 动画循环
function animate() {
    animationId = requestAnimationFrame(animate);
    
    // 自动旋转
    if (isAutoRotating) {
        moleculeGroup.rotation.y += rotationSpeed;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// 初始化事件监听
function initEventListeners() {
    // 分子选择按钮
    document.querySelectorAll('.molecule-option').forEach(option => {
        option.addEventListener('click', function() {
            // 移除所有active类
            document.querySelectorAll('.molecule-option').forEach(opt => {
                opt.classList.remove('active');
            });
            
            // 添加active类到当前选项
            this.classList.add('active');
            
            // 加载新分子
            currentMolecule = this.getAttribute('data-molecule');
            loadMolecule(currentMolecule);
            
            // 显示提示信息
            showInfoMessage(`已加载${molecules[currentMolecule].name}分子模型`);
        });
    });
    
    // 恒等操作按钮
    document.getElementById('identityBtn').addEventListener('click', performIdentityOperation);
    
    // 旋转操作按钮
    document.querySelectorAll('[data-rotation]').forEach(btn => {
        btn.addEventListener('click', function() {
            const rotationType = this.getAttribute('data-rotation');
            let axis = 'z';
            let angle = Math.PI; // 默认C2
            
            switch(rotationType) {
                case 'C2':
                    axis = 'z';
                    angle = Math.PI;
                    break;
                case 'C3':
                    axis = 'z';
                    angle = 2 * Math.PI / 3;
                    break;
                case 'C4':
                    axis = 'z';
                    angle = Math.PI / 2;
                    break;
                case 'C6':
                    axis = 'z';
                    angle = Math.PI / 3;
                    break;
            }
            
            performRotationOperation(axis, angle);
        });
    });
    
    // 反射操作按钮
    document.querySelectorAll('[data-reflection]').forEach(btn => {
        btn.addEventListener('click', function() {
            const reflectionType = this.getAttribute('data-reflection');
            performReflectionOperation(reflectionType);
        });
    });
    
    // 反演操作按钮
    document.getElementById('inversionBtn').addEventListener('click', performInversionOperation);
    
    // 旋转反射操作按钮
    document.querySelectorAll('[data-rotation-reflection]').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-rotation-reflection');
            performRotationReflectionOperation(type);
        });
    });
    
    // 模型控制按钮
    document.getElementById('resetBtn').addEventListener('click', function() {
        // 重置视图
        camera.position.set(5, 5, 5);
        camera.lookAt(0, 0, 0);
        controls.reset();
        
        // 重置分子
        resetRotation();
        resetScale();
        
        // 隐藏所有对称元素
        symmetryElements.children.forEach(child => {
            child.visible = false;
        });
        
        showInfoMessage("已重置视图和分子位置");
    });
    
    document.getElementById('autoRotateBtn').addEventListener('click', function() {
        isAutoRotating = !isAutoRotating;
        this.classList.toggle('active');
        this.innerHTML = isAutoRotating ? 
            '<i class="fas fa-pause"></i> 停止旋转' : 
            '<i class="fas fa-sync-alt"></i> 自动旋转';
    });
    
    document.getElementById('toggleLabelsBtn').addEventListener('click', function() {
        showLabels = !showLabels;
        this.classList.toggle('active');
        this.innerHTML = showLabels ? 
            '<i class="fas fa-eye-slash"></i> 隐藏标签' : 
            '<i class="fas fa-eye"></i> 显示标签';
        
        // 重新加载分子以更新标签
        loadMolecule(currentMolecule);
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    init();
    initEventListeners();
    
    // 显示欢迎信息
    setTimeout(() => {
        showInfoMessage("欢迎使用分子对称性演示！点击左侧按钮开始探索分子对称操作。");
    }, 1000);
});

// 清理资源
function cleanup() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    window.removeEventListener('resize', onWindowResize);
    
    if (renderer) {
        renderer.dispose();
    }
}

// 页面卸载时清理资源
window.addEventListener('beforeunload', cleanup);
