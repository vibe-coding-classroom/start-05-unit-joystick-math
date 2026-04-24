/**
 * Unit 05: Joystick Math - Geometric Constraint & Normalization
 * 核心目標：學習勾股定理應用、圓形限位邏輯與數值歸一化。
 */

const handle = document.getElementById('joystick-handle');
const base = document.getElementById('joystick-base');
const container = document.getElementById('joystick-container');

// Telemetry Elements
const displayRaw = document.getElementById('raw-offset');
const displayDistance = document.getElementById('distance');
const displayPower = document.getElementById('power');
const displayAngle = document.getElementById('angle');

// Configuration
const RADIUS = 100; // 底座半徑 (px)
let isDragging = false;
let centerX, centerY;

// 初始化中心點
function updateCenter() {
    const rect = base.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;
}

window.addEventListener('resize', updateCenter);
updateCenter();

// 事件監聽
handle.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', drag);
window.addEventListener('mouseup', endDrag);

handle.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrag(e.touches[0]);
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    drag(e.touches[0]);
}, { passive: false });

window.addEventListener('touchend', endDrag);

function startDrag(e) {
    isDragging = true;
    updateCenter();
}

function drag(e) {
    if (!isDragging) return;

    // 1. 計算相對於中心點的原始偏移量 (Raw Offset)
    let dx = e.clientX - centerX;
    let dy = e.clientY - centerY;

    // 2. 應用勾股定理計算距離 (Distance calculation)
    // TODO: d = Math.sqrt(dx * dx + dy * dy)
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 3. 圓形限位邏輯 (Circular Clamping)
    // 如果距離超過半徑，利用比例 (Ratio) 將座標縮放到邊界上
    let clampedX = dx;
    let clampedY = dy;
    
    if (distance > RADIUS) {
        // TODO: ratio = RADIUS / distance
        const ratio = RADIUS / distance;
        clampedX = dx * ratio;
        clampedY = dy * ratio;
    }

    // 4. 更新 UI 位置
    handle.style.transform = `translate(${clampedX}px, ${clampedY}px)`;

    // 5. 數據歸一化與遙測更新 (Normalization & Telemetry)
    updateTelemetry(dx, dy, distance, clampedX, clampedY);
}

function endDrag() {
    isDragging = false;
    
    // 6. 自動回彈 (Auto-Centering)
    handle.style.transform = 'translate(0, 0)';
    
    // 重置遙測數據
    updateTelemetry(0, 0, 0, 0, 0);
}

function updateTelemetry(dx, dy, d, cx, cy) {
    // 原始數據
    displayRaw.textContent = `${Math.round(cx)}, ${Math.round(cy)}`;
    
    // 距離數據 (限制在半徑內)
    const effectiveDistance = Math.min(d, RADIUS);
    displayDistance.textContent = effectiveDistance.toFixed(2);

    // 推力百分比 (Power Normalization: 0.0 - 1.0)
    const power = (effectiveDistance / RADIUS);
    displayPower.textContent = `${Math.round(power * 100)}%`;

    // 象限感知角度運算 (Angle calculation using atan2)
    // 注意：Math.atan2 傳回弧度 (Radians)，需要轉為角度 (Degrees)
    // y 軸取反是因為螢幕座標系中 y 向下增加
    if (d > 0) {
        const radians = Math.atan2(-cy, cx); // 轉換為數學上的正方向
        let degrees = radians * (180 / Math.PI);
        // 將範圍調整為 0-360 (可選，目前維持 -180 到 180)
        displayAngle.textContent = `${Math.round(degrees)}°`;
    } else {
        displayAngle.textContent = `0°`;
    }
}
