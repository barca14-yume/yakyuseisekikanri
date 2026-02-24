/**
 * ダッシュボード画面コンポーネント
 * 打率、OPS、スプレーチャート等の分析画面
 * フィルタリング（すべて/試合/練習）と比較分析機能を提供
 */

import { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
    PieChart, Pie, Cell,
} from 'recharts';
import {
    Activity, Target, TrendingUp, Zap, Eye, BarChart3, GitCompare,
    Filter, Layers, Swords, Dumbbell, Flame, Shield,
} from 'lucide-react';
import SprayChart from './SprayChart';
import PitchingDashboard from './PitchingDashboard';
import FieldingDashboard from './FieldingDashboard';
import { calculateStats, formatStat, formatPercent, calculateStatsByBat } from '../utils/stats';
import { HIT_RESULTS, RESULT_OPTIONS, ZONE_OPTIONS } from '../utils/constants';

// スタッツカードのコンポーネント
function StatCard({ label, value, subValue, icon: Icon, color = '#3b82f6', delay = 0 }) {
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

// フィルタートグルボタン
function FilterToggle({ value, onChange }) {
    const options = [
        { key: 'all', label: 'すべて', icon: Layers },
        { key: 'game', label: '試合', icon: Swords },
        { key: 'practice', label: '練習', icon: Dumbbell },
    ];

    return (
        <div className="flex bg-bg-input rounded-lg p-1 gap-1">
            {options.map(opt => (
                <button
                    key={opt.key}
                    onClick={() => onChange(opt.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${value === opt.key
                        ? 'bg-gradient-to-r from-gradient-start to-gradient-end text-white shadow-lg'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
                        }`}
                >
                    <opt.icon size={14} />
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

// 比較分析カード
function ComparisonCard({ label, gameValue, practiceValue, formatter = formatStat, color1 = '#3b82f6', color2 = '#f59e0b' }) {
    const diff = practiceValue - gameValue;
    const diffFormatted = formatter(Math.abs(diff));

    return (
        <div className="glass rounded-xl p-4">
            <div className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-3">{label}</div>
            <div className="flex items-center justify-between">
                <div className="text-center">
                    <div className="text-xs text-text-muted mb-1">試合</div>
                    <div className="text-2xl font-bold font-heading" style={{ color: color1 }}>
                        {formatter(gameValue)}
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <GitCompare size={16} className="text-text-muted mb-1" />
                    <div className={`text-xs font-medium ${diff > 0 ? 'text-accent-emerald' : diff < 0 ? 'text-accent-red' : 'text-text-muted'}`}>
                        {diff > 0 ? '+' : diff < 0 ? '-' : '±'}{diffFormatted}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-text-muted mb-1">練習</div>
                    <div className="text-2xl font-bold font-heading" style={{ color: color2 }}>
                        {formatter(practiceValue)}
                    </div>
                </div>
            </div>
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
                    {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(3) : entry.value}
                </p>
            ))}
        </div>
    );
}

// ダッシュボードのカテゴリタブ
function CategoryTabs({ value, onChange }) {
    const tabs = [
        { key: 'batting', label: '打撃', icon: Target, color: '#10b981' },
        { key: 'pitching', label: '投球', icon: Flame, color: '#f59e0b' },
        { key: 'fielding', label: '守備', icon: Shield, color: '#8b5cf6' },
    ];

    return (
        <div className="flex bg-bg-input rounded-lg p-1 gap-1">
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    onClick={() => onChange(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${value === tab.key
                        ? 'text-white shadow-lg'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
                        }`}
                    style={value === tab.key ? { background: `linear-gradient(135deg, ${tab.color}, ${tab.color}cc)` } : {}}
                >
                    <tab.icon size={14} />
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

export default function Dashboard({ games }) {
    const [category, setCategory] = useState('batting');
    const [filter, setFilter] = useState('all');
    const [showComparison, setShowComparison] = useState(false);

    // フィルタリングされたゲームデータ
    const filteredGames = useMemo(() => {
        if (filter === 'all') return games;
        return games.filter(g => g.type === filter);
    }, [games, filter]);

    // 全打席データを取得（フィルタ適用）
    const allAtBats = useMemo(() => {
        return filteredGames.flatMap(g =>
            (g.at_bats || []).map(ab => ({ ...ab, _gameType: g.type, _gameBat: g.bat }))
        );
    }, [filteredGames]);

    // スプレーチャート用：全打席データにゲームタイプを追加
    const allAtBatsForSpray = useMemo(() => {
        return games.flatMap(g =>
            (g.at_bats || []).map(ab => ({ ...ab, _gameType: g.type }))
        );
    }, [games]);

    const sprayAtBats = useMemo(() => {
        if (filter === 'all') return allAtBatsForSpray;
        return allAtBatsForSpray.filter(ab => ab._gameType === filter);
    }, [allAtBatsForSpray, filter]);

    // 基本スタッツ
    const stats = useMemo(() => calculateStats(allAtBats), [allAtBats]);

    // 試合/練習の個別スタッツ（比較用）
    const gameAtBats = useMemo(() =>
        games.filter(g => g.type === 'game').flatMap(g => (g.at_bats || [])),
        [games]
    );
    const practiceAtBats = useMemo(() =>
        games.filter(g => g.type === 'practice').flatMap(g => (g.at_bats || [])),
        [games]
    );
    const gameStats = useMemo(() => calculateStats(gameAtBats), [gameAtBats]);
    const practiceStats = useMemo(() => calculateStats(practiceAtBats), [practiceAtBats]);

    // バット別スタッツ
    const batStats = useMemo(() => calculateStatsByBat(filteredGames), [filteredGames]);

    // 打球方向分析（結果別の打球ゾーン分布）
    const directionAnalysis = useMemo(() => {
        const zones = { left: 0, center: 0, right: 0 };
        allAtBats.filter(ab => ab.direction).forEach(ab => {
            const x = ab.direction.x;
            if (x < 160) zones.left++;
            else if (x > 240) zones.right++;
            else zones.center++;
        });
        const total = zones.left + zones.center + zones.right;
        return [
            { name: 'レフト方向', value: zones.left, percentage: total ? (zones.left / total * 100).toFixed(1) : 0 },
            { name: 'センター方向', value: zones.center, percentage: total ? (zones.center / total * 100).toFixed(1) : 0 },
            { name: 'ライト方向', value: zones.right, percentage: total ? (zones.right / total * 100).toFixed(1) : 0 },
        ];
    }, [allAtBats]);

    // 三振分析
    const strikeoutAnalysis = useMemo(() => {
        const ks = allAtBats.filter(ab => ab.result === 'K');
        const swinging = ks.filter(ab => ab.strikeoutType === 'swinging').length;
        const looking = ks.filter(ab => ab.strikeoutType === 'looking').length;

        // コース別三振
        const zoneBreakdown = {};
        ks.forEach(ab => {
            if (ab.strikeoutZone) {
                const zone = ZONE_OPTIONS.find(z => z.value === ab.strikeoutZone);
                const label = zone ? zone.label : ab.strikeoutZone;
                zoneBreakdown[label] = (zoneBreakdown[label] || 0) + 1;
            }
        });

        return {
            total: ks.length,
            swinging,
            looking,
            zoneBreakdown: Object.entries(zoneBreakdown).map(([name, value]) => ({ name, value })),
        };
    }, [allAtBats]);

    // 結果の分布（円グラフ用）
    const resultDistribution = useMemo(() => {
        const dist = {};
        allAtBats.forEach(ab => {
            const opt = RESULT_OPTIONS.find(o => o.value === ab.result);
            const label = opt ? opt.short : ab.result;
            dist[label] = (dist[label] || 0) + 1;
        });
        return Object.entries(dist)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [allAtBats]);

    const RESULT_COLORS = [
        '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
        '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#a855f7',
        '#64748b', '#78716c', '#6366f1', '#0ea5e9', '#84cc16',
    ];

    // バット別打率データ（棒グラフ用）
    const batChartData = useMemo(() => {
        return Object.entries(batStats).map(([bat, s]) => ({
            name: bat,
            打率: s.battingAverage,
            OPS: s.ops,
            打席: s.plateAppearances,
        }));
    }, [batStats]);

    // レーダーチャート用比較データ
    const radarData = useMemo(() => {
        if (gameStats.plateAppearances === 0 && practiceStats.plateAppearances === 0) return [];
        return [
            { subject: '打率', 試合: gameStats.battingAverage, 練習: practiceStats.battingAverage, max: 1 },
            { subject: '出塁率', 試合: gameStats.onBasePercentage, 練習: practiceStats.onBasePercentage, max: 1 },
            { subject: 'コンタクト率', 試合: gameStats.contactRate, 練習: practiceStats.contactRate, max: 1 },
            { subject: '有効打球率', 試合: gameStats.qualityContactRate, 練習: practiceStats.qualityContactRate, max: 1 },
            { subject: '長打率', 試合: gameStats.sluggingPercentage, 練習: practiceStats.sluggingPercentage, max: 2 },
        ];
    }, [gameStats, practiceStats]);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* カテゴリタブ */}
            <CategoryTabs value={category} onChange={setCategory} />

            {/* 投球ダッシュボード */}
            {category === 'pitching' && (
                <PitchingDashboard games={games} />
            )}

            {/* 守備ダッシュボード */}
            {category === 'fielding' && (
                <FieldingDashboard games={games} />
            )}

            {/* 打撃ダッシュボード - データなし */}
            {category === 'batting' && games.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <BarChart3 size={64} className="text-text-muted mb-4" />
                    <h3 className="text-xl font-heading font-bold text-text-primary mb-2">データがありません</h3>
                    <p className="text-text-secondary">試合や練習データを入力すると、ここに分析結果が表示されます</p>
                </div>
            )}

            {/* 打撃ダッシュボード（既存） */}
            {category === 'batting' && games.length > 0 && (
                <>
                    {/* フィルター & コントロール */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <FilterToggle value={filter} onChange={setFilter} />
                        <button
                            onClick={() => setShowComparison(!showComparison)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${showComparison
                                ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                                : 'glass text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            <GitCompare size={16} />
                            比較分析
                        </button>
                    </div>

                    {/* 基本スタッツカード */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <StatCard
                            label="打率"
                            value={formatStat(stats.battingAverage)}
                            subValue={`${stats.hits}安打 / ${stats.atBatCount}打数`}
                            icon={Target}
                            color="#10b981"
                            delay={0}
                        />
                        <StatCard
                            label="出塁率"
                            value={formatStat(stats.onBasePercentage)}
                            subValue={`${stats.plateAppearances}打席`}
                            icon={TrendingUp}
                            color="#3b82f6"
                            delay={50}
                        />
                        <StatCard
                            label="長打率"
                            value={formatStat(stats.sluggingPercentage)}
                            subValue={`${stats.totalBases}塁打`}
                            icon={Zap}
                            color="#f59e0b"
                            delay={100}
                        />
                        <StatCard
                            label="OPS"
                            value={formatStat(stats.ops)}
                            subValue="出塁率+長打率"
                            icon={Activity}
                            color="#8b5cf6"
                            delay={150}
                        />
                        <StatCard
                            label="コンタクト率"
                            value={formatPercent(stats.contactRate)}
                            subValue="バットに当てた確率"
                            icon={Eye}
                            color="#06b6d4"
                            delay={200}
                        />
                        <StatCard
                            label="有効打球率"
                            value={formatPercent(stats.qualityContactRate)}
                            subValue="ライナー/会心の割合"
                            icon={Zap}
                            color="#f97316"
                            delay={250}
                        />
                    </div>

                    {/* 比較分析セクション */}
                    {showComparison && (
                        <div className="space-y-4 animate-slideUp">
                            <h3 className="text-lg font-heading font-bold text-text-primary flex items-center gap-2">
                                <GitCompare size={20} className="text-accent-purple" />
                                試合 vs 練習 ギャップ分析
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                <ComparisonCard label="打率" gameValue={gameStats.battingAverage} practiceValue={practiceStats.battingAverage} />
                                <ComparisonCard label="出塁率" gameValue={gameStats.onBasePercentage} practiceValue={practiceStats.onBasePercentage} />
                                <ComparisonCard label="OPS" gameValue={gameStats.ops} practiceValue={practiceStats.ops} />
                                <ComparisonCard
                                    label="コンタクト率"
                                    gameValue={gameStats.contactRate}
                                    practiceValue={practiceStats.contactRate}
                                    formatter={formatPercent}
                                />
                                <ComparisonCard
                                    label="有効打球率"
                                    gameValue={gameStats.qualityContactRate}
                                    practiceValue={practiceStats.qualityContactRate}
                                    formatter={formatPercent}
                                />
                            </div>

                            {/* レーダーチャート */}
                            {radarData.length > 0 && (
                                <div className="glass rounded-xl p-4">
                                    <h4 className="text-sm font-heading font-semibold text-text-primary mb-3">能力比較レーダー</h4>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <RadarChart data={radarData}>
                                            <PolarGrid stroke="#2a3450" />
                                            <PolarAngleAxis
                                                dataKey="subject"
                                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                            />
                                            <PolarRadiusAxis tick={false} axisLine={false} />
                                            <Radar
                                                name="試合"
                                                dataKey="試合"
                                                stroke="#3b82f6"
                                                fill="#3b82f6"
                                                fillOpacity={0.3}
                                                strokeWidth={2}
                                            />
                                            <Radar
                                                name="練習"
                                                dataKey="練習"
                                                stroke="#f59e0b"
                                                fill="#f59e0b"
                                                fillOpacity={0.2}
                                                strokeWidth={2}
                                                strokeDasharray="5 5"
                                            />
                                            <Legend
                                                wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    )}

                    {/* スプレーチャート & 打球方向分析 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="glass rounded-xl p-4">
                            <h3 className="text-sm font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
                                <Target size={16} className="text-accent-emerald" />
                                スプレーチャート
                            </h3>
                            <div className="flex justify-center">
                                <SprayChart atBats={sprayAtBats} filterType={filter} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* 打球方向の分布 */}
                            <div className="glass rounded-xl p-4">
                                <h3 className="text-sm font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
                                    <BarChart3 size={16} className="text-accent-blue" />
                                    打球方向の傾向
                                </h3>
                                <div className="space-y-3">
                                    {directionAnalysis.map((zone, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-text-secondary">{zone.name}</span>
                                                <span className="text-text-primary font-medium">{zone.value}本 ({zone.percentage}%)</span>
                                            </div>
                                            <div className="h-2 bg-bg-input rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${zone.percentage}%`,
                                                        background: `linear-gradient(90deg, ${['#3b82f6', '#10b981', '#f59e0b'][i]}, ${['#60a5fa', '#34d399', '#fbbf24'][i]})`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 結果の分布（円グラフ） */}
                            <div className="glass rounded-xl p-4">
                                <h3 className="text-sm font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
                                    <Activity size={16} className="text-accent-amber" />
                                    結果の内訳
                                </h3>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie
                                            data={resultDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            dataKey="value"
                                            paddingAngle={2}
                                            label={({ name, value }) => `${name}(${value})`}
                                            labelLine={false}
                                        >
                                            {resultDistribution.map((_, i) => (
                                                <Cell key={i} fill={RESULT_COLORS[i % RESULT_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* 三振分析 */}
                    {strikeoutAnalysis.total > 0 && (
                        <div className="glass rounded-xl p-4 animate-slideUp">
                            <h3 className="text-sm font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
                                <Eye size={16} className="text-accent-red" />
                                三振分析
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-bg-input rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold font-heading text-accent-red">{strikeoutAnalysis.total}</div>
                                    <div className="text-xs text-text-muted">三振数</div>
                                </div>
                                <div className="bg-bg-input rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold font-heading text-accent-orange">{strikeoutAnalysis.swinging}</div>
                                    <div className="text-xs text-text-muted">空振り三振</div>
                                </div>
                                <div className="bg-bg-input rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold font-heading text-accent-amber">{strikeoutAnalysis.looking}</div>
                                    <div className="text-xs text-text-muted">見逃し三振</div>
                                </div>
                                <div className="bg-bg-input rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold font-heading text-accent-cyan">
                                        {formatPercent(stats.strikeoutRate)}
                                    </div>
                                    <div className="text-xs text-text-muted">三振率</div>
                                </div>
                            </div>

                            {/* コース別三振 */}
                            {strikeoutAnalysis.zoneBreakdown.length > 0 && (
                                <div className="mt-3">
                                    <h4 className="text-xs text-text-secondary mb-2">コース別三振分布</h4>
                                    <ResponsiveContainer width="100%" height={150}>
                                        <BarChart data={strikeoutAnalysis.zoneBreakdown} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#2a3450" />
                                            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                width={80}
                                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} name="三振数" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    )}

                    {/* バット別スタッツ */}
                    {Object.keys(batStats).length > 1 && (
                        <div className="glass rounded-xl p-4 animate-slideUp">
                            <h3 className="text-sm font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
                                <BarChart3 size={16} className="text-accent-purple" />
                                バット別成績
                            </h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={batChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3450" />
                                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="打率" fill="#10b981" radius={[4, 4, 0, 0]} name="打率" />
                                    <Bar dataKey="OPS" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="OPS" />
                                    <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                                </BarChart>
                            </ResponsiveContainer>
                            {/* バット別詳細テーブル */}
                            <div className="mt-3 overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-2 px-2 text-text-secondary font-medium">バット</th>
                                            <th className="text-center py-2 px-2 text-text-secondary font-medium">打席</th>
                                            <th className="text-center py-2 px-2 text-text-secondary font-medium">打率</th>
                                            <th className="text-center py-2 px-2 text-text-secondary font-medium">OPS</th>
                                            <th className="text-center py-2 px-2 text-text-secondary font-medium">コンタクト率</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(batStats).map(([bat, s]) => (
                                            <tr key={bat} className="border-b border-border/30 hover:bg-bg-card-hover/50">
                                                <td className="py-2 px-2 text-text-primary font-medium">{bat}</td>
                                                <td className="text-center py-2 px-2 text-text-secondary">{s.plateAppearances}</td>
                                                <td className="text-center py-2 px-2 text-accent-emerald font-medium">{formatStat(s.battingAverage)}</td>
                                                <td className="text-center py-2 px-2 text-accent-purple font-medium">{formatStat(s.ops)}</td>
                                                <td className="text-center py-2 px-2 text-accent-cyan font-medium">{formatPercent(s.contactRate)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
