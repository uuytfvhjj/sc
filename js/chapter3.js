// chapter3.js - 分子对称性与群论基础交互演示（优化版）

// 全局变量
let scene, camera, renderer, controls;
let moleculeGroup, symmetryElements, atomSprites = [];
let currentMolecule = 'methane';
let isAutoRotating = false;
let showLabels = false;
let rotationSpeed = 0.005;
let animationId;
let symmetryGroupInfo;

// 原子颜色映射
const atomColors = {
    'C': 0x808080,  // 碳 - 灰色
    'H': 0xFFCCCC,  // 氢 - 浅红色
    'O': 0xFF0000,  // 氧 - 红色
    'N': 0x0000FF,  // 氮 - 蓝色
    'Cl': 0x00FF00, // 氯 - 绿色
    'Br': 0x8B4513  // 溴 - 棕色
};

// 原子半径映射
const atomRadii = {
    'C': 0.7,
    'H': 0.3,
    'O': 0.7,
    'N': 0.7,
    'Cl': 0.9,
    'Br': 1.0
};

// 分子数据定义（优化版）
const molecules = {
    methane: {
        name: '甲烷 (CH₄)',
        symmetryGroup: 'T_d',
        pointGroup: '四面体群',
        symmetryElements: {
            E: 1,    // 恒等操作
            C3: 8,   // 三重轴
            C2: 3,   // 二重轴
            σd: 6,   // 对角反射面
            S4: 6,   // 四次旋转反射轴
            i: 1     // 反演中心
        },
        atoms: [
            { element: 'C', x: 0, y: 0, z: 0 },
            { element: 'H', x: 0, y: 1.09, z: 0 },
            { element: 'H', x: 1.03, y: -0.36, z: 0 },
            { element: 'H', x: -0.52, y: -0.36, z: 0.89 },
            { element: 'H', x: -0.52, y: -0.36, z: -0.89 }
        ],
        bonds: [
            { from: 0, to: 1 },
            { from: 0, to: 2 },
            { from: 0, to: 3 },
            { from: 0, to: 4 }
        ],
        symmetryAxes: [
            { type: 'C3', axis: [1, 1, 1], order: 3 },
            { type: 'C3', axis: [1, -1, -1], order: 3 },
            { type: 'C2', axis: [1, 0, 0], order: 2 },
            { type: 'S4', axis: [1, 0, 0], order: 4 }
        ],
        symmetryPlanes: [
            { type: 'σd', normal: [1, 1, 0], position: [0, 0, 0] }
        ]
    },
    
    benzene: {
        name: '苯 (C₆H₆)',
        symmetryGroup: 'D_6h',
        pointGroup: '六角双锥群',
        symmetryElements: {
            E: 1,    // 恒等操作
            C6: 1,   // 六重主轴
            C3: 2,   // 三重轴
            C2: 7,   // 二重轴
            σh: 1,   // 水平反射面
            σv: 6,   // 垂直反射面
            σd: 6,   // 对角反射面
            i: 1,    // 反演中心
            S6: 2    // 六次旋转反射轴
        },
        atoms: [
            // 碳原子环
            { element: 'C', x: 1.39, y: 0, z: 0 },
            { element: 'C', x: 0.70, y: 1.20, z: 0 },
            { element: 'C', x: -0.70, y: 1.20, z: 0 },
            { element: 'C', x: -1.39, y: 0, z: 0 },
            { element: 'C', x: -0.70, y: -1.20, z: 0 },
            { element: 'C', x: 0.70, y: -1.20, z: 0 },
            // 氢原子
            { element: 'H', x: 2.47, y: 0, z: 0 },
            { element: 'H', x: 1.23, y: 2.13, z: 0 },
            { element: 'H', x: -1.23, y: 2.13, z: 0 },
            { element: 'H', x: -2.47, y: 0, z: 0 },
            { element: 'H', x: -1.23, y: -2.13, z: 0 },
            { element: 'H', x: 1.23, y: -2.13, z: 0 }
        ],
        bonds: [
            // 碳碳键
            { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
            { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 0 },
            // 碳氢键
            { from: 0, to: 6 }, { from: 1, to: 7 }, { from: 2, to: 8 },
            { from: 3, to: 9 }, { from: 4, to: 10 }, { from: 5, to: 11 }
        ],
        symmetryAxes: [
            { type: 'C6', axis: [0, 0, 1], order: 6 },
            { type: 'C2', axis: [1, 0, 0], order: 2 }
        ],
        symmetryPlanes: [
            { type: 'σh', normal: [0, 0, 1], position: [0, 0, 0] },
            { type: 'σv', normal: [1, 0, 0], position: [0, 0, 0] }
        ]
    },
    
    water: {
        name: '水 (H₂O)',
        symmetryGroup: 'C_2v',
        pointGroup: '二面体群',
        symmetryElements: {
            E: 1,    // 恒等操作
            C2: 1,   // 二重主轴
            σv: 2    // 垂直反射面
        },
        atoms: [
            { element: 'O', x: 0, y: 0, z: 0.12 },
            { element: 'H', x: 0.76, y: 0, z: -0.48 },
            { element: 'H', x: -0.76, y: 0, z: -0.48 }
        ],
        bonds: [
            { from: 0, to: 1 },
            { from: 0, to: 2 }
        ],
        symmetryAxes: [
            { type: 'C2', axis: [0, 1, 0], order: 2 }
        ],
        symmetryPlanes: [
            { type: 'σv', normal: [1, 0, 0], position: [0, 0, 0] },
            { type: 'σv', normal: [0, 0, 1], position: [0, 0, 0] }
        ]
    },
    
    ammonia: {
        name: '氨 (NH₃)',
        symmetryGroup: 'C_3v',
        pointGroup: '三角锥群',
        symmetryElements: {
            E: 1,    // 恒等操作
            C3: 2,   // 三重轴
            σv: 3    // 垂直反射面
        },
        atoms: [
            { element: 'N', x: 0, y: 0.63, z: 0 },
            { element: 'H', x: 0, y: -0.21, z: 0.93 },
            { element: 'H', x: 0.81, y: -0.21, z: -0.46 },
            { element: 'H', x: -0.81, y: -0.21, z: -0.46 }
        ],
        bonds: [
            { from: 0, to: 1 },
            { from: 0, to: 2 },
            { from: 0, to: 3 }
        ],
        symmetryAxes: [
            { type: 'C3', axis: [0, 1, 0], order: 3 }
        ],
        symmetryPlanes: [
            { type: 'σv', normal: [1, 0, 0], position: [0, 0, 0] }
        ]
    }
};

// 群论信息
const groupTheoryInfo = {
    'T_d': {
        name: '四面体群',
        description: '包含24个对称操作：恒等、8个C₃旋转、3个C₂旋转、6个σd反射、6个S₄旋转反射、1个反演',
        order: 24,
        examples: 'CH₄, CCl₄, SiH₄',
        characterTable: '具有5个不可约表示'
    },
    'D_6h': {
        name: '六角双锥群',
        description: '包含24个对称操作：恒等、主轴旋转、水平反射、垂直反射、反演等',
        order: 24,
        examples: '苯, C₆H₆, 六氟苯',
        characterTable: '具有12个不可约表示'
    },
    'C_2v': {
        name: '二面体群',
        description: '包含4个对称操作：恒等、1个C₂旋转、2个垂直反射',
        order: 4,
        examples: '水, H₂O, 甲醛',
        characterTable: '具有4个不可约表示'
    },
    'C_3v': {
        name: '三角锥群',
        description: '包含6个对称操作：恒等、2个C₃旋转、3个垂直反射',
        order: 6,
        examples: '氨, NH₃, 三氯甲烷',
        characterTable: '具有3个不可约表示'
    }
};

// 初始化Three.js场景
function init() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    
    // 创建相机
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 8, 10);
    camera.lookAt(0, 0, 0);
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(document.getElementById('moleculeCanvas').offsetWidth, 
                     document.getElementById('moleculeCanvas').offsetHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('moleculeCanvas').appendChild(renderer.domElement);
    
    // 添加轨道控制
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 30;
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // 添加坐标轴
    const axesHelper = new THREE.AxesHelper(5);
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
    
    // 显示群论信息
    updateGroupTheoryInfo();
    
    // 设置窗口大小调整监听
    window.addEventListener('resize', onWindowResize);
    
    // 开始动画循环
    animate();
}

