/**
 * 試合/練習セッション入力フォームコンポーネント
 * 試合情報の入力と打席データの追加を行う
 * 1球ごとの投球記録機能を含む
 */

import { useState, useCallback, useMemo } from 'react';
import {
    Plus, Save, X, ChevronDown, ChevronUp, Trash2,
    Calendar, Users, Trophy, Swords, Dumbbell, StickyNote,
    Circle, Undo2,
} from 'lucide-react';
import SprayChart from './SprayChart';
import {
    RESULT_OPTIONS, BALL_TYPE_OPTIONS, QUALITY_OPTIONS,
    PITCH_TYPE_OPTIONS, ZONE_OPTIONS, STRIKEOUT_TYPE_OPTIONS,
    BAT_OPTIONS, SESSION_TYPE_OPTIONS, HIT_RESULTS, IN_PLAY_RESULTS,
    PITCH_RESULT_OPTIONS, FOUL_DIRECTION_OPTIONS,
    POSITION_OPTIONS, FIELDING_PLAY_OPTIONS, FIELDING_RESULT_OPTIONS,
    PITCHING_DECISION_OPTIONS,
    calculateCountFromPitches,
} from '../utils/constants';

// 入力フィールドコンポーネント
function FormField({ label, children, className = '' }) {
    return (
        <div className={className}>
            <label className="block text-xs text-text-secondary font-medium mb-1.5">{label}</label>
            {children}
        </div>
    );
}

