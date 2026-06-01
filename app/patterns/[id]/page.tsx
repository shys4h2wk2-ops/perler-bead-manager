'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Pattern, InventoryItem, ShortageItem, PatternStatus } from '@/types';
import { beadColors } from '@/data/beadColors';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, Trash2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function PatternDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [patterns, setPatterns] = useLocalStorage<Pattern[]>('patterns', []);
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('inventory', beadColors.map(color => ({
    colorCode: color.code,
    quantity: 0
  })));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const pattern = patterns.find(p => p.id === params.id);

  if (!pattern) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">图纸不存在</p>
          <Link href="/patterns">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">返回图纸库</button>
          </Link>
        </div>
      </div>
    );
  }

  const getTotalBeads = () => {
    return pattern.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getShortageList = (): ShortageItem[] => {
    return pattern.items.map(item => {
      const invItem = inventory.find(i => i.colorCode === item.colorCode);
      const inStock = invItem?.quantity || 0;
      const shortage = Math.max(0, item.quantity - inStock);
      return {
        colorCode: item.colorCode,
        required: item.quantity,
        inStock,
        shortage,
      };
    }).filter(item => item.shortage > 0);
  };

  const shortageList = getShortageList();
  const hasShortage = shortageList.length > 0;

  const updateStatus = (status: PatternStatus) => {
    if (status === 'completed' && pattern.status !== 'completed') {
      setInventory(prev => prev.map(invItem => {
        const patternItem = pattern.items.find(p => p.colorCode === invItem.colorCode);
        if (patternItem) {
          return {
            ...invItem,
            quantity: Math.max(0, invItem.quantity - patternItem.quantity),
          };
        }
        return invItem;
      }));
    } else if (pattern.status === 'completed' && status !== 'completed') {
      setInventory(prev => prev.map(invItem => {
        const patternItem = pattern.items.find(p => p.colorCode === invItem.colorCode);
        if (patternItem) {
          return {
            ...invItem,
            quantity: invItem.quantity + patternItem.quantity,
          };
        }
        return invItem;
      }));
    }

    setPatterns(prev => prev.map(p => 
      p.id === pattern.id ? { ...p, status } : p
    ));
  };

  const deletePattern = () => {
    if (pattern.status === 'completed') {
      setInventory(prev => prev.map(invItem => {
        const patternItem = pattern.items.find(p => p.colorCode === invItem.colorCode);
        if (patternItem) {
          return {
            ...invItem,
            quantity: invItem.quantity + patternItem.quantity,
          };
        }
        return invItem;
      }));
    }
    setPatterns(prev => prev.filter(p => p.id !== pattern.id));
    router.push('/patterns');
  };

  const getStatusBadge = (status: PatternStatus) => {
    switch (status) {
      case 'unstarted':
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full">未开始</span>;
      case 'in_progress':
        return <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full">进行中</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full">已完成</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/patterns">
              <button className="p-2 -ml-2">
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">{pattern.name}</h1>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-red-500"
          >
            <Trash2 size={24} />
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {pattern.image && (
          <div className="bg-white rounded-xl overflow-hidden">
            <img src={pattern.image} alt={pattern.name} className="w-full" />
          </div>
        )}

        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">状态</p>
              {getStatusBadge(pattern.status)}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">总计</p>
              <p className="text-2xl font-bold">{getTotalBeads()} 颗</p>
            </div>
          </div>

          <div className="flex gap-2">
            {pattern.status !== 'unstarted' && (
              <button
                onClick={() => updateStatus('unstarted')}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600"
              >
                未开始
              </button>
            )}
            {pattern.status !== 'in_progress' && (
              <button
                onClick={() => updateStatus('in_progress')}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600"
              >
                进行中
              </button>
            )}
            {pattern.status !== 'completed' && (
              <button
                onClick={() => updateStatus('completed')}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} />
                完成
              </button>
            )}
          </div>
        </div>

        {hasShortage && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h3 className="font-semibold text-red-800 mb-3">缺料清单</h3>
            <div className="space-y-2">
              {shortageList.map(item => {
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
                    <div className="text-right">
                      <p className="text-sm text-gray-500">需要 {item.required}</p>
                      <p className="text-red-600 font-semibold">缺 {item.shortage}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-4">
          <h3 className="font-medium text-gray-800 mb-4">颜色清单</h3>
          <div className="space-y-3">
            {pattern.items.map(item => {
              const color = beadColors.find(c => c.code === item.colorCode);
              const invItem = inventory.find(i => i.colorCode === item.colorCode);
              const inStock = invItem?.quantity || 0;
              const isEnough = inStock >= item.quantity;

              return (
                <div
                  key={item.colorCode}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isEnough ? 'border-gray-100' : 'border-yellow-300 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg border"
                      style={{ backgroundColor: color?.hex }}
                    />
                    <div>
                      <p className="font-medium">{item.colorCode}</p>
                      <p className="text-sm text-gray-500">{color?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.quantity} 颗</p>
                    <p className={`text-sm ${isEnough ? 'text-green-600' : 'text-yellow-600'}`}>
                      库存 {inStock}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">确认删除？</h3>
            <p className="text-gray-500 mb-6">删除后将无法恢复，库存将自动退回。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium"
              >
                取消
              </button>
              <button
                onClick={deletePattern}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