// 加载分子模型
function loadMolecule(moleculeName) {
    // 清除当前分子
    while(moleculeGroup.children.length > 0) {
        moleculeGroup.remove(moleculeGroup.children[0]);
    }
    
    while(symmetryElements.children.length > 0) {
        symmetryElements.remove(symmetryElements.children[0]);
    }
    
    atomSprites = [];
    
    const molecule = molecules[moleculeName];
    
    // 创建原子和化学键
    const atomMeshes = [];
    
    // 首先创建所有原子
    molecule.atoms.forEach((atom, index) => {
        const radius = atomRadii[atom.element] || 0.5;
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: atomColors[atom.element] || 0x888888,
            shininess: 30
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(atom.x, atom.y, atom.z);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        
        atomMeshes.push(sphere);
        moleculeGroup.add(sphere);
        
        // 添加原子标签
        createAtomLabel(atom.element, atom.x, atom.y, atom.z, index);
    });
    
    // 然后创建化学键
    molecule.bonds.forEach(bond => {
        const atom1 = molecule.atoms[bond.from];
        const atom2 = molecule.atoms[bond.to];
        
        // 计算键的方向和长度
        const start = new THREE.Vector3(atom1.x, atom1.y, atom1.z);
        const end = new THREE.Vector3(atom2.x, atom2.y, atom2.z);
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        
        // 考虑原子半径，调整键的起始和结束位置
        const radius1 = atomRadii[atom1.element] || 0.5;
        const radius2 = atomRadii[atom2.element] || 0.5;
        
        // 调整起始和结束点，使键连接到原子表面而不是中心
        const startAdjusted = start.clone().add(
            direction.clone().normalize().multiplyScalar(radius1 * 0.8)
        );
        const endAdjusted = end.clone().add(
            direction.clone().normalize().multiplyScalar(-radius2 * 0.8)
        );
        
        const adjustedDirection = new THREE.Vector3().subVectors(endAdjusted, startAdjusted);
        const adjustedLength = adjustedDirection.length();
        
        // 创建键的圆柱体
        const geometry = new THREE.CylinderGeometry(0.2, 0.2, adjustedLength, 8);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xCCCCCC,
            shininess: 20
        });
        const cylinder = new THREE.Mesh(geometry, material);
        
        // 定位和定向圆柱体
        const midPoint = new THREE.Vector3().addVectors(startAdjusted, endAdjusted).multiplyScalar(0.5);
        cylinder.position.copy(midPoint);
        
        // 对齐圆柱体方向
        cylinder.lookAt(endAdjusted);
        cylinder.rotateX(Math.PI / 2);
        
        cylinder.castShadow = true;
        cylinder.receiveShadow = true;
        
        moleculeGroup.add(cylinder);
    });
    
    // 显示对称元素
    displaySymmetryElements(molecule);
    
    // 重置相机位置
    camera.position.set(10, 8, 10);
    camera.lookAt(0, 0, 0);
    controls.update();
    
    // 更新群论信息
    updateGroupTheoryInfo();
}

