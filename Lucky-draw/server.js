const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 初始化 1-6 号抽签池
let drawData = {
    passcode: "admin123", // 👈 老师你的重置密码，可以自己修改
    slots: Array.from({ length: 6 }, (_, i) => ({ id: i + 1, studentName: null, isTaken: false }))
};

// 获取当前抽签状态
app.get('/api/status', (req, res) => { res.json(drawData.slots); });

// 学生抽签
app.post('/api/draw', (req, res) => {
    const { name } = req.body;
    if (!name || name.trim() === "") return res.status(400).json({ success: false, msg: "请输入名字！" });
    const studentName = name.trim();

    // 1. 检查是否抽过
    const alreadyDrawn = drawData.slots.find(s => s.studentName === studentName);
    if (alreadyDrawn) return res.json({ success: false, msg: `你已抽过，号码是 ${alreadyDrawn.id} 号，不可更改！` });

    // 2. 检查是否有空位
    const availableSlots = drawData.slots.filter(s => !s.isTaken);
    if (availableSlots.length === 0) return res.json({ success: false, msg: "号码已被全部抽完！" });

// ====== 🔮 老师的暗箱操作特权名单 ======
const vipList = {
    "Teodora Tomović ": 5,  // 输入“Teodora Tomović ”，只要 5 号没被抽走，他必中 5 号
};

let luckySlot;

// 检查这个学生是不是在内定名单里
if (vipList[studentName]) {
    const targetId = vipList[studentName];
    // 检查老师指定的这个号是不是还没被抽走
    luckySlot = availableSlots.find(s => s.id === targetId);
}

// 如果学生不在名单里，或者他内定的号已经被别人不小心先抽走了，就继续走正常的随机抽签
if (!luckySlot) {
    const randomIndex = Math.floor(Math.random() * availableSlots.length);
    luckySlot = availableSlots[randomIndex];
}
// ===================================
    
    luckySlot.studentName = studentName;
    luckySlot.isTaken = true;
    res.json({ success: true, num: luckySlot.id });
});

// 老师重置
app.post('/api/reset', (req, res) => {
    const { password } = req.body;
    if (password === drawData.passcode) {
        drawData.slots.forEach(s => { s.studentName = null; s.isTaken = false; });
        return res.json({ success: true, msg: "抽签池已成功重置！" });
    }
    res.status(403).json({ success: false, msg: "密码错误！" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
