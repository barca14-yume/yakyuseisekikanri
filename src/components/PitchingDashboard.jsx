/**
 * 投手成績ダッシュボードコンポーネント
 * ERA, WHIP, K/9等の投手スタッツを表示
 */

import { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import { Target, TrendingUp, Zap, Activity, Flame, Shield, BarChart3 } from 'lucide-react';
import { calculatePitchingStats, formatInnings } from '../utils/stats';
import { PITCHING_DECISION_OPTIONS, POSITION_OPTIONS } from '../utils/constants';

// スタッツカード
function PitchStatCard({ label, value, subValue, icon: Icon, color = '#3b82f6', delay = 0 }) {
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
                    {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                </p>
            ))}
        </div>
    );
}

export default function PitchingDashboard({ games }) {
    const stats = useMemo(() => calculatePitchingStats(games), [games]);

    // 試合ごとのデータ（グラフ用）
    const gameByGame = useMemo(() => {
        return games
            .filter(g => g.pitching && g.pitching.innings > 0)
            .map(g => ({
                date: g.date?.slice(5) || '',
                opponent: g.opponent || '練習',
                innings: g.pitching.innings,
                pitchCount: g.pitching.pitchCount,
                strikeouts: g.pitching.strikeouts,
                walks: g.pitching.walks,
                earnedRuns: g.pitching.earnedRuns,
                hits: g.pitching.hits,
            }))
            .reverse();
    }, [games]);

    // 勝敗の分布
    const decisionDist = useMemo(() => {
        const dist = {};
        games.forEach(g => {
            if (g.pitching && g.pitching.innings > 0) {
                const d = g.pitching.decision || 'no_decision';
                dist[d] = (dist[d] || 0) + 1;
            }
        });
        return Object.entries(dist).map(([key, value]) => {
            const opt = PITCHING_DECISION_OPTIONS.find(o => o.value === key);
            return { name: opt?.label || key, value, color: opt?.color || '#64748b' };
        });
    }, [games]);

    if (stats.gamesStarted === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
                <Flame size={64} className="text-text-muted mb-4" />
                <h3 className="text-xl font-heading font-bold text-text-primary mb-2">投手データがありません</h3>
                <p className="text-text-secondary">試合データに投手成績を入力すると、ここに分析結果が表示されます</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* 基本スタッツ */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <PitchStatCard
                    label="ERA"
                    value={stats.era.toFixed(2)}
                    subValue={`${stats.totalEarnedRuns}自責点`}
                    icon={Shield}
                    color="#10b981"
                    delay={0}
                />
                <PitchStatCard
                    label="WHIP"
                    value={stats.whip.toFixed(2)}
                    subValue="(安打+四球)/IP"
                    icon={Activity}
                    color="#3b82f6"
                    delay={50}
                />
                <PitchStatCard
                    label="K/9"
                    value={stats.k9.toFixed(1)}
                    subValue={`${stats.totalStrikeouts}奪三振`}
                    icon={Zap}
                    color="#f59e0b"
                    delay={100}
                />
                <PitchStatCard
                    label="勝敗"
                    value={`${stats.wins}W-${stats.losses}L`}
                    subValue={stats.saves > 0 ? `${stats.saves}S` : `${stats.gamesStarted}試合`}
                    icon={Target}
                    color="#8b5cf6"
                    delay={150}
                />
                <PitchStatCard
                    label="投球回"
                    value={formatInnings(stats.totalInnings)}
                    subValue={`${stats.gamesStarted}登板`}
                    icon={Flame}
                    color="#06b6d4"
                    delay={200}
                />
                <PitchStatCard
                    label="BB/9"
                    value={stats.bb9.toFixed(1)}
                    subValue={`${stats.totalWalks}四球`}
                    icon={TrendingUp}
                    color={stats.bb9 > 5 ? '#ef4444' : '#f97316'}
                    delay={250}
                />
            </div>

            {/* 詳細スタッツ＆勝敗 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 詳細テーブル */}
                <div className="glass rounded-xl p-4">
                    <h3 className="text-sm font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <BarChart3 size={16} className="text-accent-blue" />
                        累計成績
                    </h3>
                    <div className="space-y-2">
                        {[
                            { label: '投球数', value: stats.totalPitchCount, sub: `平均${stats.avgPitchCount.toFixed(0)}球/試合` },
                            { label: 'S / B', value: `${stats.totalStrikesCount} / ${stats.totalBallsCount}`, sub: stats.totalPitchCount > 0 ? `S率 ${((stats.totalStrikesCount / stats.totalPitchCount) * 100).toFixed(1)}%` : '-' },
                            { label: '被安打', value: stats.totalHits, sub: `被打率 ${stats.battingAgainst.toFixed(3)}` },
                            { label: '奪三振', value: stats.totalStrikeouts, sub: `K/BB ${stats.kbb.toFixed(2)}` },
                            { label: '四球', value: stats.totalWalks, sub: `死球 ${stats.totalHitBatters}` },
                            { label: '失点/自責', value: `${stats.totalRuns}/${stats.totalEarnedRuns}`, sub: `暴投 ${stats.totalWildPitches}` },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/20">
                                <span className="text-xs text-text-secondary">{item.label}</span>
                                <div className="text-right">
                                    <span className="text-sm font-bold font-heading text-text-primary">{item.value}</span>
                                    <span className="text-[10px] text-text-muted ml-2">{item.sub}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 勝敗分布 */}
                {decisionDist.length > 0 && (
                    <div className="glass rounded-xl p-4">
                        <h3 className="text-sm font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
                            <Target size={16} className="text-accent-purple" />
                            勝敗分布
                        </h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <Pie
                                    data={decisionDist}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={65}
                                    dataKey="value"
                                    paddingAngle={2}
                                    label={({ name, value }) => `${name}(${value})`}
                                    labelLine={false}
                                >
                                    {decisionDist.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* 試合別スタッツ */}
            {gameByGame.length > 1 && (
                <div className="glass rounded-xl p-4">
                    <h3 className="text-sm font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <Flame size={16} className="text-accent-amber" />
                        試合別推移
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={gameByGame}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a3450" />
                            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="strikeouts" fill="#f59e0b" radius={[4, 4, 0, 0]} name="奪三振" />
                            <Bar dataKey="walks" fill="#ef4444" radius={[4, 4, 0, 0]} name="四球" />
                            <Bar dataKey="earnedRuns" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="自責点" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