// 创建原子标签
function createAtomLabel(element, x, y, z, index) {
    if (!showLabels) return;
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 128;
    
    // 绘制背景
    context.fillStyle = 'rgba(255, 255, 255, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制文本
    context.fillStyle = '#000000';
    context.font = 'bold 60px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(element, 64, 64);
    
    // 创建纹理
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        opacity: 0.9
    });
    const sprite = new THREE.Sprite(material);
    
    // 根据原子半径调整标签位置
    const radius = atomRadii[element] || 0.5;
    sprite.position.set(x, y + radius + 0.5, z);
    sprite.scale.set(2, 2, 1);
    
    atomSprites.push(sprite);
    moleculeGroup.add(sprite);
}

// 显示对称元素
function displaySymmetryElements(molecule) {
    // 显示旋转轴
    if (molecule.symmetryAxes) {
        molecule.symmetryAxes.forEach((axis, index) => {
            const axisVector = new THREE.Vector3(axis.axis[0], axis.axis[1], axis.axis[2]).normalize();
            
            // 创建旋转轴可视化（圆柱体）
            const geometry = new THREE.CylinderGeometry(0.05, 0.05, 10, 8);
            const material = new THREE.MeshBasicMaterial({ 
                color: axis.type === 'C2' ? 0xFF0000 : 
                       axis.type === 'C3' ? 0x00FF00 : 
                       axis.type === 'C4' ? 0x0000FF :
                       axis.type === 'C6' ? 0xFFA500 : 0x9B59B6,
                transparent: true,
                opacity: 0.6
            });
            const cylinder = new THREE.Mesh(geometry, material);
            
            // 对齐圆柱体方向
            cylinder.lookAt(new THREE.Vector3().addVectors(
                new THREE.Vector3(0, 1, 0), 
                axisVector.multiplyScalar(10)
            ));
            cylinder.rotateX(Math.PI / 2);
            
            cylinder.visible = false;
            symmetryElements.add(cylinder);
            
            // 添加轴标签
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 64;
            canvas.height = 32;
            context.fillStyle = 'rgba(0, 0, 0, 0.8)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = 'white';
            context.font = 'bold 16px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(axis.type, 32, 16);
            
            const texture = new THREE.CanvasTexture(canvas);
            const labelMaterial = new THREE.SpriteMaterial({ map: texture });
            const label = new THREE.Sprite(labelMaterial);
            label.position.copy(axisVector.multiplyScalar(5));
            label.scale.set(1, 0.5, 1);
            label.visible = false;
            symmetryElements.add(label);
        });
    }
    
    // 显示对称平面
    if (molecule.symmetryPlanes) {
        molecule.symmetryPlanes.forEach((plane, index) => {
            const geometry = new THREE.PlaneGeometry(8, 8);
            const material = new THREE.MeshBasicMaterial({ 
                color: plane.type === 'σh' ? 0xFFA500 : 
                       plane.type === 'σv' ? 0x00FF00 : 
                       0x9B59B6,  // σd
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.3
            });
            const planeMesh = new THREE.Mesh(geometry, material);
            
            // 根据法向量定位平面
            const normal = new THREE.Vector3(plane.normal[0], plane.normal[1], plane.normal[2]).normalize();
            planeMesh.lookAt(normal);
            
            planeMesh.visible = false;
            symmetryElements.add(planeMesh);
        });
    }
    
    // 显示对称中心（如果有）
    if (molecule.symmetryElements && molecule.symmetryElements.i) {
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xFF00FF,
            transparent: true,
            opacity: 0.6
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.visible = false;
        symmetryElements.add(sphere);
    }
}