// セレクトタグコンポーネント
function TagSelect({ options, value, onChange, multiple = false, colorMap }) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {options.map(opt => {
                const isSelected = multiple
                    ? (value || []).includes(opt.value)
                    : value === opt.value;

                const bgColor = colorMap?.[opt.value] || (isSelected ? '#3b82f6' : 'transparent');

                return (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                            if (multiple) {
                                const newVal = isSelected
                                    ? (value || []).filter(v => v !== opt.value)
                                    : [...(value || []), opt.value];
                                onChange(newVal);
                            } else {
                                onChange(isSelected ? '' : opt.value);
                            }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${isSelected
                            ? 'text-white border-transparent shadow-md'
                            : 'text-text-secondary border-border hover:border-border-light hover:text-text-primary bg-bg-input'
                            }`}
                        style={isSelected ? { backgroundColor: bgColor, borderColor: bgColor } : {}}
                    >
                        {opt.icon && <span className="mr-1">{opt.icon}</span>}
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

/**
 * カウント表示コンポーネント
 * 野球のスコアボード風にB-S-Oを表示
 */
function CountDisplay({ balls, strikes }) {
    return (
        <div className="flex items-center gap-3 bg-bg-input rounded-lg px-3 py-2">
            {/* ボール */}
            <div className="flex items-center gap-1">
                <span className="text-[10px] text-text-muted font-bold w-3">B</span>
                <div className="flex gap-1">
                    {[0, 1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-full border transition-all ${i < balls
                                ? 'bg-accent-emerald border-accent-emerald shadow-sm shadow-accent-emerald/30'
                                : 'border-border-light'
                                }`}
                        />
                    ))}
                </div>
            </div>
            {/* ストライク */}
            <div className="flex items-center gap-1">
                <span className="text-[10px] text-text-muted font-bold w-3">S</span>
                <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-full border transition-all ${i < strikes
                                ? 'bg-accent-amber border-accent-amber shadow-sm shadow-accent-amber/30'
                                : 'border-border-light'
                                }`}
                        />
                    ))}
                </div>
            </div>
            {/* カウントのテキスト */}
            <span className="text-sm font-bold font-heading text-text-primary ml-1">
                {balls}-{strikes}
            </span>
        </div>
    );
}

/**
 * 投球結果バッジ（ミニ表示用）
 */
function PitchResultBadge({ pitch, number }) {
    const opt = PITCH_RESULT_OPTIONS.find(o => o.value === pitch.result);
    if (!opt) return null;

    return (
        <div
            className="flex flex-col items-center justify-center w-9 h-11 rounded-lg text-white text-[10px] font-bold transition-all duration-200 relative"
            style={{ backgroundColor: opt.color + '30', color: opt.color, border: `1px solid ${opt.color}40` }}
            title={`${number}球目: ${opt.label}${pitch.foulDirection ? ` (${FOUL_DIRECTION_OPTIONS.find(f => f.value === pitch.foulDirection)?.label || ''})` : ''}${pitch.zone ? ` [${ZONE_OPTIONS.find(z => z.value === pitch.zone)?.label || ''}]` : ''}`}
        >
            <span className="text-[8px] opacity-60">{number}</span>
            <span className="leading-none">{opt.short}</span>
        </div>
    );
}

/**
 * 1球入力フォーム
 * 投球結果、コース、球種、ファウル方向を入力
 */
function PitchInputForm({ onAdd, onCancel, currentCount }) {
    const [pitch, setPitch] = useState({
        result: '',
        zone: '',
        pitchType: '',
        foulDirection: '',
        notes: '',
    });

    const isFoul = pitch.result === 'foul' || pitch.result === 'foul_tip';

    const handleAdd = () => {
        if (!pitch.result) return;
        onAdd({
            ...pitch,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        });
        // 入力後にリセット（球種は前の値を保持）
        setPitch(prev => ({
            result: '',
            zone: '',
            pitchType: prev.pitchType,
            foulDirection: '',
            notes: '',
        }));
    };

    // 投球結果の色マッピング
    const resultColorMap = {};
    PITCH_RESULT_OPTIONS.forEach(o => { resultColorMap[o.value] = o.color; });

    return (
        <div className="bg-bg-input/50 rounded-lg p-3 space-y-3 border border-accent-cyan/20 animate-fadeIn">
            <div className="flex items-center justify-between">
                <h5 className="text-xs font-semibold text-accent-cyan flex items-center gap-1.5">
                    <Circle size={10} className="text-accent-cyan" />
                    投球を記録
                    <span className="text-text-muted font-normal ml-1">
                        (カウント {currentCount.balls}-{currentCount.strikes})
                    </span>
                </h5>
            </div>

            {/* 投球結果 */}
            <FormField label="投球結果">
                <TagSelect
                    options={PITCH_RESULT_OPTIONS.map(o => ({ ...o, label: o.short + ' ' + o.label }))}
                    value={pitch.result}
                    onChange={v => setPitch(prev => ({ ...prev, result: v }))}
                    colorMap={resultColorMap}
                />
            </FormField>

            {/* コース */}
            {pitch.result && (
                <FormField label="コース">
                    <TagSelect
                        options={ZONE_OPTIONS}
                        value={pitch.zone}
                        onChange={v => setPitch(prev => ({ ...prev, zone: v }))}
                    />
                </FormField>
            )}

            {/* 球種 */}
            {pitch.result && (
                <FormField label="球種">
                    <TagSelect
                        options={PITCH_TYPE_OPTIONS}
                        value={pitch.pitchType}
                        onChange={v => setPitch(prev => ({ ...prev, pitchType: v }))}
                    />
                </FormField>
            )}

            {/* ファウル方向 */}
            {isFoul && (
                <FormField label="ファウルの方向">
                    <TagSelect
                        options={FOUL_DIRECTION_OPTIONS}
                        value={pitch.foulDirection}
                        onChange={v => setPitch(prev => ({ ...prev, foulDirection: v }))}
                    />
                </FormField>
            )}

            {/* メモ */}
            {pitch.result && (
                <FormField label="メモ（任意）">
                    <input
                        type="text"
                        value={pitch.notes}
                        onChange={e => setPitch(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full bg-bg-primary border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:border-accent-cyan focus:outline-none transition-colors"
                        placeholder="例：インコースの速球をファウルで粘った"
                    />
                </FormField>
            )}

            {/* ボタン */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!pitch.result}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-accent-cyan to-accent-blue text-white px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-accent-cyan/20 transition-all duration-200"
                >
                    <Plus size={14} />
                    この投球を記録
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-3 py-2 rounded-lg text-xs text-text-muted hover:text-text-secondary border border-border/50 hover:border-border transition-colors"
                >
                    閉じる
                </button>
            </div>
        </div>
    );
}


// 打席入力のサブフォーム
function AtBatForm({ atBat, onChange, onSave, onCancel, isNew }) {
    const [showPitchInput, setShowPitchInput] = useState(false);

    const pitches = atBat.pitches || [];
    const count = useMemo(() => calculateCountFromPitches(pitches), [pitches]);

    // 最後の投球がインプレーまたは死球かどうか
    const lastPitch = pitches.length > 0 ? pitches[pitches.length - 1] : null;
    const hasTerminalPitch = lastPitch && (lastPitch.result === 'in_play' || lastPitch.result === 'hit_by_pitch');

    // 三振判定：3ストライクで空振りまたは見逃しで終了
    const isStrikeoutByPitches = count.strikes >= 3;
    // 四球判定：4ボールで終了
    const isWalkByPitches = count.balls >= 4;

    // 打席が完了しているか（投球結果に基づく自動判定）
    const isAtBatCompleteByPitches = hasTerminalPitch || isStrikeoutByPitches || isWalkByPitches;
    // ユーザーが手動で結果を確定させたか（四球、三振、アウト、ヒットなど）
    const isResultManuallySet = !!atBat.result && !isAtBatCompleteByPitches;

    // 投球入力を隠す条件：投球によって打席が終わっている場合、または、
    // まだ投球がないのに手動で結果（四球など）を指定して保存しようとしている場合。
    // ※ただし、投球途中で結果を上書きした場合は投球を続けられるようにする？
    // いや、原則として「既に結果が出ている」なら投球は追加できないのが自然。
    const hidePitchInput = isAtBatCompleteByPitches;

    // 結果がインプレー（またはファール）を含む打席かどうか
    const isInPlay = IN_PLAY_RESULTS.includes(atBat.result) || atBat.result === 'F';
    const isStrikeout = atBat.result === 'K';

    const qualityColorMap = {};
    QUALITY_OPTIONS.forEach(q => { qualityColorMap[q.value] = q.color; });

    // 投球を追加
    const handleAddPitch = useCallback((pitch) => {
        const newPitches = [...pitches, pitch];
        const newCount = calculateCountFromPitches(newPitches);
        const updates = { pitches: newPitches };

        // 自動結果判定
        if (pitch.result === 'hit_by_pitch') {
            updates.result = 'HBP';
        } else if (newCount.balls >= 4) {
            updates.result = 'BB';
        } else if (newCount.strikes >= 3) {
            // 三振の種類を自動判定
            updates.result = 'K';
            if (pitch.result === 'strike_swinging' || pitch.result === 'foul_tip') {
                updates.strikeoutType = 'swinging';
            } else {
                updates.strikeoutType = 'looking';
            }
            updates.strikeoutZone = pitch.zone || '';
        } else if (pitch.result === 'in_play') {
            // インプレーの場合はまだ結果を選んでもらう
            setShowPitchInput(false);
        }

        // カウントも更新
        updates.count = { balls: Math.min(newCount.balls, 3), strikes: Math.min(newCount.strikes, 2) };

        onChange(updates);
    }, [pitches, onChange]);

    // 最後の投球を取り消す
    const handleUndoPitch = useCallback(() => {
        if (pitches.length === 0) return;
        const newPitches = pitches.slice(0, -1);
        const newCount = calculateCountFromPitches(newPitches);
        onChange({
            pitches: newPitches,
            count: { balls: Math.min(newCount.balls, 3), strikes: Math.min(newCount.strikes, 2) },
            result: '', // 結果をリセット
            strikeoutType: '',
            strikeoutZone: '',
        });
    }, [pitches, onChange]);

    return (
        <div className="glass rounded-xl p-4 space-y-4 animate-slideUp border border-accent-blue/20">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-heading font-semibold text-text-primary">
                    {isNew ? '打席を追加' : '打席を編集'}
                </h4>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-text-muted hover:text-text-primary transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* イニング */}
            <FormField label="イニング">
                <input
                    type="number"
                    min="1"
                    max="9"
                    value={atBat.inning || ''}
                    onChange={e => onChange({ inning: parseInt(e.target.value) || '' })}
                    className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                    placeholder="1"
                />
            </FormField>

            {/* ===== 1球ごとの投球セクション ===== */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h5 className="text-xs font-heading font-semibold text-text-primary flex items-center gap-1.5">
                        ⚾ 投球記録
                        <span className="text-text-muted font-normal">({pitches.length}球)</span>
                    </h5>
                    <div className="flex items-center gap-2">
                        {pitches.length > 0 && (
                            <button
                                type="button"
                                onClick={handleUndoPitch}
                                className="flex items-center gap-1 text-[10px] text-text-muted hover:text-accent-amber transition-colors"
                                title="最後の投球を取り消す"
                            >
                                <Undo2 size={12} />
                                取消
                            </button>
                        )}
                    </div>
                </div>

                {/* カウント表示 */}
                <CountDisplay balls={count.balls} strikes={count.strikes} />

                {/* 投球履歴の表示 */}
                {pitches.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {pitches.map((p, i) => (
                            <PitchResultBadge key={p.id} pitch={p} number={i + 1} />
                        ))}
                    </div>
                )}

                {/* 投球詳細テーブル */}
                {pitches.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-[10px]">
                            <thead>
                                <tr className="border-b border-border/50">
                                    <th className="text-left py-1 px-1 text-text-muted font-medium">#</th>
                                    <th className="text-left py-1 px-1 text-text-muted font-medium">結果</th>
                                    <th className="text-left py-1 px-1 text-text-muted font-medium">コース</th>
                                    <th className="text-left py-1 px-1 text-text-muted font-medium">球種</th>
                                    <th className="text-left py-1 px-1 text-text-muted font-medium">備考</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pitches.map((p, i) => {
                                    const resultOpt = PITCH_RESULT_OPTIONS.find(o => o.value === p.result);
                                    const zoneOpt = ZONE_OPTIONS.find(z => z.value === p.zone);
                                    const pitchOpt = PITCH_TYPE_OPTIONS.find(pt => pt.value === p.pitchType);
                                    const foulOpt = p.foulDirection ? FOUL_DIRECTION_OPTIONS.find(f => f.value === p.foulDirection) : null;

                                    return (
                                        <tr key={p.id} className="border-b border-border/20 hover:bg-bg-card-hover/30">
                                            <td className="py-1 px-1 text-text-muted font-mono">{i + 1}</td>
                                            <td className="py-1 px-1">
                                                <span
                                                    className="font-medium"
                                                    style={{ color: resultOpt?.color }}
                                                >
                                                    {resultOpt?.label || p.result}
                                                </span>
                                            </td>
                                            <td className="py-1 px-1 text-text-secondary">{zoneOpt?.label || '-'}</td>
                                            <td className="py-1 px-1 text-text-secondary">{pitchOpt?.label || '-'}</td>
                                            <td className="py-1 px-1 text-text-muted">
                                                {foulOpt ? `${foulOpt.label} ` : ''}
                                                {p.notes || ''}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 投球入力フォーム or 追加ボタン */}
                {!hidePitchInput && (
                    showPitchInput ? (
                        <PitchInputForm
                            onAdd={handleAddPitch}
                            onCancel={() => setShowPitchInput(false)}
                            currentCount={count}
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowPitchInput(true)}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 rounded-lg text-xs font-medium hover:bg-accent-cyan/20 transition-all duration-200"
                        >
                            <Plus size={14} />
                            次の1球を記録
                        </button>
                    )
                )}

                {/* 打席完了メッセージ */}
                {isAtBatCompleteByPitches && !hasTerminalPitch && (
                    <div className={`text-xs text-center py-2 rounded-lg font-medium ${isWalkByPitches
                        ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20'
                        : 'bg-accent-amber/10 text-accent-amber border border-accent-amber/20'
                        }`}
                    >
                        {isWalkByPitches ? '🟢 四球（自動判定）' : '🔴 三振（自動判定）'}
                    </div>
                )}
            </div>

            {/* ===== 打席結果 ===== */}
            {hasTerminalPitch && (
                <div className="space-y-3 animate-fadeIn">
                    <FormField label="打席結果（インプレーの結果を選択）">
                        <TagSelect
                            options={RESULT_OPTIONS.filter(o =>
                                IN_PLAY_RESULTS.includes(o.value) || o.value === 'SAC' || o.value === 'SF' || o.value === 'F'
                            ).map(o => ({ ...o, label: o.short }))}
                            value={atBat.result}
                            onChange={v => onChange({ result: v })}
                        />
                    </FormField>
                </div>
            )}

            {/* 直接結果を入力（オプション） */}
            <div className={`border-t border-border/30 pt-3 ${pitches.length > 0 ? 'mt-4' : ''}`}>
                <p className="text-[10px] text-text-muted mb-2">
                    {pitches.length > 0
                        ? '※手動で四球や三振などの結果を直接指定・上書きする場合はこちら'
                        : '※投球記録なしで結果だけ入力する場合はこちら'}
                </p>
                <FormField label="打席結果（すべての選択肢）">
                    <TagSelect
                        options={RESULT_OPTIONS.map(o => ({ ...o, label: o.short }))}
                        value={atBat.result}
                        onChange={v => onChange({ result: v })}
                    />
                </FormField>
            </div>

            {/* 三振の詳細（投球記録から自動設定されるが、手動でも変更可） */}
            {isStrikeout && (
                <div className="space-y-3 p-3 bg-accent-red/5 rounded-lg border border-accent-red/20 animate-fadeIn">
                    <h5 className="text-xs font-semibold text-accent-red flex items-center gap-1">
                        三振の詳細
                    </h5>
                    <FormField label="三振の種類">
                        <TagSelect
                            options={STRIKEOUT_TYPE_OPTIONS}
                            value={atBat.strikeoutType}
                            onChange={v => onChange({ strikeoutType: v })}
                        />
                    </FormField>
                    <FormField label="最終球のコース">
                        <TagSelect
                            options={ZONE_OPTIONS}
                            value={atBat.strikeoutZone}
                            onChange={v => onChange({ strikeoutZone: v })}
                        />
                    </FormField>
                </div>
            )}

            {/* 打球方向（インプレー時） */}
            {isInPlay && (
                <div className="space-y-3 animate-fadeIn">
                    <FormField label="打球位置（タップで指定）">
                        <div className="flex justify-center">
                            <SprayChart
                                interactive={true}
                                onFieldClick={(pos) => onChange({ direction: pos })}
                                selectedPosition={atBat.direction}
                                showLegend={false}
                                height={260}
                            />
                        </div>
                    </FormField>

                    <FormField label="打球の種類">
                        <TagSelect
                            options={BALL_TYPE_OPTIONS}
                            value={atBat.type}
                            onChange={v => onChange({ type: v })}
                        />
                    </FormField>

                    <FormField label="打球のクオリティ">
                        <TagSelect
                            options={QUALITY_OPTIONS}
                            value={atBat.quality}
                            onChange={v => onChange({ quality: v })}
                            colorMap={qualityColorMap}
                        />
                    </FormField>
                </div>
            )}

            {/* メモ */}
            <FormField label="メモ">
                <input
                    type="text"
                    value={atBat.notes || ''}
                    onChange={e => onChange({ notes: e.target.value })}
                    className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                    placeholder="例：外角高めを右中間へ"
                />
            </FormField>

            {/* 保存ボタン */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onSave}
                    disabled={!atBat.result}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gradient-start to-gradient-end text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-accent-blue/20 transition-all duration-200"
                >
                    <Save size={16} />
                    {isNew ? '打席を追加' : '更新する'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary border border-border hover:border-border-light transition-all duration-200"
                >
                    キャンセル
                </button>
            </div>
        </div>
    );
}

// 打席結果の表示バッジ
function ResultBadge({ result }) {
    const opt = RESULT_OPTIONS.find(o => o.value === result);
    const isHit = HIT_RESULTS.includes(result);
    const bgColor = isHit ? 'bg-accent-red/20 text-accent-red' :
        result === 'K' ? 'bg-accent-amber/20 text-accent-amber' :
            result === 'BB' || result === 'HBP' ? 'bg-accent-emerald/20 text-accent-emerald' :
                result === 'F' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-bg-input text-text-secondary';

    return (
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${bgColor}`}>
            {opt ? opt.short : result}
        </span>
    );
}

