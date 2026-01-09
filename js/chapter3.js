// chapter3.js - 分子对称性与群论基础交互演示（专业优化版）
// 采用模块化设计、性能优化和现代JavaScript实践

/**
 * =============================================
 * 一、配置与常量声明（模块化配置）
 * =============================================
 */
const CONFIG = {
    // 视觉配置
    SCENE: {
        BACKGROUND_COLOR: 0xf8f9fa,
        CAMERA: {
            FOV: 45,
            NEAR: 0.1,
            FAR: 1000,
            INITIAL_POSITION: { x: 10, y: 8, z: 10 }
        },
        LIGHT: {
            AMBIENT: { color: 0xffffff, intensity: 0.6 },
            DIRECTIONAL: { color: 0xffffff, intensity: 0.8, position: { x: 10, y: 15, z: 10 } }
        },
        AXES_HELPER_SIZE: 5,
        AXES_HELPER_POSITION_Y: 0.1
    },
    
    // 原子视觉属性
    ATOM_PROPERTIES: {
        COLORS: {
            'C': 0x808080,  // 碳 - 灰色
            'H': 0xFFCCCC,  // 氢 - 浅红色
            'O': 0xFF0000,  // 氧 - 红色
            'N': 0x0000FF,  // 氮 - 蓝色
            'Cl': 0x00FF00, // 氯 - 绿色
            'Br': 0x8B4513  // 溴 - 棕色
        },
        RADII: {
            'C': 0.7,
            'H': 0.3,
            'O': 0.7,
            'N': 0.7,
            'Cl': 0.9,
            'Br': 1.0
        },
        GEOMETRY_QUALITY: { widthSegments: 32, heightSegments: 32 }
    },
    
    // 动画配置
    ANIMATION: {
        BASE_SPEED: 0.005,
        DURATIONS: {
            IDENTITY_FLASH: 500,
            ROTATION: 2000,
            REFLECTION: 1500,
            INVERSION: 2000,
            ROTATION_REFLECTION: 2500
        },
        EASING: 'cubic'
    },
    
    // UI配置
    UI: {
        INFO_MESSAGE: {
            DISPLAY_TIME: 5000,
            POSITION: { top: 20, right: 20 },
            MAX_WIDTH: 400
        },
        LABEL: {
            CANVAS_SIZE: { width: 128, height: 128 },
            FONT: 'bold 60px Arial',
            SCALE: { x: 2, y: 2, z: 1 }
        }
    },
    
    // 对称元素颜色编码
    SYMMETRY_COLORS: {
        AXES: {
            'C2': 0xFF0000,    // 红色
            'C3': 0x00FF00,    // 绿色
            'C4': 0x0000FF,    // 蓝色
            'C6': 0xFFA500,    // 橙色
            'DEFAULT': 0x9B59B6 // 紫色
        },
        PLANES: {
            'σh': 0xFFA500,    // 橙色
            'σv': 0x00FF00,    // 绿色
            'σd': 0x9B59B6,    // 紫色
            'DEFAULT': 0x3498DB // 蓝色
        },
        CENTER: 0xFF00FF        // 洋红色
    }
};

/**
 * =============================================
 * 二、核心数据模型（数据与逻辑分离）
 * =============================================
 */
class MolecularData {
    static molecules = {
        methane: this.createMethane(),
        benzene: this.createBenzene(),
        water: this.createWater(),
        ammonia: this.createAmmonia()
    };