// 更新群论信息显示
function updateGroupTheoryInfo() {
    const molecule = molecules[currentMolecule];
    const groupInfo = groupTheoryInfo[molecule.symmetryGroup];
    
    // 创建或更新信息面板
    let infoPanel = document.querySelector('.info-panel.group-theory');
    if (!infoPanel) {
        infoPanel = document.createElement('div');
        infoPanel.className = 'info-panel group-theory';
        document.querySelector('.panel-content').prepend(infoPanel);
    }
    
    // 构建对称元素表格
    let symmetryTable = '<table class="symmetry-table"><tr><th>对称操作</th><th>数量</th></tr>';
    for (const [key, value] of Object.entries(molecule.symmetryElements)) {
        let symbol = key;
        if (key === 'E') symbol = '恒等操作 (E)';
        else if (key === 'C2') symbol = '二次轴 (C₂)';
        else if (key === 'C3') symbol = '三次轴 (C₃)';
        else if (key === 'C4') symbol = '四次轴 (C₄)';
        else if (key === 'C6') symbol = '六次轴 (C₆)';
        else if (key === 'σh') symbol = '水平反射面 (σₕ)';
        else if (key === 'σv') symbol = '垂直反射面 (σᵥ)';
        else if (key === 'σd') symbol = '对角反射面 (σ_d)';
        else if (key === 'i') symbol = '反演中心 (i)';
        else if (key === 'S4') symbol = '四次旋转反射轴 (S₄)';
        else if (key === 'S6') symbol = '六次旋转反射轴 (S₆)';
        
        symmetryTable += `<tr><td>${symbol}</td><td>${value}</td></tr>`;
    }
    symmetryTable += '</table>';
    
    infoPanel.innerHTML = `
        <h5><i class="fas fa-project-diagram"></i> 群论信息 - ${molecule.symmetryGroup} 点群</h5>
        <p><strong>${groupInfo.name}</strong></p>
        <p>${groupInfo.description}</p>
        <p><strong>群阶:</strong> ${groupInfo.order}</p>
        <p><strong>例子:</strong> ${groupInfo.examples}</p>
        <p><strong>对称元素:</strong></p>
        ${symmetryTable}
    `;
}

