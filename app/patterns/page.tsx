'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Pattern, PatternStatus } from '@/types';
import BottomNav from '@/components/BottomNav';
import { Image, Search, Plus, Filter } from 'lucide-react';
import Link from 'next/link';

export default function PatternsPage() {
  const [patterns] = useLocalStorage<Pattern[]>('patterns', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PatternStatus | 'all'>('all');

  const filteredPatterns = patterns.filter(pattern => {
    const matchesSearch = pattern.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pattern.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => b.createdAt - a.createdAt);

  const getStatusBadge = (status: PatternStatus) => {
    switch (status) {
      case 'unstarted':
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">未开始</span>;
      case 'in_progress':
        return <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">进行中</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">已完成</span>;
    }
  };

  const getTotalBeads = (pattern: Pattern) => {
    return pattern.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">图纸库</h1>
          <Link href="/patterns/new">
            <button className="bg-blue-600 text-white p-2 rounded-lg">
              <Plus size={20} />
            </button>
          </Link>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜索图纸..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'unstarted', 'in_progress', 'completed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {status === 'all' && '全部'}
                {status === 'unstarted' && '未开始'}
                {status === 'in_progress' && '进行中'}
                {status === 'completed' && '已完成'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="p-4">
        {filteredPatterns.length === 0 ? (
          <div className="text-center py-12">
            <Image size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">暂无图纸</p>
            <Link href="/patterns/new">
              <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">
                创建第一个图纸
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredPatterns.map(pattern => (
              <Link key={pattern.id} href={`/patterns/${pattern.id}`}>
                <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                  <div className="aspect-square bg-gray-100 relative">
                    {pattern.image ? (
                      <img src={pattern.image} alt={pattern.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Image size={48} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(pattern.status)}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-800 truncate">{pattern.name}</h3>
                    <p className="text-sm text-gray-500">
                      {getTotalBeads(pattern)} 颗 · {pattern.items.length} 色
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
