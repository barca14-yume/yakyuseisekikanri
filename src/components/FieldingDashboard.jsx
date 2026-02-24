/**
 * 守備成績ダッシュボードコンポーネント
 * 守備率、ポジション別成績、守備機会の詳細を表示
 */

import { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Shield, Target, Award, AlertTriangle, BarChart3, Star } from 'lucide-react';
import { calculateFieldingStats, formatStat } from '../utils/stats';
import { POSITION_OPTIONS, FIELDING_PLAY_OPTIONS, FIELDING_RESULT_OPTIONS } from '../utils/constants';

// スタッツカード
function FieldStatCard({ label, value, subValue, icon: Icon, color = '#3b82f6', delay = 0 }) {
    return (
        <div
            className="glass rounded-xl p-4 animate-slideUp hover:bg-bg-card-hover transition-all duration-300"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-text-secondary text-xs font-medium uppercase tracking-wider">{label}</span>
                {Icon && <Icon size={16} className="text-text-muted" />}
            </div>
            <div className="text-3xl font-bold font-heading" style={{ color }}>
                {value}
            </div>
            {subValue && (
                <div className="text-text-muted text-xs mt-1">{subValue}</div>
            )}
        </div>
    );
}

// カスタムツールチップ
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="glass-strong rounded-lg px-3 py-2 text-sm">
            <p className="text-text-primary font-medium mb-1">{label}</p>
            {payload.map((entry, i) => (
                <p key={i} style={{ color: entry.color }} className="text-xs">
                    {entry.name}: {entry.value}
                </p>
            ))}
        </div>
    );
}

export default function FieldingDashboard({ games }) {
    const stats = useMemo(() => calculateFieldingStats(games), [games]);

    // ポジション別棒グラフデータ
    const positionChartData = useMemo(() => {
        return Object.entries(stats.byPosition).map(([pos, data]) => {
            const posOpt = POSITION_OPTIONS.find(p => p.value === pos);
            return {
                name: posOpt?.label || pos,
                刺殺: data.putouts,
                補殺: data.assists,
                失策: data.errors,
                ファインプレー: data.finePlays,
            };
        });
    }, [stats]);

    // プレー種類別の分布
    const playTypeDistribution = useMemo(() => {
        const dist = {};
        games.forEach(g => {
            (g.fielding || []).forEach(f => {
                const type = f.playType || 'other';
                dist[type] = (dist[type] || 0) + 1;
            });
        });
        return Object.entries(dist)
            .map(([key, value]) => {
                const opt = FIELDING_PLAY_OPTIONS.find(o => o.value === key);
                return { name: `${opt?.icon || ''} ${opt?.label || key}`, value };
            })
            .sort((a, b) => b.value - a.value);
    }, [games]);

    if (stats.totalPlays === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
                <Shield size={64} className="text-text-muted mb-4" />
                <h3 className="text-xl font-heading font-bold text-text-primary mb-2">守備データがありません</h3>
                <p className="text-text-secondary">試合データに守備記録を入力すると、ここに分析結果が表示されます</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* 基本スタッツ */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <FieldStatCard
                    label="守備率"
                    value={formatStat(stats.fieldingPercentage)}
                    subValue={`${stats.totalPlays}守備機会`}
                    icon={Shield}
                    color="#10b981"
                    delay={0}
                />
                <FieldStatCard
                    label="刺殺"
                    value={stats.putouts}
                    subValue="アウト取得"
                    icon={Target}
                    color="#3b82f6"
                    delay={50}
                />
                <FieldStatCard
                    label="補殺"
                    value={stats.assists}
                    subValue="送球アウト"
                    icon={Award}
                    color="#f59e0b"
                    delay={100}
                />
                <FieldStatCard
                    label="失策"
                    value={stats.errors}
                    subValue="エラー数"
                    icon={AlertTriangle}
                    color={stats.errors > 0 ? '#ef4444' : '#10b981'}
                    delay={150}
                />
                <FieldStatCard
                    label="ファインプレー"
                    value={stats.finePlays}
                    subValue="好プレー"
                    icon={Star}
                    color="#8b5cf6"
                    delay={200}
                />
                <FieldStatCard
                    label="守備機会"
                    value={stats.totalPlays}
                    subValue={`${Object.keys(stats.byPosition).length}ポジション`}
                    icon={BarChart3}
                    color="#06b6d4"
                    delay={250}
                />
            </div>

            {/* ポジション別成績 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* ポジション別テーブル */}
                <div className="glass rounded-xl p-4">
                    <h3 className="text-sm font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <Shield size={16} className="text-accent-emerald" />
                        ポジション別成績
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-2 px-2 text-text-secondary font-medium">ポジション</th>
                                    <th className="text-center py-2 px-1 text-text-secondary font-medium">機会</th>
                                    <th className="text-center py-2 px-1 text-text-secondary font-medium">刺殺</th>
                                    <th className="text-center py-2 px-1 text-text-secondary font-medium">補殺</th>
                                    <th className="text-center py-2 px-1 text-text-secondary font-medium">失策</th>
                                    <th className="text-center py-2 px-1 text-text-secondary font-medium">守備率</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(stats.byPosition).map(([pos, data]) => {
                                    const posOpt = POSITION_OPTIONS.find(p => p.value === pos);
                                    return (
                                        <tr key={pos} className="border-b border-border/30 hover:bg-bg-card-hover/50">
                                            <td className="py-2 px-2 text-text-primary font-medium">
                                                <span className="px-1.5 py-0.5 bg-accent-blue/10 text-accent-blue rounded text-[10px] mr-1">{posOpt?.short || pos}</span>
                                                {posOpt?.label || pos}
                                            </td>
                                            <td className="text-center py-2 px-1 text-text-secondary">{data.total}</td>
                                            <td className="text-center py-2 px-1 text-accent-blue font-medium">{data.putouts}</td>
                                            <td className="text-center py-2 px-1 text-accent-amber font-medium">{data.assists}</td>
                                            <td className="text-center py-2 px-1 text-accent-red font-medium">{data.errors}</td>
                                            <td className="text-center py-2 px-1 text-accent-emerald font-medium">
                                                {formatStat(data.fieldingPercentage)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* プレー種類の分布 */}
                <div className="glass rounded-xl p-4">
                    <h3 className="text-sm font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <BarChart3 size={16} className="text-accent-amber" />
                        プレー種類の分布
                    </h3>
                    <div className="space-y-2">
                        {playTypeDistribution.map((item, i) => {
                            const maxVal = playTypeDistribution[0]?.value || 1;
                            const pct = (item.value / stats.totalPlays * 100).toFixed(0);
                            return (
                                <div key={i}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-text-secondary">{item.name}</span>
                                        <span className="text-text-primary font-medium">{item.value}回 ({pct}%)</span>
                                    </div>
                                    <div className="h-2 bg-bg-input rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${(item.value / maxVal) * 100}%`,
                                                background: `linear-gradient(90deg, #3b82f6, #8b5cf6)`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ポジション別棒グラフ */}
            {positionChartData.length > 0 && (
                <div className="glass rounded-xl p-4">
                    <h3 className="text-sm font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <BarChart3 size={16} className="text-accent-purple" />
                        ポジション別内訳
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={positionChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a3450" />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="刺殺" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="a" />
                            <Bar dataKey="補殺" fill="#f59e0b" radius={[0, 0, 0, 0]} stackId="a" />
                            <Bar dataKey="失策" fill="#ef4444" radius={[0, 0, 0, 0]} stackId="a" />
                            <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