// 执行恒等操作
function performIdentityOperation() {
    // 恒等操作：分子保持不变
    flashMolecule(0xFFFFFF, 500);
    showSymmetryElements('none');
    showInfoMessage("恒等操作 (E): 分子保持不变，所有原子位置不变。这是任何分子都具有的基本对称性。");
}

// 执行旋转操作
function performRotationOperation(type, order) {
    // 显示对应的旋转轴
    showSymmetryElements('axis', type);
    
    // 计算旋转角度
    const angle = (2 * Math.PI) / order;
    
    // 执行旋转动画
    let startTime = Date.now();
    const duration = 2000;
    const startRotation = moleculeGroup.rotation.clone();
    
    function animateRotation() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easedProgress = easeInOutCubic(progress);
        const currentAngle = angle * easedProgress;
        
        // 绕Y轴旋转
        moleculeGroup.rotation.y = startRotation.y + currentAngle;
        
        if (progress < 1) {
            requestAnimationFrame(animateRotation);
        } else {
            // 动画完成后短暂暂停，然后隐藏对称元素
            setTimeout(() => {
                hideSymmetryElements();
            }, 1000);
        }
    }
    
    animateRotation();
    
    // 显示提示信息
    const degree = Math.round(angle * 180 / Math.PI);
    showInfoMessage(`旋转操作 (C${order}): 绕主轴旋转${degree}度。旋转后分子构型与原构型不可区分。`);
}

// 执行反射操作
function performReflectionOperation(type) {
    // 显示对应的反射面
    showSymmetryElements('plane', type);
    
    // 执行反射动画
    let startTime = Date.now();
    const duration = 1500;
    
    function animateReflection() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easedProgress = easeInOutCubic(progress);
        
        // 模拟反射效果：缩放X轴
        if (type === 'vertical' || type === 'dihedral') {
            const scale = 1 - 2 * easedProgress;
            moleculeGroup.scale.x = scale > 0 ? scale : -scale;
        } else if (type === 'horizontal') {
            const scale = 1 - 2 * easedProgress;
            moleculeGroup.scale.y = scale > 0 ? scale : -scale;
        }
        
        if (progress < 1) {
            requestAnimationFrame(animateReflection);
        } else {
            // 动画完成后短暂暂停，然后恢复
            setTimeout(() => {
                moleculeGroup.scale.set(1, 1, 1);
                hideSymmetryElements();
            }, 1000);
        }
    }
    
    animateReflection();
    
    // 显示提示信息
    const symbol = type === 'horizontal' ? 'σ_h' : type === 'vertical' ? 'σ_v' : 'σ_d';
    const description = type === 'horizontal' ? '水平反射面' : 
                       type === 'vertical' ? '垂直反射面' : '对角反射面';
    showInfoMessage(`反射操作 (${symbol}): 相对于${description}进行镜像反射。分子与其镜像完全重合。`);
}

