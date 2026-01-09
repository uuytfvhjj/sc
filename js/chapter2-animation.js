// 第2章：分子结构与化学键理论动画
document.addEventListener('DOMContentLoaded', function() {
    // 获取canvas元素
    const canvas = document.getElementById('moleculeCanvas');
    
    // 创建Three.js场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    
    // 创建相机
    const camera = new THREE.PerspectiveCamera(
        75,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 15;
    camera.position.y = 5;
    
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    
    // 材料定义
    const oxygenMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xe74c3c,  // 红色 - 氧原子
        shininess: 100,
        emissive: 0x330000
    });
    
    const hydrogenMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x3498db,  // 蓝色 - 氢原子
        shininess: 100,
        emissive: 0x001133
    });
    
    const carbonMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x2c3e50,  // 深灰色 - 碳原子
        shininess: 100,
        emissive: 0x111111
    });
    
    const nitrogenMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x9b59b6,  // 紫色 - 氮原子
        shininess: 100,
        emissive: 0x220033
    });
    
    const bondMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x95a5a6,  // 灰色 - 化学键
        shininess: 30
    });
    
    // 创建球体几何体（用于原子）
    const atomGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const smallAtomGeometry = new THREE.SphereGeometry(0.3, 24, 24);
    
    // 创建圆柱体几何体（用于化学键）
    const bondGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
    
    // 存储当前分子模型和原子标签
    let currentMolecule = null;
    let atomLabels = [];
    let showBonds = true;
    let showLabels = true;
    
    // 分子数据
    const molecules = {
        water: {
            name: "水分子 (H₂O)",
            atoms: [
                { type: 'oxygen', position: [0, 0, 0], radius: 0.5 },
                { type: 'hydrogen', position: [0.95, 0, 0], radius: 0.3 },
                { type: 'hydrogen', position: [-0.37, 0.9, 0], radius: 0.3 }
            ],
            bonds: [
                { from: 0, to: 1, length: 0.95 },
                { from: 0, to: 2, length: 0.95 }
            ],
            bondAngle: 104.5,
            info: {
                formula: "H₂O",
                weight: "18.015 g/mol",
                geometry: "V形（弯曲形）",
                angle: "104.5°",
                bondLength: "95.84 pm",
                hybridization: "氧原子采用 sp³ 杂化",
                polarity: "极性分子，偶极矩 1.85 D"
            }
        },
        
        methane: {
            name: "甲烷 (CH₄)",
            atoms: [
                { type: 'carbon', position: [0, 0, 0], radius: 0.5 },
                { type: 'hydrogen', position: [0.63, 0.63, 0.63], radius: 0.3 },
                { type: 'hydrogen', position: [-0.63, -0.63, 0.63], radius: 0.3 },
                { type: 'hydrogen', position: [-0.63, 0.63, -0.63], radius: 0.3 },
                { type: 'hydrogen', position: [0.63, -0.63, -0.63], radius: 0.3 }
            ],
            bonds: [
                { from: 0, to: 1, length: 1.09 },
                { from: 0, to: 2, length: 1.09 },
                { from: 0, to: 3, length: 1.09 },
                { from: 0, to: 4, length: 1.09 }
            ],
            bondAngle: 109.5,
            info: {
                formula: "CH₄",
                weight: "16.04 g/mol",
                geometry: "正四面体",
                angle: "109.5°",
                bondLength: "109 pm",
                hybridization: "碳原子采用 sp³ 杂化",
                polarity: "非极性分子"
            }
        },
        
        ammonia: {
            name: "氨气 (NH₃)",
            atoms: [
                { type: 'nitrogen', position: [0, 0.2, 0], radius: 0.5 },
                { type: 'hydrogen', position: [0.94, -0.3, 0], radius: 0.3 },
                { type: 'hydrogen', position: [-0.47, -0.3, 0.81], radius: 0.3 },
                { type: 'hydrogen', position: [-0.47, -0.3, -0.81], radius: 0.3 }
            ],
            bonds: [
                { from: 0, to: 1, length: 1.01 },
                { from: 0, to: 2, length: 1.01 },
                { from: 0, to: 3, length: 1.01 }
            ],
            bondAngle: 107.8,
            info: {
                formula: "NH₃",
                weight: "17.031 g/mol",
                geometry: "三角锥形",
                angle: "107.8°",
                bondLength: "101.7 pm",
                hybridization: "氮原子采用 sp³ 杂化",
                polarity: "极性分子，偶极矩 1.47 D"
            }
        },
        
        carbonDioxide: {
            name: "二氧化碳 (CO₂)",
            atoms: [
                { type: 'carbon', position: [0, 0, 0], radius: 0.5 },
                { type: 'oxygen', position: [1.16, 0, 0], radius: 0.45 },
                { type: 'oxygen', position: [-1.16, 0, 0], radius: 0.45 }
            ],
            bonds: [
                { from: 0, to: 1, length: 1.16 },
                { from: 0, to: 2, length: 1.16 }
            ],
            bondAngle: 180,
            info: {
                formula: "CO₂",
                weight: "44.01 g/mol",
                geometry: "直线形",
                angle: "180°",
                bondLength: "116.3 pm",
                hybridization: "碳原子采用 sp 杂化",
                polarity: "非极性分子"
            }
        }
    };
    
    // 创建水分子
    function createWaterMolecule() {
        return createMolecule('water');
    }
    
    // 创建甲烷分子
    function createMethaneMolecule() {
        return createMolecule('methane');
    }
    
    // 创建氨气分子
    function createAmmoniaMolecule() {
        return createMolecule('ammonia');
    }
    
    // 创建二氧化碳分子
    function createCarbonDioxideMolecule() {
        return createMolecule('carbonDioxide');
    }
    
    // 通用分子创建函数
    function createMolecule(moleculeType) {
        const moleculeData = molecules[moleculeType];
        const group = new THREE.Group();
        
        // 清除旧的原子标签
        clearAtomLabels();
        
        // 创建原子
        moleculeData.atoms.forEach((atom, index) => {
            let material;
            switch(atom.type) {
                case 'oxygen':
                    material = oxygenMaterial;
                    break;
                case 'hydrogen':
                    material = hydrogenMaterial;
                    break;
                case 'carbon':
                    material = carbonMaterial;
                    break;
                case 'nitrogen':
                    material = nitrogenMaterial;
                    break;
                default:
                    material = oxygenMaterial;
            }
            
            const geometry = atom.radius === 0.5 ? atomGeometry : smallAtomGeometry;
            const atomMesh = new THREE.Mesh(geometry, material);
            atomMesh.position.set(...atom.position);
            group.add(atomMesh);
            
            // 添加原子标签
            if (showLabels) {
                addAtomLabel(atom.type.toUpperCase(), atomMesh.position, index);
            }
        });
        
        // 创建化学键
        if (showBonds) {
            moleculeData.bonds.forEach(bond => {
                const fromAtom = moleculeData.atoms[bond.from];
                const toAtom = moleculeData.atoms[bond.to];
                
                const bondMesh = createBond(fromAtom.position, toAtom.position);
                group.add(bondMesh);
            });
        }
        
        // 添加孤对电子（水分子）
        if (moleculeType === 'water') {
            addLonePairs(group, [0, 0.8, 0.8], [0, 0.8, -0.8]);
        }
        
        // 添加孤对电子（氨气）
        if (moleculeType === 'ammonia') {
            addLonePairs(group, [0, 1.2, 0]);
        }
        
        return { group, data: moleculeData };
    }
    
    // 创建化学键
    function createBond(fromPos, toPos) {
        const bond = new THREE.Mesh(bondGeometry, bondMaterial);
        
        // 计算键的中间位置和方向
        const midPoint = [
            (fromPos[0] + toPos[0]) / 2,
            (fromPos[1] + toPos[1]) / 2,
            (fromPos[2] + toPos[2]) / 2
        ];
        
        bond.position.set(...midPoint);
        
        // 计算键的方向
        const direction = new THREE.Vector3(
            toPos[0] - fromPos[0],
            toPos[1] - fromPos[1],
            toPos[2] - fromPos[2]
        );
        
        // 将圆柱体朝向键的方向
        bond.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction.clone().normalize()
        );
        
        // 调整圆柱体长度以匹配键长
        const length = direction.length();
        bond.scale.y = length;
        
        return bond;
    }
    
    // 添加孤对电子
    function addLonePairs(group, ...positions) {
        const electronGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const electronMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xf1c40f,
            shininess: 100,
            emissive: 0x332200
        });
        
        positions.forEach(pos => {
            const electron = new THREE.Mesh(electronGeometry, electronMaterial);
            electron.position.set(...pos);
            group.add(electron);
        });
    }
    
    // 添加原子标签
    function addAtomLabel(symbol, position, index) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;
        
        // 绘制背景
        context.fillStyle = 'rgba(255, 255, 255, 0.8)';
        context.beginPath();
        context.arc(32, 32, 30, 0, Math.PI * 2);
        context.fill();
        
        // 绘制文字
        context.fillStyle = '#2c3e50';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(symbol, 32, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(position.x + 0.7, position.y + 0.7, position.z + 0.7);
        sprite.scale.set(1.5, 1.5, 1.5);
        
        scene.add(sprite);
        atomLabels.push({ sprite, index });
    }
    
    // 清除原子标签
    function clearAtomLabels() {
        atomLabels.forEach(label => {
            scene.remove(label.sprite);
        });
        atomLabels = [];
    }
    
    // 更新原子标签
    function updateAtomLabels() {
        clearAtomLabels();
        
        if (showLabels && currentMolecule) {
            currentMolecule.data.atoms.forEach((atom, index) => {
                const atomMesh = currentMolecule.group.children.find(
                    child => child instanceof THREE.Mesh && 
                    child.position.x === atom.position[0] &&
                    child.position.y === atom.position[1] &&
                    child.position.z === atom.position[2]
                );
                
                if (atomMesh) {
                    addAtomLabel(atom.type.toUpperCase(), atomMesh.position, index);
                }
            });
        }
    }
    
    // 初始化分子（默认为水分子）
    const initialMolecule = createWaterMolecule();
    scene.add(initialMolecule.group);
    currentMolecule = initialMolecule;
    
    // 更新分子信息显示
    function updateMoleculeInfo(moleculeType) {
        const moleculeData = molecules[moleculeType];
        const infoContainer = document.getElementById('bondInfo');
        
        if (!infoContainer) return;
        
        let html = `
            <div class="bond-item">
                <div>分子式</div>
                <div class="bond-value">${moleculeData.info.formula}</div>
            </div>
            <div class="bond-item">
                <div>分子量</div>
                <div class="bond-value">${moleculeData.info.weight}</div>
            </div>
            <div class="bond-item">
                <div>几何构型</div>
                <div class="bond-value">${moleculeData.info.geometry}</div>
            </div>
            <div class="bond-item">
                <div>键角</div>
                <div class="bond-value">${moleculeData.info.angle}</div>
            </div>
            <div class="bond-item">
                <div>键长</div>
                <div class="bond-value">${moleculeData.info.bondLength}</div>
            </div>
            <div class="bond-item">
                <div>杂化方式</div>
                <div class="bond-value">${moleculeData.info.hybridization}</div>
            </div>
        `;
        
        infoContainer.innerHTML = html;
        
        // 更新章节内容中的分子信息
        const infoSection = document.querySelector('.chapter-content .section-title + .concept-list');
        if (infoSection) {
            infoSection.innerHTML = `
                <li><strong>分子式</strong>：${moleculeData.info.formula}</li>
                <li><strong>分子量</strong>：${moleculeData.info.weight}</li>
                <li><strong>几何构型</strong>：${moleculeData.info.geometry}</li>
                <li><strong>键角</strong>：${moleculeData.info.angle}</li>
                <li><strong>键长</strong>：${moleculeData.info.bondLength}</li>
                <li><strong>杂化方式</strong>：${moleculeData.info.hybridization}</li>
                <li><strong>极性</strong>：${moleculeData.info.polarity}</li>
            `;
        }
        
        // 更新标题
        const titleElement = document.querySelector('.chapter-title');
        if (titleElement) {
            titleElement.innerHTML = `<i class="fas fa-water"></i> 第2章：分子结构与化学键理论 - ${moleculeData.name}`;
        }
    }
    
    // 初始显示水分子信息
    updateMoleculeInfo('water');
    
    // 动画控制变量
    let autoRotation = true;
    let rotationSpeed = 0.01;
    
    // 分子选择器按钮
    const moleculeButtons = document.querySelectorAll('.molecule-btn');
    moleculeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有按钮的active类
            moleculeButtons.forEach(b => b.classList.remove('active'));
            // 给当前按钮添加active类
            this.classList.add('active');
            
            // 获取分子类型
            const moleculeType = this.getAttribute('data-molecule');
            
            // 从场景中移除当前分子
            if (currentMolecule && currentMolecule.group) {
                scene.remove(currentMolecule.group);
            }
            
            // 创建新的分子
            let newMolecule;
            switch(moleculeType) {
                case 'water':
                    newMolecule = createWaterMolecule();
                    break;
                case 'methane':
                    newMolecule = createMethaneMolecule();
                    break;
                case 'ammonia':
                    newMolecule = createAmmoniaMolecule();
                    break;
                case 'carbon-dioxide':
                    newMolecule = createCarbonDioxideMolecule();
                    break;
                default:
                    newMolecule = createWaterMolecule();
            }
            
            // 添加到场景
            scene.add(newMolecule.group);
            currentMolecule = newMolecule;
            
            // 更新原子标签
            updateAtomLabels();
            
            // 更新分子信息
            updateMoleculeInfo(moleculeType);
            
            // 重置视图
            resetView();
        });
    });
    
    // 控制面板功能
    const rotationSpeedInput = document.getElementById('rotationSpeed');
    const speedValue = document.getElementById('speedValue');
    const toggleRotationBtn = document.getElementById('toggleRotation');
    const resetViewBtn = document.getElementById('resetView');
    const toggleBondsBtn = document.getElementById('toggleBonds');
    const toggleLabelsBtn = document.getElementById('toggleLabels');
    
    // 旋转速度控制
    if (rotationSpeedInput) {
        rotationSpeedInput.addEventListener('input', (e) => {
            rotationSpeed = e.target.value / 5000;
            const speedText = e.target.value < 50 ? '慢速' : 
                            e.target.value < 150 ? '正常速度' : '快速';
            speedValue.textContent = speedText;
        });
    }
    
    // 切换旋转状态
    if (toggleRotationBtn) {
        toggleRotationBtn.addEventListener('click', () => {
            autoRotation = !autoRotation;
            toggleRotationBtn.innerHTML = autoRotation ? 
                '<i class="fas fa-pause"></i> 暂停旋转' : 
                '<i class="fas fa-play"></i> 开始旋转';
        });
    }
    
    // 重置视图
    if (resetViewBtn) {
        resetViewBtn.addEventListener('click', () => {
            resetView();
        });
    }
    
    function resetView() {
        if (currentMolecule && currentMolecule.group) {
            currentMolecule.group.rotation.set(0, 0, 0);
        }
        camera.position.set(0, 5, 15);
        camera.lookAt(0, 0, 0);
    }
    
    // 切换化学键显示
    if (toggleBondsBtn) {
        toggleBondsBtn.addEventListener('click', () => {
            showBonds = !showBonds;
            
            // 重新创建当前分子
            const currentType = document.querySelector('.molecule-btn.active').getAttribute('data-molecule');
            
            // 从场景中移除当前分子
            if (currentMolecule && currentMolecule.group) {
                scene.remove(currentMolecule.group);
            }
            
            // 创建新的分子（带/不带化学键）
            let newMolecule;
            switch(currentType) {
                case 'water':
                    newMolecule = createMolecule('water');
                    break;
                case 'methane':
                    newMolecule = createMolecule('methane');
                    break;
                case 'ammonia':
                    newMolecule = createMolecule('ammonia');
                    break;
                case 'carbon-dioxide':
                    newMolecule = createMolecule('carbonDioxide');
                    break;
                default:
                    newMolecule = createMolecule('water');
            }
            
            // 添加到场景
            scene.add(newMolecule.group);
            currentMolecule = newMolecule;
            
            // 更新原子标签
            updateAtomLabels();
            
            // 更新按钮文本
            toggleBondsBtn.innerHTML = showBonds ? 
                '<i class="fas fa-unlink"></i> 隐藏化学键' : 
                '<i class="fas fa-link"></i> 显示化学键';
        });
    }
    
    // 切换原子标签显示
    if (toggleLabelsBtn) {
        toggleLabelsBtn.addEventListener('click', () => {
            showLabels = !showLabels;
            updateAtomLabels();
            
            toggleLabelsBtn.innerHTML = showLabels ? 
                '<i class="fas fa-eye-slash"></i> 隐藏原子标签' : 
                '<i class="fas fa-tag"></i> 显示原子标签';
        });
    }
    
    // 鼠标控制
    let isMouseDown = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (!isMouseDown || !currentMolecule) return;
        
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        currentMolecule.group.rotation.y += deltaX * 0.01;
        currentMolecule.group.rotation.x += deltaY * 0.01;
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    // 鼠标滚轮缩放
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        camera.position.z += e.deltaY * 0.05;
        camera.position.z = Math.max(5, Math.min(30, camera.position.z));
    });
    
    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        
        // 自动旋转
        if (autoRotation && currentMolecule && currentMolecule.group) {
            currentMolecule.group.rotation.y += rotationSpeed;
        }
        
        renderer.render(scene, camera);
    }
    
    // 开始动画
    animate();
    
    // 窗口大小调整
    window.addEventListener('resize', () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
    
    // 初始化完成
    console.log("第2章分子结构动画已加载");
});