    static groupTheoryInfo = {
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

    static createMethane() {
        return {
            name: '甲烷 (CH₄)',
            symmetryGroup: 'T_d',
            pointGroup: '四面体群',
            symmetryElements: {
                E: 1, C3: 8, C2: 3, σd: 6, S4: 6, i: 1
            },
            atoms: [
                { element: 'C', x: 0, y: 0, z: 0 },
                { element: 'H', x: 0, y: 1.09, z: 0 },
                { element: 'H', x: 1.03, y: -0.36, z: 0 },
                { element: 'H', x: -0.52, y: -0.36, z: 0.89 },
                { element: 'H', x: -0.52, y: -0.36, z: -0.89 }
            ],
            bonds: [
                { from: 0, to: 1 }, { from: 0, to: 2 },
                { from: 0, to: 3 }, { from: 0, to: 4 }
            ]
        };
    }

    static createBenzene() {
        return {
            name: '苯 (C₆H₆)',
            symmetryGroup: 'D_6h',
            pointGroup: '六角双锥群',
            symmetryElements: {
                E: 1, C6: 1, C3: 2, C2: 7, σh: 1,
                σv: 6, σd: 6, i: 1, S6: 2
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
            ]
        };
    }

    static createWater() {
        return {
            name: '水 (H₂O)',
            symmetryGroup: 'C_2v',
            pointGroup: '二面体群',
            symmetryElements: { E: 1, C2: 1, σv: 2 },
            atoms: [
                { element: 'O', x: 0, y: 0, z: 0.12 },
                { element: 'H', x: 0.76, y: 0, z: -0.48 },
                { element: 'H', x: -0.76, y: 0, z: -0.48 }
            ],
            bonds: [
                { from: 0, to: 1 },
                { from: 0, to: 2 }
            ]
        };
    }

    static createAmmonia() {
        return {
            name: '氨 (NH₃)',
            symmetryGroup: 'C_3v',
            pointGroup: '三角锥群',
            symmetryElements: { E: 1, C3: 2, σv: 3 },
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
            ]
        };
    }

    // 对称操作符号映射
    static symmetrySymbols = {
        'E': '恒等操作 (E)',
        'C2': '二次轴 (C₂)',
        'C3': '三次轴 (C₃)',
        'C4': '四次轴 (C₄)',
        'C6': '六次轴 (C₆)',
        'σh': '水平反射面 (σₕ)',
        'σv': '垂直反射面 (σᵥ)',
        'σd': '对角反射面 (σ_d)',
        'i': '反演中心 (i)',
        'S4': '四次旋转反射轴 (S₄)',
        'S6': '六次旋转反射轴 (S₆)'
    };
}

/**
 * =============================================
 * 三、核心应用类（面向对象设计）
 * =============================================
 */
class MolecularSymmetryApp {
    constructor() {
        // Three.js核心对象
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // 场景组
        this.moleculeGroup = new THREE.Group();
        this.symmetryElements = new THREE.Group();
        
        // 状态管理
        this.currentMolecule = 'methane';
        this.isAutoRotating = false;
        this.showLabels = false;
        this.animationId = null;
        this.activeAnimation = null;
        
        // 缓存
        this.atomSprites = [];
        this.originalMaterials = new WeakMap();
        this.labelCache = new Map();
        
        // 初始化
        this.init();
    }

    /**
     * 初始化Three.js场景
     */
    init() {
        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.initControls();
        this.initLighting();
        this.initHelpers();
        this.initEventListeners();
        
        // 加载初始分子
        this.loadMolecule(this.currentMolecule);
        
        // 开始动画循环
        this.animate();
        
        // 显示欢迎信息
        setTimeout(() => this.showInfoMessage(
            "欢迎使用分子对称性与群论基础演示系统！<br>点击左侧按钮开始探索分子对称操作和群论概念。"
        ), 1500);
    }