// 执行反演操作
function performInversionOperation() {
    // 显示对称中心
    showSymmetryElements('center');
    
    // 执行反演动画
    let startTime = Date.now();
    const duration = 2000;
    
    function animateInversion() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easedProgress = easeInOutCubic(progress);
        
        // 通过缩放实现反演效果
        const scale = 1 - 2 * easedProgress;
        moleculeGroup.scale.set(scale, scale, scale);
        
        if (progress < 1) {
            requestAnimationFrame(animateInversion);
        } else {
            // 动画完成后短暂暂停，然后恢复
            setTimeout(() => {
                moleculeGroup.scale.set(1, 1, 1);
                hideSymmetryElements();
            }, 1000);
        }
    }
    
    animateInversion();
    
    showInfoMessage("反演操作 (i): 通过分子中心进行反演，每个原子通过中心映射到对面位置。如果分子具有对称中心，则反演后分子不变。");
}

// 执行旋转反射操作
function performRotationReflectionOperation(type) {
    // 显示对应的轴和平面
    showSymmetryElements('rotation-reflection', type);
    
    // 执行旋转反射动画
    let startTime = Date.now();
    const duration = 2500;
    const startRotation = moleculeGroup.rotation.clone();
    const order = type === 'S4' ? 4 : 6;
    const angle = (2 * Math.PI) / order;
    
    function animateRotationReflection() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easedProgress = easeInOutCubic(progress);
        
        if (progress < 0.6) {
            // 前半段：旋转
            const currentAngle = angle * (easedProgress * (1/0.6));
            moleculeGroup.rotation.y = startRotation.y + currentAngle;
        } else if (progress < 1) {
            // 后半段：反射
            const reflectionProgress = (progress - 0.6) / 0.4;
            const scale = 1 - 2 * reflectionProgress;
            moleculeGroup.scale.y = scale > 0 ? scale : -scale;
        }
        
        if (progress < 1) {
            requestAnimationFrame(animateRotationReflection);
        } else {
            // 动画完成后短暂暂停，然后恢复
            setTimeout(() => {
                moleculeGroup.rotation.copy(startRotation);
                moleculeGroup.scale.set(1, 1, 1);
                hideSymmetryElements();
            }, 1000);
        }
    }
    
    animateRotationReflection();
    
    const degree = order === 4 ? 90 : 60;
    showInfoMessage(`旋转反射操作 (${type}): 先旋转${degree}度，然后相对于垂直平面反射。这是旋转与反射的组合操作。`);
}

// 显示对称元素
function showSymmetryElements(type, subtype) {
    // 隐藏所有对称元素
    hideSymmetryElements();
    
    // 根据类型显示对应的对称元素
    symmetryElements.children.forEach(child => {
        if (type === 'none') {
            // 不显示任何元素
        } else if (type === 'axis') {
            // 显示旋转轴
            if (child.material && child.material.color) {
                const color = child.material.color.getHex();
                if (subtype === 'C2' && color === 0xFF0000) child.visible = true;
                else if (subtype === 'C3' && color === 0x00FF00) child.visible = true;
                else if (subtype === 'C4' && color === 0x0000FF) child.visible = true;
                else if (subtype === 'C6' && color === 0xFFA500) child.visible = true;
            }
        } else if (type === 'plane') {
            // 显示反射面
            if (child.material && child.material.color) {
                const color = child.material.color.getHex();
                if (subtype === 'horizontal' && color === 0xFFA500) child.visible = true;
                else if (subtype === 'vertical' && color === 0x00FF00) child.visible = true;
                else if (subtype === 'dihedral' && color === 0x9B59B6) child.visible = true;
            }
        } else if (type === 'center') {
            // 显示对称中心
            if (child.geometry && child.geometry.type === 'SphereGeometry') {
                child.visible = true;
            }
        } else if (type === 'rotation-reflection') {
            // 显示旋转反射元素
            child.visible = true;
        }
    });
}

