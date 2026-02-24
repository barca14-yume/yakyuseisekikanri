/**
 * 試合/練習セッション一覧コンポーネント
 * セッションのリスト表示、詳細表示、編集、削除機能
 */

import { useState, useMemo } from 'react';
import {
    Calendar, ChevronRight, Trash2, Edit3, Swords, Dumbbell,
    MoreVertical, X, Eye,
} from 'lucide-react';
import {
    RESULT_OPTIONS, HIT_RESULTS, QUALITY_OPTIONS, SESSION_TYPE_OPTIONS,
    PITCH_RESULT_OPTIONS, ZONE_OPTIONS, PITCH_TYPE_OPTIONS, FOUL_DIRECTION_OPTIONS,
    POSITION_OPTIONS, FIELDING_PLAY_OPTIONS, FIELDING_RESULT_OPTIONS,
} from '../utils/constants';
import { calculateStats, formatStat } from '../utils/stats';

// 打席結果のバッジ
function MiniResultBadge({ result }) {
    const opt = RESULT_OPTIONS.find(o => o.value === result);
    const isHit = HIT_RESULTS.includes(result);
    const bgColor = isHit
        ? 'bg-accent-red/20 text-accent-red'
        : result === 'K'
            ? 'bg-accent-amber/20 text-accent-amber'
            : result === 'BB' || result === 'HBP'
                ? 'bg-accent-emerald/20 text-accent-emerald'
                : 'bg-bg-input text-text-secondary';

    return (
        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${bgColor}`}>
            {opt ? opt.short : result}
        </span>
    );
}

// セッション詳細モーダル
function SessionDetail({ game, onClose, onEdit, onDelete }) {
    const stats = useMemo(() => calculateStats(game.at_bats || []), [game.at_bats]);
    const isGame = game.type === 'game';

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div
                className="w-full max-w-lg max-h-[85vh] bg-bg-card rounded-t-2xl sm:rounded-2xl overflow-y-auto border border-border shadow-2xl animate-slideUp"
                onClick={e => e.stopPropagation()}
            >
                {/* ヘッダー */}
                <div className="sticky top-0 bg-bg-card/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isGame ? 'bg-accent-blue/10' : 'bg-accent-amber/10'}`}>
                            {isGame ? <Swords size={18} className="text-accent-blue" /> : <Dumbbell size={18} className="text-accent-amber" />}
                        </div>
                        <div>
                            <h3 className="font-heading font-bold text-text-primary text-sm">
                                {isGame ? (game.opponent || '試合') : (game.tournament || '練習')}
                            </h3>
                            <p className="text-xs text-text-muted">{game.date} {game.tournament && isGame ? `・${game.tournament}` : ''}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* スタッツサマリー */}
                <div className="p-4 grid grid-cols-3 gap-2">
                    <div className="bg-bg-input rounded-lg p-3 text-center">
                        <div className="text-xl font-bold font-heading text-accent-emerald">{formatStat(stats.battingAverage)}</div>
                        <div className="text-[10px] text-text-muted">打率</div>
                    </div>
                    <div className="bg-bg-input rounded-lg p-3 text-center">
                        <div className="text-xl font-bold font-heading text-accent-purple">{formatStat(stats.ops)}</div>
                        <div className="text-[10px] text-text-muted">OPS</div>
                    </div>
                    <div className="bg-bg-input rounded-lg p-3 text-center">
                        <div className="text-xl font-bold font-heading text-text-primary">
                            {stats.hits}/{stats.atBatCount}
                        </div>
                        <div className="text-[10px] text-text-muted">安打/打数</div>
                    </div>
                </div>

                {/* 使用バット */}
                {game.bat && (
                    <div className="px-4 pb-2">
                        <span className="text-xs text-text-muted">🏏 {game.bat}</span>
                    </div>
                )}

                {/* 打席詳細 */}
                <div className="px-4 pb-4 space-y-2">
                    <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider">打席詳細</h4>
                    {(game.at_bats || []).map((ab, i) => (
                        <div key={ab.id || i} className="bg-bg-input rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-text-muted font-mono">#{i + 1}</span>
                                    {ab.inning && <span className="text-[10px] text-text-muted">{ab.inning}回</span>}
                                    <MiniResultBadge result={ab.result} />
                                </div>
                                <div className="flex items-center gap-2">
                                    {ab.pitches && ab.pitches.length > 0 && (
                                        <span className="text-[10px] text-text-muted">{ab.pitches.length}球</span>
                                    )}
                                    {ab.count && (
                                        <span className="text-[10px] text-text-muted">{ab.count.balls}-{ab.count.strikes}</span>
                                    )}
                                </div>
                            </div>
                            {/* 投球履歴バッジ */}
                            {ab.pitches && ab.pitches.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5 mb-1">
                                    {ab.pitches.map((p, pi) => {
                                        const pOpt = PITCH_RESULT_OPTIONS.find(o => o.value === p.result);
                                        if (!pOpt) return null;
                                        return (
                                            <span
                                                key={p.id || pi}
                                                className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                                                style={{
                                                    backgroundColor: pOpt.color + '20',
                                                    color: pOpt.color,
                                                    border: `1px solid ${pOpt.color}30`,
                                                }}
                                                title={`${pi + 1}球目: ${pOpt.label}${p.foulDirection ? ` (${FOUL_DIRECTION_OPTIONS.find(f => f.value === p.foulDirection)?.label || ''})` : ''}${p.zone ? ` [${ZONE_OPTIONS.find(z => z.value === p.zone)?.label || ''}]` : ''}`}
                                            >
                                                {pOpt.short}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                            <div className="flex flex-wrap gap-1 mt-1">
                                {ab.type && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-bg-card rounded text-text-muted">{ab.type}</span>
                                )}
                                {ab.quality && (
                                    <span
                                        className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                                        style={{ color: QUALITY_OPTIONS.find(q => q.value === ab.quality)?.color, backgroundColor: `${QUALITY_OPTIONS.find(q => q.value === ab.quality)?.color}15` }}
                                    >
                                        {QUALITY_OPTIONS.find(q => q.value === ab.quality)?.label}
                                    </span>
                                )}
                                {ab.pitchType && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-bg-card rounded text-text-muted">{ab.pitchType}</span>
                                )}
                            </div>
                            {ab.notes && (
                                <p className="text-[10px] text-text-muted mt-1.5 leading-relaxed">{ab.notes}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* 投手成績 */}
                {game.pitching && game.pitching.innings > 0 && (
                    <div className="px-4 pb-3">
                        <h4 className="text-xs font-heading font-semibold text-text-primary mb-2 flex items-center gap-1.5">
                            ⚾ 投手成績
                            {game.pitching.decision && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${game.pitching.decision === 'win' ? 'bg-accent-emerald/15 text-accent-emerald' :
                                    game.pitching.decision === 'loss' ? 'bg-accent-red/15 text-accent-red' :
                                        'bg-bg-input text-text-muted'
                                    }`}>
                                    {game.pitching.decision === 'win' ? '○' : game.pitching.decision === 'loss' ? '●' : '-'}
                                </span>
                            )}
                        </h4>
                        <div className="grid grid-cols-4 gap-1.5">
                            {[
                                { label: '回', value: game.pitching.innings },
                                { label: '球数', value: game.pitching.pitchCount },
                                { label: '被安打', value: game.pitching.hits },
                                { label: '奪三振', value: game.pitching.strikeouts },
                                { label: '四球', value: game.pitching.walks },
                                { label: '失点', value: game.pitching.runs },
                                { label: '自責', value: game.pitching.earnedRuns },
                                { label: '対戦', value: game.pitching.battersFaced },
                            ].map((s, i) => (
                                <div key={i} className="bg-bg-input rounded p-1.5 text-center">
                                    <div className="text-sm font-bold font-heading text-text-primary">{s.value || 0}</div>
                                    <div className="text-[9px] text-text-muted">{s.label}</div>
                                </div>
                            ))}
                        </div>
                        {game.pitching.notes && (
                            <p className="text-[10px] text-text-muted mt-1.5">{game.pitching.notes}</p>
                        )}
                    </div>
                )}

                {/* 守備記録 */}
                {game.fielding && game.fielding.length > 0 && (
                    <div className="px-4 pb-3">
                        <h4 className="text-xs font-heading font-semibold text-text-primary mb-2">🧤 守備記録 ({game.fielding.length})</h4>
                        <div className="space-y-1.5">
                            {game.fielding.map((f, i) => {
                                const posOpt = POSITION_OPTIONS.find(p => p.value === f.position);
                                const playOpt = FIELDING_PLAY_OPTIONS.find(p => p.value === f.playType);
                                const resultOpt = FIELDING_RESULT_OPTIONS.find(r => r.value === f.result);
                                return (
                                    <div key={f.id || i} className="bg-bg-input rounded p-2 flex items-center gap-2 text-xs">
                                        <span className="text-text-muted font-mono text-[10px]">#{i + 1}</span>
                                        {f.inning && <span className="text-[10px] text-text-muted">{f.inning}回</span>}
                                        <span className="font-medium px-1.5 py-0.5 bg-accent-blue/10 text-accent-blue rounded text-[10px]">
                                            {posOpt?.label || f.position}
                                        </span>
                                        <span className="text-text-secondary">{playOpt?.icon} {playOpt?.label}</span>
                                        <span
                                            className="font-medium px-1.5 py-0.5 rounded text-[10px]"
                                            style={{ color: resultOpt?.color, backgroundColor: resultOpt?.color + '15' }}
                                        >
                                            {resultOpt?.label || f.result}
                                        </span>
                                        {f.notes && <span className="text-text-muted text-[10px] truncate flex-1">{f.notes}</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* アクションボタン */}
                <div className="sticky bottom-0 bg-bg-card/95 backdrop-blur-sm border-t border-border p-4 flex gap-2">
                    <button
                        onClick={() => onEdit(game)}
                        className="flex-1 flex items-center justify-center gap-2 bg-accent-blue/10 text-accent-blue px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-blue/20 transition-colors"
                    >
                        <Edit3 size={14} />
                        編集
                    </button>
                    <button
                        onClick={() => { if (window.confirm('このセッションを削除しますか？')) onDelete(game.id); }}
                        className="flex items-center justify-center gap-2 bg-accent-red/10 text-accent-red px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-red/20 transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function GameList({ games, onEdit, onDelete }) {
    const [selectedGame, setSelectedGame] = useState(null);
    const [typeFilter, setTypeFilter] = useState('all');

    const filteredGames = useMemo(() => {
        const sorted = [...games].sort((a, b) => new Date(b.date) - new Date(a.date));
        if (typeFilter === 'all') return sorted;
        return sorted.filter(g => g.type === typeFilter);
    }, [games, typeFilter]);

    if (games.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
                <Calendar size={64} className="text-text-muted mb-4" />
                <h3 className="text-xl font-heading font-bold text-text-primary mb-2">まだデータがありません</h3>
                <p className="text-text-secondary">「+新規入力」ボタンで試合や練習のデータを追加しましょう</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 animate-fadeIn">
            {/* フィルター */}
            <div className="flex bg-bg-input rounded-lg p-1 gap-1 text-xs">
                {[
                    { key: 'all', label: 'すべて' },
                    { key: 'game', label: '試合' },
                    { key: 'practice', label: '練習' },
                ].map(opt => (
                    <button
                        key={opt.key}
                        onClick={() => setTypeFilter(opt.key)}
                        className={`flex-1 px-2 py-1.5 rounded-md font-medium transition-all ${typeFilter === opt.key
                            ? 'bg-bg-card text-text-primary shadow'
                            : 'text-text-muted hover:text-text-secondary'
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* セッションリスト */}
            {filteredGames.map((game, index) => {
                const stats = calculateStats(game.at_bats || []);
                const isGame = game.type === 'game';
                const atBatCount = game.at_bats?.length || 0;

                return (
                    <div
                        key={game.id}
                        className="glass rounded-xl p-4 hover:bg-bg-card-hover transition-all duration-200 cursor-pointer animate-slideUp active:scale-[0.99]"
                        style={{ animationDelay: `${index * 40}ms` }}
                        onClick={() => setSelectedGame(game)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`p-2 rounded-lg shrink-0 ${isGame ? 'bg-accent-blue/10' : 'bg-accent-amber/10'}`}>
                                    {isGame ? <Swords size={16} className="text-accent-blue" /> : <Dumbbell size={16} className="text-accent-amber" />}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-heading font-semibold text-text-primary text-sm truncate">
                                            {isGame ? (game.opponent || '試合') : (game.tournament || '練習')}
                                        </h4>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isGame ? 'bg-accent-blue/10 text-accent-blue' : 'bg-accent-amber/10 text-accent-amber'
                                            }`}>
                                            {isGame ? '試合' : '練習'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-text-muted">{game.date}</span>
                                        {game.tournament && isGame && (
                                            <span className="text-xs text-text-muted">・{game.tournament}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                {atBatCount > 0 && (
                                    <div className="text-right">
                                        <div className="text-lg font-bold font-heading text-accent-emerald leading-none">
                                            {formatStat(stats.battingAverage)}
                                        </div>
                                        <div className="text-[10px] text-text-muted mt-0.5">
                                            {stats.hits}-{stats.atBatCount} ({atBatCount}打席)
                                        </div>
                                    </div>
                                )}
                                <ChevronRight size={16} className="text-text-muted" />
                            </div>
                        </div>

                        {/* 打席結果のプレビュー */}
                        {atBatCount > 0 && (
                            <div className="flex gap-1 mt-2.5 flex-wrap">
                                {(game.at_bats || []).map((ab, i) => (
                                    <MiniResultBadge key={ab.id || i} result={ab.result} />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* 詳細モーダル */}
            {selectedGame && (
                <SessionDetail
                    game={selectedGame}
                    onClose={() => setSelectedGame(null)}
                    onEdit={(g) => { setSelectedGame(null); onEdit(g); }}
                    onDelete={(id) => { setSelectedGame(null); onDelete(id); }}
                />
            )}
        </div>
    );
}
