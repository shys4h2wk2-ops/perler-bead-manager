'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { InventoryItem, Pattern } from '@/types';
import { beadColors } from '@/data/beadColors';
import BottomNav from '@/components/BottomNav';
import { Download, Upload, Palette, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('inventory', beadColors.map(color => ({
    colorCode: color.code,
    quantity: 0
  })));
  const [patterns, setPatterns] = useLocalStorage<Pattern[]>('patterns', []);

  const exportData = () => {
    const data = {
      inventory,
      patterns,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `perler-beads-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.inventory) setInventory(data.inventory);
        if (data.patterns) setPatterns(data.patterns);
        alert('导入成功！');
      } catch (error) {
        alert('导入失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
  };

  const resetAllData = () => {
    if (confirm('确定要重置所有数据吗？此操作不可恢复！')) {
      setInventory(beadColors.map(color => ({
        colorCode: color.code,
        quantity: 0
      })));
      setPatterns([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">设置</h1>
      </header>

      <main className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Palette size={20} />
            色库信息
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>色号数量: {beadColors.length} 色</p>
            <p>包含完整的 221 色标准色库</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Download size={20} />
            数据管理
          </h2>
          
          <div className="space-y-3">
            <button
              onClick={exportData}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <Download size={20} />
              导出数据
            </button>
            
            <label className="w-full py-3 bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 cursor-pointer">
              <Upload size={20} />
              导入数据
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Trash2 size={20} className="text-red-500" />
            危险操作
          </h2>
          
          <button
            onClick={resetAllData}
            className="w-full py-3 border-2 border-red-500 text-red-500 rounded-xl font-medium"
          >
            重置所有数据
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            此操作将清空所有库存和图纸数据
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">拼豆管理器 v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">Built with Next.js</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
