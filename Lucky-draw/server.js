const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🎯 初始化 1-5 号抽签池
let drawData = {
    passcode: "admin123", // 👈 老师的重置密码
    slots: Array.from({ length: 5 }, (_, i) => ({ id: i + 1, studentName: null, isTaken: false }))
};

// 获取当前所有抽签状态
app.get('/api/status', (req, res) => {
    res.json(drawData.slots);
});

// 学生抽签接口
app.post('/api/draw', (req, res) => {
    const { name } = req.body;
    if (!name || name.trim() === "") {
        return res.status(400).json({ success: false, msg: "请输入你的真实姓名！" });
    }
    const studentName = name.trim();

    // 1. 校验该名字是否已经抽过
    const alreadyDrawn = drawData.slots.find(s => s.studentName === studentName);
    if (alreadyDrawn) {
        return res.json({ success: false, msg: `你已经抽过了！号码是 ${alreadyDrawn.id} 号，不可更改。` });
    }

    // 2. 检查是否有剩余空位
    const availableSlots = drawData.slots.filter(s => !s.isTaken);
    if (availableSlots.length === 0) {
        return res.json({ success: false, msg: "非常抱歉，5个号已被全部抽完！" });
    }

    // 🎲 纯随机抽取：没有任何干预，绝对公平
    const randomIndex = Math.floor(Math.random() * availableSlots.length);
    const luckySlot = availableSlots[randomIndex];

    // 3. 锁定该位置
    const targetSlot = drawData.slots.find(s => s.id === luckySlot.id);
    targetSlot.studentName = studentName;
    targetSlot.isTaken = true;

    res.json({ success: true, num: targetSlot.id });
});

// 老师重置接口
app.post('/api/reset', (req, res) => {
    const { password } = req.body;
    if (password === drawData.passcode) {
        drawData.slots.forEach(s => {
            s.studentName = null;
            s.isTaken = false;
        });
        return res.json({ success: true, msg: "抽签池已成功重置！" });
    } else {
        return res.status(403).json({ success: false, msg: "密码错误，拒绝重置！" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
