'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { InventoryItem, Pattern } from '@/types';
import BottomNav from '@/components/BottomNav';
import { Package, Image, AlertTriangle, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { beadColors } from '@/data/beadColors';

export default function Home() {
  const [inventory] = useLocalStorage<InventoryItem[]>('inventory', beadColors.map(color => ({
    colorCode: color.code,
    quantity: 0
  })));
  
  const [patterns] = useLocalStorage<Pattern[]>('patterns', []);

  const totalInventory = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = inventory.filter(item => item.quantity < 10);
  const unstartedPatterns = patterns.filter(p => p.status === 'unstarted').length;
  const completedPatterns = patterns.filter(p => p.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h1 className="text-2xl font-bold">拼豆管理器</h1>
        <p className="text-blue-100 mt-1">欢迎回来！</p>
      </header>

      <main className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">总库存</p>
                <p className="text-2xl font-bold">{totalInventory}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <Image className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">图纸数量</p>
                <p className="text-2xl font-bold">{patterns.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-full">
                <AlertTriangle className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">库存不足</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">已完成</p>
                <p className="text-2xl font-bold text-green-600">{completedPatterns}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <Link href="/patterns/new">
            <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
              <Plus size={20} />
              新建图纸
            </button>
          </Link>
        </div>

        {lowStockItems.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <h2 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
              <AlertTriangle size={20} />
              库存预警
            </h2>
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map(item => {
                const color = beadColors.find(c => c.code === item.colorCode);
                return (
                  <div key={item.colorCode} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: color?.hex }}
                      />
                      <div>
                        <p className="font-medium">{item.colorCode}</p>
                        <p className="text-sm text-gray-500">{color?.name}</p>
                      </div>
                    </div>
                    <span className="text-red-600 font-semibold">{item.quantity} 颗</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {patterns.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-800 mb-3">最近图纸</h2>
            <div className="space-y-3">
              {patterns.slice(0, 3).map(pattern => (
                <Link key={pattern.id} href={`/patterns/${pattern.id}`}>
                  <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      {pattern.image ? (
                        <img src={pattern.image} alt={pattern.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Image size={32} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{pattern.name}</h3>
                      <p className="text-sm text-gray-500">
                        {pattern.status === 'unstarted' && '未开始'}
                        {pattern.status === 'in_progress' && '进行中'}
                        {pattern.status === 'completed' && '已完成'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