export default function GameForm({ onSave, onCancel, editGame = null }) {
    const [game, setGame] = useState(editGame || {
        date: new Date().toISOString().split('T')[0],
        opponent: '',
        tournament: '',
        bat: 'Legacy 78cm',
        type: 'game',
        at_bats: [],
        pitching: null,
        fielding: [],
    });

    // 投手成績入力の開閉
    const [showPitching, setShowPitching] = useState(!!(editGame?.pitching));
    // 守備記録入力の開閉
    const [showFielding, setShowFielding] = useState(!!(editGame?.fielding?.length > 0));
    // 守備プレー追加中かどうか
    const [addingFieldingPlay, setAddingFieldingPlay] = useState(false);
    const [editingFieldingPlay, setEditingFieldingPlay] = useState(null);

    const [editingAtBat, setEditingAtBat] = useState(null);
    const [isAddingAtBat, setIsAddingAtBat] = useState(false);
    const [expandedAtBat, setExpandedAtBat] = useState(null);

    const newAtBatTemplate = {
        inning: (game.at_bats?.length || 0) + 1,
        result: '',
        direction: null,
        type: null,
        quality: null,
        notes: '',
        count: { balls: 0, strikes: 0 },
        pitches: [],
        strikeoutType: '',
        strikeoutZone: '',
    };

    const handleGameChange = useCallback((updates) => {
        setGame(prev => ({ ...prev, ...updates }));
    }, []);

    const handleStartAddAtBat = () => {
        setEditingAtBat({ ...newAtBatTemplate });
        setIsAddingAtBat(true);
    };

    const handleAtBatChange = (updates) => {
        setEditingAtBat(prev => ({ ...prev, ...updates }));
    };

    const handleSaveAtBat = () => {
        if (!editingAtBat.result) return;

        if (isAddingAtBat) {
            const newAtBat = {
                ...editingAtBat,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            };
            setGame(prev => ({
                ...prev,
                at_bats: [...(prev.at_bats || []), newAtBat],
            }));
        } else {
            setGame(prev => ({
                ...prev,
                at_bats: (prev.at_bats || []).map(ab =>
                    ab.id === editingAtBat.id ? editingAtBat : ab
                ),
            }));
        }
        setEditingAtBat(null);
        setIsAddingAtBat(false);
    };

    const handleDeleteAtBat = (atBatId) => {
        setGame(prev => ({
            ...prev,
            at_bats: (prev.at_bats || []).filter(ab => ab.id !== atBatId),
        }));
    };

    const handleEditAtBat = (atBat) => {
        setEditingAtBat({ ...atBat, pitches: [...(atBat.pitches || [])] });
        setIsAddingAtBat(false);
    };

    // 投手成績の変更ハンドラ
    const handlePitchingChange = (field, value) => {
        setGame(prev => ({
            ...prev,
            pitching: {
                ...prev.pitching,
                [field]: value,
            },
        }));
    };

    // 投手成績入力の有効化
    const handleEnablePitching = () => {
        setShowPitching(true);
        if (!game.pitching) {
            setGame(prev => ({
                ...prev,
                pitching: {
                    innings: 0,
                    pitchCount: 0,
                    battersFaced: 0,
                    hits: 0,
                    runs: 0,
                    earnedRuns: 0,
                    walks: 0,
                    strikeouts: 0,
                    hitBatters: 0,
                    wildPitches: 0,
                    decision: 'no_decision',
                    notes: '',
                },
            }));
        }
    };

    // 投手成績入力の無効化
    const handleDisablePitching = () => {
        setShowPitching(false);
        setGame(prev => ({ ...prev, pitching: null }));
    };

    // 守備機会を追加
    const handleStartAddFieldingPlay = () => {
        setEditingFieldingPlay({
            inning: 1,
            position: 'SS',
            playType: 'groundball',
            result: 'assist',
            notes: '',
        });
        setAddingFieldingPlay(true);
    };

    // 守備機会を保存
    const handleSaveFieldingPlay = () => {
        if (!editingFieldingPlay) return;
        if (addingFieldingPlay) {
            const newPlay = {
                ...editingFieldingPlay,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            };
            setGame(prev => ({
                ...prev,
                fielding: [...(prev.fielding || []), newPlay],
            }));
        } else {
            setGame(prev => ({
                ...prev,
                fielding: (prev.fielding || []).map(f =>
                    f.id === editingFieldingPlay.id ? editingFieldingPlay : f
                ),
            }));
        }
        setEditingFieldingPlay(null);
        setAddingFieldingPlay(false);
    };

    // 守備機会を削除
    const handleDeleteFieldingPlay = (playId) => {
        setGame(prev => ({
            ...prev,
            fielding: (prev.fielding || []).filter(f => f.id !== playId),
        }));
    };

    const handleSubmit = () => {
        if (!game.date) return;
        onSave(game);
    };

    const isGameType = game.type === 'game';

    return (
        <div className="space-y-5 animate-fadeIn">
            {/* セッション種別 */}
            <div className="flex bg-bg-input rounded-xl p-1 gap-1">
                {SESSION_TYPE_OPTIONS.map(opt => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleGameChange({ type: opt.value })}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${game.type === opt.value
                            ? game.type === 'game'
                                ? 'bg-gradient-to-r from-accent-blue to-accent-cyan text-white shadow-lg'
                                : 'bg-gradient-to-r from-accent-amber to-accent-orange text-white shadow-lg'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        {opt.value === 'game' ? <Swords size={16} /> : <Dumbbell size={16} />}
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* 基本情報 */}
            <div className="glass rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-heading font-semibold text-text-primary flex items-center gap-2">
                    {isGameType ? <Swords size={16} className="text-accent-blue" /> : <Dumbbell size={16} className="text-accent-amber" />}
                    {isGameType ? '試合情報' : '練習情報'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label="日付" className="col-span-1">
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input
                                type="date"
                                value={game.date}
                                onChange={e => handleGameChange({ date: e.target.value })}
                                className="w-full bg-bg-input border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                            />
                        </div>
                    </FormField>

                    {isGameType && (
                        <FormField label="対戦相手">
                            <div className="relative">
                                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="text"
                                    value={game.opponent}
                                    onChange={e => handleGameChange({ opponent: e.target.value })}
                                    className="w-full bg-bg-input border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                                    placeholder="例：タイガースJr."
                                />
                            </div>
                        </FormField>
                    )}

                    <FormField label={isGameType ? '大会名' : '練習内容'}>
                        <div className="relative">
                            <Trophy size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input
                                type="text"
                                value={game.tournament}
                                onChange={e => handleGameChange({ tournament: e.target.value })}
                                className="w-full bg-bg-input border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                                placeholder={isGameType ? '例：春季大会' : '例：フリーバッティング'}
                            />
                        </div>
                    </FormField>

                    <FormField label="使用バット">
                        <select
                            value={game.bat}
                            onChange={e => handleGameChange({ bat: e.target.value })}
                            className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                        >
                            {BAT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </FormField>
                </div>
            </div>

            {/* 打席リスト */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-heading font-semibold text-text-primary">
                        打席データ ({game.at_bats?.length || 0})
                    </h3>
                    {!editingAtBat && (
                        <button
                            type="button"
                            onClick={handleStartAddAtBat}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-blue/10 text-accent-blue border border-accent-blue/20 rounded-lg text-xs font-medium hover:bg-accent-blue/20 transition-all duration-200"
                        >
                            <Plus size={14} />
                            打席を追加
                        </button>
                    )}
                </div>

                {/* 既存の打席 */}
                {(game.at_bats || []).map((ab, index) => (
                    <div
                        key={ab.id || index}
                        className="glass rounded-lg p-3 hover:bg-bg-card-hover/50 transition-all duration-200"
                    >
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setExpandedAtBat(expandedAtBat === ab.id ? null : ab.id)}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-text-muted font-mono w-6">#{index + 1}</span>
                                <ResultBadge result={ab.result} />
                                {ab.type && (
                                    <span className="text-xs text-text-muted">{BALL_TYPE_OPTIONS.find(o => o.value === ab.type)?.label}</span>
                                )}
                                {ab.quality && (
                                    <span
                                        className="text-xs font-medium"
                                        style={{ color: QUALITY_OPTIONS.find(o => o.value === ab.quality)?.color }}
                                    >
                                        {QUALITY_OPTIONS.find(o => o.value === ab.quality)?.label}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {ab.pitches && ab.pitches.length > 0 && (
                                    <span className="text-[10px] text-text-muted">{ab.pitches.length}球</span>
                                )}
                                {ab.count && (
                                    <span className="text-xs text-text-muted">{ab.count.balls}-{ab.count.strikes}</span>
                                )}
                                {expandedAtBat === ab.id ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
                            </div>
                        </div>

                        {expandedAtBat === ab.id && (
                            <div className="mt-3 pt-3 border-t border-border/30 animate-fadeIn space-y-2">
                                {/* 投球履歴の表示 */}
                                {ab.pitches && ab.pitches.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {ab.pitches.map((p, i) => (
                                            <PitchResultBadge key={p.id} pitch={p} number={i + 1} />
                                        ))}
                                    </div>
                                )}
                                {ab.notes && (
                                    <p className="text-xs text-text-secondary flex items-start gap-1.5">
                                        <StickyNote size={12} className="text-text-muted mt-0.5 shrink-0" />
                                        {ab.notes}
                                    </p>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleEditAtBat(ab); }}
                                        className="text-xs text-accent-blue hover:text-accent-cyan transition-colors"
                                    >
                                        編集
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleDeleteAtBat(ab.id); }}
                                        className="text-xs text-accent-red hover:text-red-400 transition-colors flex items-center gap-1"
                                    >
                                        <Trash2 size={12} />
                                        削除
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* 打席追加/編集フォーム */}
                {editingAtBat && (
                    <AtBatForm
                        atBat={editingAtBat}
                        onChange={handleAtBatChange}
                        onSave={handleSaveAtBat}
                        onCancel={() => { setEditingAtBat(null); setIsAddingAtBat(false); }}
                        isNew={isAddingAtBat}
                    />
                )}

                {/* 打席がない場合 */}
                {(!game.at_bats || game.at_bats.length === 0) && !editingAtBat && (
                    <div className="text-center py-8 text-text-muted">
                        <Plus size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">まだ打席データがありません</p>
                        <p className="text-xs">「打席を追加」ボタンで入力してください</p>
                    </div>
                )}
            </div>

            {/* 投手成績セクション（試合・練習共通） */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-heading font-semibold text-text-primary">⚾ 投手成績</h3>
                    {!showPitching ? (
                        <button
                            type="button"
                            onClick={handleEnablePitching}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 rounded-lg text-xs font-medium hover:bg-accent-emerald/20 transition-all"
                        >
                            <Plus size={14} />
                            登板記録を追加
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleDisablePitching}
                            className="text-xs text-accent-red hover:text-red-400 transition-colors"
                        >
                            登板記録を削除
                        </button>
                    )}
                </div>

                {showPitching && game.pitching && (
                    <div className="glass rounded-xl p-4 space-y-4 animate-fadeIn">
                        {/* 勝敗 */}
                        <FormField label="勝敗">
                            <div className="flex flex-wrap gap-1.5">
                                {PITCHING_DECISION_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handlePitchingChange('decision', opt.value)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${game.pitching.decision === opt.value
                                            ? 'border-current shadow-sm'
                                            : 'border-border text-text-muted hover:text-text-secondary'
                                            }`}
                                        style={game.pitching.decision === opt.value ? { color: opt.color, backgroundColor: opt.color + '15' } : {}}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </FormField>

                        {/* 基本数値 */}
                        <div className="grid grid-cols-3 gap-3">
                            <FormField label="イニング">
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="9"
                                    value={game.pitching.innings || ''}
                                    onChange={e => handlePitchingChange('innings', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary text-center"
                                />
                            </FormField>
                            <FormField label="投球数">
                                <input
                                    type="number"
                                    min="0"
                                    value={game.pitching.pitchCount || ''}
                                    onChange={e => handlePitchingChange('pitchCount', parseInt(e.target.value) || 0)}
                                    className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary text-center"
                                />
                            </FormField>
                            <FormField label="対戦打者">
                                <input
                                    type="number"
                                    min="0"
                                    value={game.pitching.battersFaced || ''}
                                    onChange={e => handlePitchingChange('battersFaced', parseInt(e.target.value) || 0)}
                                    className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary text-center"
                                />
                            </FormField>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            <FormField label="被安打">
                                <input
                                    type="number"
                                    min="0"
                                    value={game.pitching.hits || ''}
                                    onChange={e => handlePitchingChange('hits', parseInt(e.target.value) || 0)}
                                    className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary text-center"
                                />
                            </FormField>
                            <FormField label="奪三振">
                                <input
                                    type="number"
                                    min="0"
                                    value={game.pitching.strikeouts || ''}
                                    onChange={e => handlePitchingChange('strikeouts', parseInt(e.target.value) || 0)}
                                    className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary text-center"
                                />
                            </FormField>
                            <FormField label="四球">
                                <input
                                    type="number"
                                    min="0"
                                    value={game.pitching.walks || ''}
                                    onChange={e => handlePitchingChange('walks', parseInt(e.target.value) || 0)}
                                    className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary text-center"
                                />
                            </FormField>
                            <FormField label="死球">
                                <input
                                    type="number"
                                    min="0"
                                    value={game.pitching.hitBatters || ''}
                                    onChange={e => handlePitchingChange('hitBatters', parseInt(e.target.value) || 0)}
                                    className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary text-center"
                                />
                            </FormField>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            <FormField label="失点">
                                <input
                                    type="number"
                                    min="0"
                                    value={game.pitching.runs === 0 ? "0" : (game.pitching.runs || '')}
                                    onChange={e => handlePitchingChange('runs', parseInt(e.target.value) || 0)}
                                    className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary text-center"
                                />
                            </FormField>
                            <FormField label="自責点">
                                <input
                                    type="number"
                                    min="0"
                                    value={game.pitching.earnedRuns === 0 ? "0" : (game.pitching.earnedRuns || '')}
                                    onChange={e => handlePitchingChange('earnedRuns', parseInt(e.target.value) || 0)}
                                    className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary text-center"
                                />
                            </FormField>
                            <FormField label="暴投">
                                <input
                                    type="number"
                                    min="0"
                                    value={game.pitching.wildPitches === 0 ? "0" : (game.pitching.wildPitches || '')}
                                    onChange={e => handlePitchingChange('wildPitches', parseInt(e.target.value) || 0)}
                                    className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary text-center"
                                />
                            </FormField>
                        </div>

                        <FormField label="メモ">
                            <textarea
                                value={game.pitching.notes || ''}
                                onChange={e => handlePitchingChange('notes', e.target.value)}
                                rows={2}
                                className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary resize-none"
                                placeholder="投手成績に関するメモ..."
                            />
                        </FormField>
                    </div>
                )}

                {/* 守備記録セクション（試合・練習共通） */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-heading font-semibold text-text-primary">🧤 守備記録 ({game.fielding?.length || 0})</h3>
                        {!editingFieldingPlay && (
                            <button
                                type="button"
                                onClick={handleStartAddFieldingPlay}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-purple/10 text-accent-purple border border-accent-purple/20 rounded-lg text-xs font-medium hover:bg-accent-purple/20 transition-all"
                            >
                                <Plus size={14} />
                                守備機会を追加
                            </button>
                        )}
                    </div>

                    {/* 既存の守備プレー一覧 */}
                    {(game.fielding || []).map((play, index) => {
                        const posOpt = POSITION_OPTIONS.find(p => p.value === play.position);
                        const playOpt = FIELDING_PLAY_OPTIONS.find(p => p.value === play.playType);
                        const resultOpt = FIELDING_RESULT_OPTIONS.find(r => r.value === play.result);
                        return (
                            <div key={play.id || index} className="glass rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-text-muted font-mono">#{index + 1}</span>
                                        {play.inning && <span className="text-[10px] text-text-muted">{play.inning}回</span>}
                                        <span className="text-xs font-medium px-2 py-0.5 bg-accent-blue/10 text-accent-blue rounded">{posOpt?.label || play.position}</span>
                                        <span className="text-xs text-text-secondary">{playOpt?.icon} {playOpt?.label}</span>
                                        <span
                                            className="text-xs font-medium px-2 py-0.5 rounded"
                                            style={{ color: resultOpt?.color, backgroundColor: resultOpt?.color + '15' }}
                                        >
                                            {resultOpt?.label || play.result}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => { setEditingFieldingPlay({ ...play }); setAddingFieldingPlay(false); }}
                                            className="text-xs text-accent-blue hover:text-accent-cyan transition-colors"
                                        >
                                            編集
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteFieldingPlay(play.id)}
                                            className="text-xs text-accent-red hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                                {play.notes && (
                                    <p className="text-[10px] text-text-muted mt-1">{play.notes}</p>
                                )}
                            </div>
                        );
                    })}

                    {/* 守備プレー追加/編集フォーム */}
                    {editingFieldingPlay && (
                        <div className="glass rounded-xl p-4 space-y-3 border border-accent-purple/30 animate-fadeIn">
                            <h4 className="text-xs font-heading font-semibold text-accent-purple">
                                {addingFieldingPlay ? '守備機会を追加' : '守備機会を編集'}
                            </h4>

                            <div className="grid grid-cols-2 gap-3">
                                <FormField label="イニング">
                                    <input
                                        type="number"
                                        min="1"
                                        max="9"
                                        value={editingFieldingPlay.inning || ''}
                                        onChange={e => setEditingFieldingPlay(prev => ({ ...prev, inning: parseInt(e.target.value) || 1 }))}
                                        className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary text-center"
                                    />
                                </FormField>
                                <FormField label="守備位置">
                                    <select
                                        value={editingFieldingPlay.position || 'SS'}
                                        onChange={e => setEditingFieldingPlay(prev => ({ ...prev, position: e.target.value }))}
                                        className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
                                    >
                                        {POSITION_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </FormField>
                            </div>

                            <FormField label="プレー種類">
                                <div className="flex flex-wrap gap-1.5">
                                    {FIELDING_PLAY_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setEditingFieldingPlay(prev => ({ ...prev, playType: opt.value }))}
                                            className={`px-2.5 py-1.5 rounded-lg text-xs transition-all border ${editingFieldingPlay.playType === opt.value
                                                ? 'bg-accent-blue/15 text-accent-blue border-accent-blue/30'
                                                : 'border-border text-text-muted hover:text-text-secondary'
                                                }`}
                                        >
                                            {opt.icon} {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </FormField>

                            <FormField label="結果">
                                <div className="flex flex-wrap gap-1.5">
                                    {FIELDING_RESULT_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setEditingFieldingPlay(prev => ({ ...prev, result: opt.value }))}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${editingFieldingPlay.result === opt.value
                                                ? 'border-current shadow-sm'
                                                : 'border-border text-text-muted hover:text-text-secondary'
                                                }`}
                                            style={editingFieldingPlay.result === opt.value ? { color: opt.color, backgroundColor: opt.color + '15' } : {}}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </FormField>

                            <FormField label="メモ">
                                <input
                                    type="text"
                                    value={editingFieldingPlay.notes || ''}
                                    onChange={e => setEditingFieldingPlay(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
                                    placeholder="例: ショートゴロ→ファーストへ送球"
                                />
                            </FormField>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleSaveFieldingPlay}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-accent-purple/15 text-accent-purple py-2 rounded-lg text-xs font-medium hover:bg-accent-purple/25 transition-all"
                                >
                                    <Save size={14} />
                                    保存
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setEditingFieldingPlay(null); setAddingFieldingPlay(false); }}
                                    className="px-4 py-2 text-xs text-text-muted hover:text-text-primary transition-colors"
                                >
                                    キャンセル
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 守備機会がない場合 */}
                    {(!game.fielding || game.fielding.length === 0) && !editingFieldingPlay && (
                        <div className="text-center py-4 text-text-muted">
                            <p className="text-xs">「守備機会を追加」ボタンで守備記録を入力できます</p>
                        </div>
                    )}
                </div>

                {/* 全体の保存/キャンセル */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!game.date}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-accent-emerald to-accent-cyan text-white px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-accent-emerald/20 transition-all duration-300"
                    >
                        <Save size={18} />
                        {editGame ? 'セッションを更新' : 'セッションを保存'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl text-sm text-text-secondary border border-border hover:border-border-light hover:text-text-primary transition-all duration-200"
                    >
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    );
}
