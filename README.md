# 拼豆库存与图纸识别管理系统

一个用于管理 Perler Beads（拼豆）库存、图纸识别和缺料分析的 PWA 应用。

## 功能特性

### 核心功能
- 🎨 **221 色标准色库** - 内置完整的 Perler Beads 色库
- 📦 **库存管理** - 追踪每种颜色的库存数量
- 🖼️ **图纸识别** - 自动识别图片中的拼豆颜色分布
- 📊 **缺料分析** - 对比图纸需求和库存，智能计算缺料
- 🔄 **状态联动** - 图纸完成后自动扣减库存

### 页面
- **首页 (Dashboard)** - 总览、库存预警、最近图纸
- **库存管理** - 221 色库存明细、快速增减、筛选功能
- **图纸库** - 图纸分类、搜索、状态管理
- **图纸识别** - 上传图片、网格设置、颜色识别
- **设置** - 数据导入/导出、色库查看

### 技术特性
- **Next.js 14** - 现代 React 框架
- **Tailwind CSS** - 响应式 UI 设计
- **LocalStorage** - 本地数据持久化
- **PWA 支持** - 可添加到主屏幕

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本
```bash
npm run build
npm start
```

## 使用说明

### 1. 管理库存
- 进入「库存」页面
- 点击 ±10 按钮或直接输入数值调整库存
- 支持搜索和库存不足筛选

### 2. 上传图纸
- 点击「新建图纸」
- 上传拼豆图纸图片
- 设置网格行数和列数
- 点击「开始识别」自动分析颜色分布
- 手动修正识别结果
- 保存图纸

### 3. 查看缺料
- 进入图纸详情页
- 系统自动计算缺料清单
- 显示需要、库存、缺少数量

### 4. 完成图纸
- 在图纸详情页点击「完成」
- 系统自动扣减对应库存
- 可随时撤销恢复库存

## 数据结构

### beadColors
```typescript
{
  code: string;        // 色号 (A1, B2, ...)
  name: string;        // 颜色名称
  hex: string;         // HEX 颜色值
  rgb: { r, g, b };    // RGB 值
  lab: { l, a, b };    // LAB 颜色空间 (用于匹配)
}
```

### inventory
```typescript
{
  colorCode: string;
  quantity: number;
}
```

### pattern
```typescript
{
  id: string;
  name: string;
  image: string;
  status: 'unstarted' | 'in_progress' | 'completed';
  items: { colorCode: string; quantity: number }[];
  createdAt: number;
}
```

## 颜色匹配算法

系统使用 LAB 颜色空间 + ΔE 距离计算来匹配最接近的颜色：
1. 将 RGB 转换为 LAB 颜色空间
2. 计算与色库中每个颜色的 ΔE 距离
3. 返回距离最小的颜色

## 数据备份与恢复

在「设置」页面可以：
- 导出所有数据为 JSON 文件
- 从 JSON 文件导入数据
- 重置所有数据

## 浏览器支持

- Chrome/Edge (推荐)
- Safari (iOS)
- Firefox

## License

MIT