    /**
     * 初始化场景
     */
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.SCENE.BACKGROUND_COLOR);
        this.scene.add(this.moleculeGroup);
        this.scene.add(this.symmetryElements);
    }

    /**
     * 初始化相机
     */
    initCamera() {
        const canvas = document.getElementById('moleculeCanvas');
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.SCENE.CAMERA.FOV,
            canvas.offsetWidth / canvas.offsetHeight,
            CONFIG.SCENE.CAMERA.NEAR,
            CONFIG.SCENE.CAMERA.FAR
        );
        
        this.camera.position.set(
            CONFIG.SCENE.CAMERA.INITIAL_POSITION.x,
            CONFIG.SCENE.CAMERA.INITIAL_POSITION.y,
            CONFIG.SCENE.CAMERA.INITIAL_POSITION.z
        );
        this.camera.lookAt(0, 0, 0);
    }

    /**
     * 初始化渲染器
     */
    initRenderer() {
        const canvas = document.getElementById('moleculeCanvas');
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        canvas.appendChild(this.renderer.domElement);
    }

    /**
     * 初始化轨道控制
     */
    initControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 30;
        this.controls.screenSpacePanning = true;
    }

    /**
     * 初始化光照
     */
    initLighting() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(
            CONFIG.SCENE.LIGHT.AMBIENT.color,
            CONFIG.SCENE.LIGHT.AMBIENT.intensity
        );
        this.scene.add(ambientLight);
        
        // 定向光
        const directionalLight = new THREE.DirectionalLight(
            CONFIG.SCENE.LIGHT.DIRECTIONAL.color,
            CONFIG.SCENE.LIGHT.DIRECTIONAL.intensity
        );
        directionalLight.position.set(
            CONFIG.SCENE.LIGHT.DIRECTIONAL.position.x,
            CONFIG.SCENE.LIGHT.DIRECTIONAL.position.y,
            CONFIG.SCENE.LIGHT.DIRECTIONAL.position.z
        );
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }

    /**
     * 初始化辅助工具
     */
    initHelpers() {
        // 坐标轴
        const axesHelper = new THREE.AxesHelper(CONFIG.SCENE.AXES_HELPER_SIZE);
        axesHelper.position.y = CONFIG.SCENE.AXES_HELPER_POSITION_Y;
        this.scene.add(axesHelper);
    }

    /**
     * 加载分子模型
     */
    loadMolecule(moleculeName) {
        // 清理现有分子和动画
        this.cleanupCurrentMolecule();
        this.cancelActiveAnimation();
        
        // 更新当前分子
        this.currentMolecule = moleculeName;
        const molecule = MolecularData.molecules[moleculeName];
        
        if (!molecule) {
            console.error(`未找到分子: ${moleculeName}`);
            return;
        }
        
        // 创建原子和化学键
        this.createAtoms(molecule);
        this.createBonds(molecule);
        
        // 重置视图
        this.resetView();
        
        // 更新群论信息
        this.updateGroupTheoryInfo();
        
        // 显示提示信息
        this.showInfoMessage(`已加载 ${molecule.name} 分子模型`);
    }

    /**
     * 创建原子
     */
    createAtoms(molecule) {
        molecule.atoms.forEach((atom, index) => {
            const radius = CONFIG.ATOM_PROPERTIES.RADII[atom.element] || 0.5;
            const geometry = new THREE.SphereGeometry(
                radius,
                CONFIG.ATOM_PROPERTIES.GEOMETRY_QUALITY.widthSegments,
                CONFIG.ATOM_PROPERTIES.GEOMETRY_QUALITY.heightSegments
            );
            
            const material = new THREE.MeshPhongMaterial({ 
                color: CONFIG.ATOM_PROPERTIES.COLORS[atom.element] || 0x888888,
                shininess: 30,
                transparent: true,
                opacity: 0.95
            });
            
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(atom.x, atom.y, atom.z);
            sphere.castShadow = true;
            sphere.receiveShadow = true;
            sphere.userData = { type: 'atom', element: atom.element, index };
            
            this.moleculeGroup.add(sphere);
            
            // 创建原子标签
            if (this.showLabels) {
                this.createAtomLabel(atom.element, atom.x, atom.y, atom.z, radius);
            }
        });
    }

    /**
     * 创建化学键
     */
    createBonds(molecule) {
        molecule.bonds.forEach(bond => {
            const atom1 = molecule.atoms[bond.from];
            const atom2 = molecule.atoms[bond.to];
            
            // 计算键的几何参数
            const start = new THREE.Vector3(atom1.x, atom1.y, atom1.z);
            const end = new THREE.Vector3(atom2.x, atom2.y, atom2.z);
            const direction = new THREE.Vector3().subVectors(end, start);
            const length = direction.length();
            
            // 调整键的起始和结束位置（考虑原子半径）
            const radius1 = CONFIG.ATOM_PROPERTIES.RADII[atom1.element] || 0.5;
            const radius2 = CONFIG.ATOM_PROPERTIES.RADII[atom2.element] || 0.5;
            
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
                shininess: 20,
                transparent: true,
                opacity: 0.9
            });
            
            const cylinder = new THREE.Mesh(geometry, material);
            const midPoint = new THREE.Vector3().addVectors(startAdjusted, endAdjusted).multiplyScalar(0.5);
            
            cylinder.position.copy(midPoint);
            cylinder.lookAt(endAdjusted);
            cylinder.rotateX(Math.PI / 2);
            cylinder.castShadow = true;
            cylinder.receiveShadow = true;
            cylinder.userData = { type: 'bond', from: bond.from, to: bond.to };
            
            this.moleculeGroup.add(cylinder);
        });
    }

    /**
     * 创建原子标签（带缓存）
     */
    createAtomLabel(element, x, y, z, radius) {
        // 检查缓存
        let texture = this.labelCache.get(element);
        
        if (!texture) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const { width, height } = CONFIG.UI.LABEL.CANVAS_SIZE;
            
            canvas.width = width;
            canvas.height = height;
            
            // 绘制背景
            context.fillStyle = 'rgba(255, 255, 255, 0.85)';
            context.fillRect(0, 0, width, height);
            
            // 绘制原子符号
            context.fillStyle = '#2C3E50';
            context.font = CONFIG.UI.LABEL.FONT;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(element, width / 2, height / 2);
            
            // 创建纹理并缓存
            texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            this.labelCache.set(element, texture);
        }
        
        const material = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true,
            opacity: 0.9,
            depthTest: false
        });
        
        const sprite = new THREE.Sprite(material);
        sprite.position.set(x, y + radius + 0.5, z);
        sprite.scale.set(
            CONFIG.UI.LABEL.SCALE.x,
            CONFIG.UI.LABEL.SCALE.y,
            CONFIG.UI.LABEL.SCALE.z
        );
        
        this.atomSprites.push(sprite);
        this.moleculeGroup.add(sprite);
    }

    /**
     * 更新群论信息显示
     */
    updateGroupTheoryInfo() {
        const molecule = MolecularData.molecules[this.currentMolecule];
        const groupInfo = MolecularData.groupTheoryInfo[molecule.symmetryGroup];
        
        if (!groupInfo) return;
        
        // 创建对称元素表格
        let symmetryTable = '<table class="symmetry-table"><tr><th>对称操作</th><th>数量</th></tr>';
        
        Object.entries(molecule.symmetryElements).forEach(([key, value]) => {
            const symbol = MolecularData.symmetrySymbols[key] || key;
            symmetryTable += `<tr><td>${symbol}</td><td>${value}</td></tr>`;
        });
        
        symmetryTable += '</table>';
        
        // 更新或创建信息面板
        let infoPanel = document.querySelector('.info-panel.group-theory');
        
        if (!infoPanel) {
            infoPanel = document.createElement('div');
            infoPanel.className = 'info-panel group-theory';
            document.querySelector('.panel-content').prepend(infoPanel);
        }
        
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

    /**
     * 执行恒等操作
     */
    performIdentityOperation() {
        this.cancelActiveAnimation();
        this.hideSymmetryElements();
        this.flashMolecule(0xFFFFFF, CONFIG.ANIMATION.DURATIONS.IDENTITY_FLASH);
        
        this.showInfoMessage(
            "恒等操作 (E): 分子保持不变，所有原子位置不变。这是任何分子都具有的基本对称性。"
        );
    }

    /**
     * 执行旋转操作
     */
    performRotationOperation(type, order) {
        this.cancelActiveAnimation();
        this.showSymmetryElements('axis', type);
        
        const startRotation = this.moleculeGroup.rotation.clone();
        const angle = (2 * Math.PI) / order;
        const duration = CONFIG.ANIMATION.DURATIONS.ROTATION;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = this.easeInOutCubic(progress);
            
            this.moleculeGroup.rotation.y = startRotation.y + angle * easedProgress;
            
            if (progress < 1) {
                this.activeAnimation = requestAnimationFrame(animate);
            } else {
                setTimeout(() => this.hideSymmetryElements(), 1000);
                this.activeAnimation = null;
            }
        };
        
        this.activeAnimation = requestAnimationFrame(animate);
        
        const degree = Math.round(angle * 180 / Math.PI);
        this.showInfoMessage(
            `旋转操作 (C${order}): 绕主轴旋转${degree}度。旋转后分子构型与原构型不可区分。`
        );
    }

    /**
     * 执行反射操作
     */
    performReflectionOperation(type) {
        this.cancelActiveAnimation();
        this.showSymmetryElements('plane', type);
        
        const duration = CONFIG.ANIMATION.DURATIONS.REFLECTION;
        const startTime = performance.now();
        const scaleAxis = type === 'horizontal' ? 'y' : 'x';
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = this.easeInOutCubic(progress);
            
            const scale = 1 - 2 * easedProgress;
            this.moleculeGroup.scale[scaleAxis] = Math.abs(scale);
            
            if (progress < 1) {
                this.activeAnimation = requestAnimationFrame(animate);
            } else {
                setTimeout(() => {
                    this.moleculeGroup.scale.set(1, 1, 1);
                    this.hideSymmetryElements();
                }, 1000);
                this.activeAnimation = null;
            }
        };
        
        this.activeAnimation = requestAnimationFrame(animate);
        
        const symbol = type === 'horizontal' ? 'σ_h' : type === 'vertical' ? 'σ_v' : 'σ_d';
        const description = type === 'horizontal' ? '水平反射面' : 
                          type === 'vertical' ? '垂直反射面' : '对角反射面';
        
        this.showInfoMessage(
            `反射操作 (${symbol}): 相对于${description}进行镜像反射。分子与其镜像完全重合。`
        );
    }

    /**
     * 执行反演操作
     */
    performInversionOperation() {
        this.cancelActiveAnimation();
        this.showSymmetryElements('center');
        
        const duration = CONFIG.ANIMATION.DURATIONS.INVERSION;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = this.easeInOutCubic(progress);
            
            const scale = 1 - 2 * easedProgress;
            this.moleculeGroup.scale.set(scale, scale, scale);
            
            if (progress < 1) {
                this.activeAnimation = requestAnimationFrame(animate);
            } else {
                setTimeout(() => {
                    this.moleculeGroup.scale.set(1, 1, 1);
                    this.hideSymmetryElements();
                }, 1000);
                this.activeAnimation = null;
            }
        };
        
        this.activeAnimation = requestAnimationFrame(animate);
        
        this.showInfoMessage(
            "反演操作 (i): 通过分子中心进行反演，每个原子通过中心映射到对面位置。如果分子具有对称中心，则反演后分子不变。"
        );
    }

    /**
     * 分子闪光效果
     */
    flashMolecule(color, duration) {
        // 保存原始材质颜色
        const originalColors = [];
        
        this.moleculeGroup.traverse(child => {
            if (child.isMesh && child.material) {
                originalColors.push({
                    mesh: child,
                    color: child.material.color.clone()
                });
                child.material.color.set(color);
            }
        });
        
        // 恢复原始颜色
        setTimeout(() => {
            originalColors.forEach(item => {
                item.mesh.material.color.copy(item.color);
            });
        }, duration);
    }

    /**
     * 显示对称元素
     */
    showSymmetryElements(type, subtype = null) {
        this.hideSymmetryElements();
        
        this.symmetryElements.children.forEach(child => {
            if (!child.material || !child.material.color) return;
            
            const color = child.material.color.getHex();
            let shouldShow = false;
            
            switch (type) {
                case 'axis':
                    const axisColors = CONFIG.SYMMETRY_COLORS.AXES;
                    shouldShow = subtype && axisColors[subtype] === color;
                    break;
                    
                case 'plane':
                    const planeColors = CONFIG.SYMMETRY_COLORS.PLANES;
                    shouldShow = subtype && planeColors[subtype] === color;
                    break;
                    
                case 'center':
                    shouldShow = color === CONFIG.SYMMETRY_COLORS.CENTER;
                    break;
                    
                case 'all':
                    shouldShow = true;
                    break;
            }
            
            child.visible = shouldShow;
        });
    }

    /**
     * 隐藏所有对称元素
     */
    hideSymmetryElements() {
        this.symmetryElements.children.forEach(child => {
            child.visible = false;
        });
    }

    /**
     * 显示提示信息
     */
    showInfoMessage(message) {
        // 移除现有提示
        const existing = document.querySelector('.molecule-info-message');
        if (existing) existing.remove();
        
        // 创建新提示
        const infoDiv = document.createElement('div');
        infoDiv.className = 'molecule-info-message';
        
        Object.assign(infoDiv.style, {
            position: 'fixed',
            top: `${CONFIG.UI.INFO_MESSAGE.POSITION.top}px`,
            right: `${CONFIG.UI.INFO_MESSAGE.POSITION.right}px`,
            background: 'linear-gradient(135deg, #3498db, #2c3e50)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            zIndex: '1000',
            maxWidth: `${CONFIG.UI.INFO_MESSAGE.MAX_WIDTH}px`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'slideIn 0.3s ease-out',
            fontSize: '14px',
            backdropFilter: 'blur(10px)'
        });
        
        infoDiv.innerHTML = `<i class="fas fa-info-circle" style="margin-right: 8px;"></i>${message}`;
        document.body.appendChild(infoDiv);
        
        // 自动移除
        setTimeout(() => {
            if (infoDiv.parentNode) {
                infoDiv.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => infoDiv.remove(), 300);
            }
        }, CONFIG.UI.INFO_MESSAGE.DISPLAY_TIME);
    }

    /**
     * 缓动函数
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 分子选择
        document.querySelectorAll('.molecule-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.molecule-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                option.classList.add('active');
                this.loadMolecule(option.dataset.molecule);
            });
        });
        
        // 对称操作按钮
        this.bindOperationButtons();
        
        // 模型控制按钮
        this.bindControlButtons();
        
        // 窗口大小调整
        window.addEventListener('resize', () => this.onWindowResize());
        
        // 页面卸载
        window.addEventListener('beforeunload', () => this.cleanup());
    }

    /**
     * 绑定操作按钮
     */
    bindOperationButtons() {
        // 恒等操作
        document.getElementById('identityBtn')?.addEventListener('click', 
            () => this.performIdentityOperation());
        
        // 旋转操作
        document.querySelectorAll('[data-rotation]').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.rotation;
                const order = parseInt(type.substring(1)) || 2;
                this.performRotationOperation(type, order);
            });
        });
        
        // 反射操作
        document.querySelectorAll('[data-reflection]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.performReflectionOperation(btn.dataset.reflection);
            });
        });
        
        // 反演操作
        document.getElementById('inversionBtn')?.addEventListener('click', 
            () => this.performInversionOperation());
        
        // 旋转反射操作
        document.querySelectorAll('[data-rotation-reflection]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.performRotationReflectionOperation(btn.dataset.rotationReflection);
            });
        });
    }

    /**
     * 绑定控制按钮
     */
    bindControlButtons() {
        // 重置视图
        document.getElementById('resetBtn')?.addEventListener('click', () => {
            this.resetView();
            this.showInfoMessage("已重置视图和分子位置");
        });
        
        // 自动旋转
        document.getElementById('autoRotateBtn')?.addEventListener('click', () => {
            this.isAutoRotating = !this.isAutoRotating;
            const btn = document.getElementById('autoRotateBtn');
            btn.classList.toggle('active');
            btn.innerHTML = this.isAutoRotating ? 
                '<i class="fas fa-pause"></i> 停止旋转' : 
                '<i class="fas fa-sync-alt"></i> 自动旋转';
        });
        
        // 显示/隐藏标签
        document.getElementById('toggleLabelsBtn')?.addEventListener('click', () => {
            this.showLabels = !this.showLabels;
            const btn = document.getElementById('toggleLabelsBtn');
            btn.classList.toggle('active');
            btn.innerHTML = this.showLabels ? 
                '<i class="fas fa-eye-slash"></i> 隐藏标签' : 
                '<i class="fas fa-eye"></i> 显示标签';
            
            this.updateAtomLabels();
        });
    }

    /**
     * 更新原子标签
     */
    updateAtomLabels() {
        // 移除现有标签
        this.atomSprites.forEach(sprite => {
            this.moleculeGroup.remove(sprite);
        });
        this.atomSprites = [];
        
        // 如果需要，重新创建标签
        if (this.showLabels) {
            const molecule = MolecularData.molecules[this.currentMolecule];
            molecule.atoms.forEach((atom, index) => {
                const radius = CONFIG.ATOM_PROPERTIES.RADII[atom.element] || 0.5;
                this.createAtomLabel(atom.element, atom.x, atom.y, atom.z, radius);
            });
        }
    }

    /**
     * 重置视图
     */
    resetView() {
        // 重置相机
        this.camera.position.set(
            CONFIG.SCENE.CAMERA.INITIAL_POSITION.x,
            CONFIG.SCENE.CAMERA.INITIAL_POSITION.y,
            CONFIG.SCENE.CAMERA.INITIAL_POSITION.z
        );
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
        
        // 重置分子
        this.moleculeGroup.rotation.set(0, 0, 0);
        this.moleculeGroup.scale.set(1, 1, 1);
        this.moleculeGroup.position.set(0, 0, 0);
        
        // 停止自动旋转
        this.isAutoRotating = false;
        const rotateBtn = document.getElementById('autoRotateBtn');
        if (rotateBtn) {
            rotateBtn.classList.remove('active');
            rotateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> 自动旋转';
        }
        
        // 隐藏对称元素
        this.hideSymmetryElements();
    }

    /**
     * 窗口大小调整处理
     */
    onWindowResize() {
        const canvasContainer = document.getElementById('moleculeCanvas');
        
        this.camera.aspect = canvasContainer.offsetWidth / canvasContainer.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
    }

    /**
     * 动画循环
     */
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // 自动旋转
        if (this.isAutoRotating) {
            this.moleculeGroup.rotation.y += CONFIG.ANIMATION.BASE_SPEED;
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * 取消活跃动画
     */
    cancelActiveAnimation() {
        if (this.activeAnimation) {
            cancelAnimationFrame(this.activeAnimation);
            this.activeAnimation = null;
        }
    }

    /**
     * 清理当前分子
     */
    cleanupCurrentMolecule() {
        // 清理分子组
        while (this.moleculeGroup.children.length > 0) {
            const child = this.moleculeGroup.children[0];
            this.disposeThreeObject(child);
            this.moleculeGroup.remove(child);
        }
        
        // 清理对称元素
        while (this.symmetryElements.children.length > 0) {
            const child = this.symmetryElements.children[0];
            this.disposeThreeObject(child);
            this.symmetryElements.remove(child);
        }
        
        // 清理标签缓存
        this.atomSprites.forEach(sprite => {
            if (sprite.material) sprite.material.dispose();
            if (sprite.geometry) sprite.geometry.dispose();
        });
        this.atomSprites = [];
    }

    /**
     * 释放Three.js对象资源
     */
    disposeThreeObject(object) {
        if (object.geometry) object.geometry.dispose();
        
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material.dispose();
            }
        }
        
        if (object.texture) object.texture.dispose();
    }

    /**
     * 全面清理资源
     */
    cleanup() {
        // 停止动画
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.cancelActiveAnimation();
        
        // 清理场景
        this.cleanupCurrentMolecule();
        
        // 清理渲染器
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }
        
        // 清理标签缓存
        this.labelCache.forEach(texture => texture.dispose());
        this.labelCache.clear();
        
        // 移除事件监听器
        window.removeEventListener('resize', () => this.onWindowResize());
    }
}