// 隐藏所有对称元素
function hideSymmetryElements() {
    symmetryElements.children.forEach(child => {
        child.visible = false;
    });
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
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
        font-size: 14px;
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
    
    // 5秒后移除提示
    setTimeout(() => {
        infoDiv.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            if (infoDiv.parentNode) {
                document.body.removeChild(infoDiv);
            }
        }, 300);
    }, 5000);
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
            showInfoMessage(`已加载 ${molecules[currentMolecule].name} 分子模型`);
        });
    });
    
    // 恒等操作按钮
    document.getElementById('identityBtn').addEventListener('click', performIdentityOperation);
    
    // 旋转操作按钮
    document.querySelectorAll('[data-rotation]').forEach(btn => {
        btn.addEventListener('click', function() {
            const rotationType = this.getAttribute('data-rotation');
            let order = 2;
            
            switch(rotationType) {
                case 'C2': order = 2; break;
                case 'C3': order = 3; break;
                case 'C4': order = 4; break;
                case 'C6': order = 6; break;
            }
            
            performRotationOperation(rotationType, order);
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
        camera.position.set(10, 8, 10);
        camera.lookAt(0, 0, 0);
        controls.reset();
        
        // 重置分子
        moleculeGroup.rotation.set(0, 0, 0);
        moleculeGroup.scale.set(1, 1, 1);
        moleculeGroup.position.set(0, 0, 0);
        
        // 隐藏所有对称元素
        hideSymmetryElements();
        
        // 重置自动旋转
        isAutoRotating = false;
        document.getElementById('autoRotateBtn').classList.remove('active');
        document.getElementById('autoRotateBtn').innerHTML = '<i class="fas fa-sync-alt"></i> 自动旋转';
        
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
        
        // 更新标签显示
        updateAtomLabels();
    });
}

// 更新原子标签
function updateAtomLabels() {
    // 移除所有现有标签
    atomSprites.forEach(sprite => {
        moleculeGroup.remove(sprite);
    });
    atomSprites = [];
    
    // 如果需要显示标签，重新创建
    if (showLabels) {
        const molecule = molecules[currentMolecule];
        molecule.atoms.forEach((atom, index) => {
            createAtomLabel(atom.element, atom.x, atom.y, atom.z, index);
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 添加CSS样式
    const style = document.createElement('style');
    style.textContent = `
        .symmetry-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 0.85rem;
        }
        
        .symmetry-table th, .symmetry-table td {
            border: 1px solid var(--border);
            padding: 6px 10px;
            text-align: left;
        }
        
        .symmetry-table th {
            background-color: var(--light);
            font-weight: 600;
        }
        
        .symmetry-table tr:nth-child(even) {
            background-color: rgba(0,0,0,0.02);
        }
        
        .group-theory {
            margin-bottom: 25px;
            border-left: 4px solid #3498db;
        }
        
        .group-theory h5 {
            color: #3498db;
        }
    `;
    document.head.appendChild(style);
    
    // 初始化
    init();
    initEventListeners();
    
    // 显示欢迎信息
    setTimeout(() => {
        showInfoMessage("欢迎使用分子对称性与群论基础演示系统！<br>点击左侧按钮开始探索分子对称操作和群论概念。");
    }, 1500);
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
