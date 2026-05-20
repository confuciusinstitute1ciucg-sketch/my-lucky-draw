const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 初始化 1-6 号抽签池
let drawData = {
    passcode: "admin123", // 👈 老师，重置密码在这里改
    slots: Array.from({ length: 6 }, (_, i) => ({ id: i + 1, studentName: null, isTaken: false }))[cite: 1, 2]
};

// 获取当前所有抽签状态
app.get('/api/status', (req, res) => {
    res.json(drawData.slots);[cite: 1, 2]
});

// 学生抽签接口
app.post('/api/draw', (req, res) => {
    const { name } = req.body;
    if (!name || name.trim() === "") {
        return res.status(400).json({ success: false, msg: "请输入你的真实姓名！" });[cite: 1, 2]
    }
    const studentName = name.trim();[cite: 1, 2]

    // 1. 校验该名字是否已经抽过
    const alreadyDrawn = drawData.slots.find(s => s.studentName === studentName);
    if (alreadyDrawn) {
        return res.json({ success: false, msg: `你已经抽过了！号码是 ${alreadyDrawn.id} 号，不可更改。` });[cite: 1, 2]
    }

    // 2. 检查是否有剩余空位
    const availableSlots = drawData.slots.filter(s => !s.isTaken);
    if (availableSlots.length === 0) {
        return res.json({ success: false, msg: "非常抱歉，6个号已被全部抽完！" });[cite: 1, 2]
    }

    // ===========================================
    // 🔮 老师的暗箱操作特权名单（在这里改名字和号数）
    // ===========================================
    const vipList = {
        "Teodora Tomović ": 5,  // 输入Teodora Tomović ”，只要 5 号没被抽走，他必中 5 号
    };

    let luckySlot;

    // 检查学生是否在内定名单里
    if (vipList[studentName]) {
        const targetId = vipList[studentName];
        luckySlot = availableSlots.find(s => s.id === targetId);
    }

    // 如果不在名单里，或者指定的号已经被占了，就走正常的随机抽签
    if (!luckySlot) {
        const randomIndex = Math.floor(Math.random() * availableSlots.length);
        luckySlot = availableSlots[randomIndex];[cite: 1, 2]
    }
    // ===========================================

    // 3. 锁定该位置
    const targetSlot = drawData.slots.find(s => s.id === luckySlot.id);
    targetSlot.studentName = studentName;[cite: 1, 2]
    targetSlot.isTaken = true;[cite: 1, 2]

    res.json({ success: true, num: targetSlot.id });[cite: 1, 2]
});

// 老师重置接口（确保这一段完好无损）
app.post('/api/reset', (req, res) => {
    const { password } = req.body;
    if (password === drawData.passcode) {
        drawData.slots.forEach(s => {
            s.studentName = null;[cite: 1, 2]
            s.isTaken = false;[cite: 1, 2]
        });
        return res.json({ success: true, msg: "抽签池已成功重置！" });[cite: 1, 2]
    } else {
        return res.status(403).json({ success: false, msg: "密码错误，拒绝重置！" });[cite: 1, 2]
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);[cite: 1, 2]
});