/**
 * =============================================
 * 四、样式与初始化（分离关注点）
 * =============================================
 */
class StyleManager {
    static addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 对称元素表格 */
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
            
            /* 群论信息面板 */
            .info-panel.group-theory {
                margin-bottom: 25px;
                border-left: 4px solid #3498db;
                padding-left: 15px;
                background: linear-gradient(135deg, rgba(52, 152, 219, 0.05), transparent);
                border-radius: 8px;
                padding: 15px;
            }
            
            .group-theory h5 {
                color: #3498db;
                margin-top: 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            /* 动画效果 */
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            /* 性能优化 */
            .molecule-info-message {
                will-change: transform, opacity;
                backface-visibility: hidden;
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * =============================================
 * 五、应用初始化
 * =============================================
 */
class AppInitializer {
    static init() {
        // 添加样式
        StyleManager.addStyles();
        
        // 检查Three.js依赖
        if (typeof THREE === 'undefined') {
            console.error('Three.js未加载！请确保在加载此脚本前引入Three.js库。');
            return;
        }
        
        // 初始化应用
        try {
            window.molecularSymmetryApp = new MolecularSymmetryApp();
            console.log('分子对称性应用已成功初始化');
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showError('初始化失败，请刷新页面重试。');
        }
    }
    
    static showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #e74c3c;
            color: white;
            padding: 20px 30px;
            border-radius: 8px;
            z-index: 9999;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px;"></i>
            <h3>错误</h3>
            <p>${message}</p>
        `;
        document.body.appendChild(errorDiv);
    }
}

// DOM加载完成后初始化应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AppInitializer.init());
} else {
    AppInitializer.init();
}

// 导出供开发工具使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MolecularSymmetryApp, MolecularData, CONFIG };
}
