/**
 * スプレーチャートコンポーネント
 * グラウンド図の上に打球位置をプロットする
 * タップで打球位置を入力する機能あり
 */

import { useRef, useCallback } from 'react';
import { HIT_RESULTS } from '../utils/constants';

// グラウンドのSVGサイズ
const FIELD_WIDTH = 400;
const FIELD_HEIGHT = 320;

/**
 * グラウンドの扇形（ファウルラインからフェアゾーン）のパスを生成
 */
function getFieldPath() {
    // ホームベースを基準に扇形を描く
    const homeX = FIELD_WIDTH / 2;
    const homeY = FIELD_HEIGHT - 30;
    const radius = FIELD_HEIGHT - 50;

    // 左のファウルライン（三塁線）の角度と右のファウルライン（一塁線）の角度
    const leftAngle = Math.PI * 0.75; // 135度
    const rightAngle = Math.PI * 0.25; // 45度

    const leftX = homeX + Math.cos(leftAngle) * radius;
    const leftY = homeY - Math.sin(leftAngle) * radius;
    const rightX = homeX + Math.cos(rightAngle) * radius;
    const rightY = homeY - Math.sin(rightAngle) * radius;

    return `M ${homeX} ${homeY} L ${leftX} ${leftY} A ${radius} ${radius} 0 0 1 ${rightX} ${rightY} Z`;
}

/**
 * 内野のダイヤモンドのパスを生成
 */
function getDiamondPoints() {
    const homeX = FIELD_WIDTH / 2;
    const homeY = FIELD_HEIGHT - 30;
    const baseDistance = 70;

    return {
        home: { x: homeX, y: homeY },
        first: { x: homeX + baseDistance * 0.7, y: homeY - baseDistance * 0.7 },
        second: { x: homeX, y: homeY - baseDistance * 1.4 },
        third: { x: homeX - baseDistance * 0.7, y: homeY - baseDistance * 0.7 },
    };
}

export default function SprayChart({
    atBats = [],
    onFieldClick,
    interactive = false,
    selectedPosition = null,
    showLegend = true,
    filterType = 'all',
    height = 320,
}) {
    const svgRef = useRef(null);

    // SVG上のクリック位置を計算
    const handleClick = useCallback((e) => {
        if (!interactive || !onFieldClick) return;

        const svg = svgRef.current;
        if (!svg) return;

        const rect = svg.getBoundingClientRect();
        const scaleX = FIELD_WIDTH / rect.width;
        const scaleY = FIELD_HEIGHT / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        onFieldClick({ x: Math.round(x), y: Math.round(y) });
    }, [interactive, onFieldClick]);

    const diamond = getDiamondPoints();
    const fieldPath = getFieldPath();

    // 打球の色を決定する
    const getBallColor = (ab, gameType) => {
        const isHit = HIT_RESULTS.includes(ab.result);
        if (gameType === 'practice') {
            return isHit ? '#fb923c' : '#7dd3fc';
        }
        return isHit ? '#ef4444' : '#3b82f6';
    };

    // 打球の形状を決定する
    const getBallShape = (ab) => {
        if (ab.type === 'Fly' || ab.type === 'Popup') return 'triangle';
        if (ab.type === 'Liner') return 'diamond';
        return 'circle';
    };

    // 打球のサイズを決定する
    const getBallSize = (ab) => {
        if (ab.quality === 'Solid') return 8;
        if (ab.quality === 'Weak' || ab.quality === 'Jammed') return 5;
        return 6;
    };

    return (
        <div className="relative w-full" style={{ maxWidth: FIELD_WIDTH }}>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`}
                className={`w-full ${interactive ? 'cursor-crosshair' : ''}`}
                style={{ height }}
                onClick={handleClick}
            >
                {/* 背景 */}
                <rect width={FIELD_WIDTH} height={FIELD_HEIGHT} fill="#0a0e1a" rx="12" />

                {/* フェアゾーン（芝生） */}
                <path d={fieldPath} fill="#1a3a2a" opacity="0.6" />

                {/* 内野のダート部分 */}
                <ellipse
                    cx={FIELD_WIDTH / 2}
                    cy={FIELD_HEIGHT - 60}
                    rx="85"
                    ry="75"
                    fill="#2a2010"
                    opacity="0.4"
                />

                {/* グリッドライン（距離の目安） */}
                {[80, 140, 200, 260].map((r, i) => (
                    <path
                        key={i}
                        d={`M ${FIELD_WIDTH / 2 + Math.cos(Math.PI * 0.75) * r} ${FIELD_HEIGHT - 30 - Math.sin(Math.PI * 0.75) * r}
                A ${r} ${r} 0 0 1 ${FIELD_WIDTH / 2 + Math.cos(Math.PI * 0.25) * r} ${FIELD_HEIGHT - 30 - Math.sin(Math.PI * 0.25) * r}`}
                        fill="none"
                        stroke="#2a3450"
                        strokeWidth="0.5"
                        strokeDasharray="4,4"
                        opacity="0.5"
                    />
                ))}

                {/* ファウルライン */}
                <line
                    x1={diamond.home.x} y1={diamond.home.y}
                    x2={diamond.home.x + Math.cos(Math.PI * 0.25) * 300}
                    y2={diamond.home.y - Math.sin(Math.PI * 0.25) * 300}
                    stroke="#ffffff" strokeWidth="1" opacity="0.3"
                />
                <line
                    x1={diamond.home.x} y1={diamond.home.y}
                    x2={diamond.home.x + Math.cos(Math.PI * 0.75) * 300}
                    y2={diamond.home.y - Math.sin(Math.PI * 0.75) * 300}
                    stroke="#ffffff" strokeWidth="1" opacity="0.3"
                />

                {/* ダイヤモンド（塁間のライン） */}
                <polygon
                    points={`${diamond.home.x},${diamond.home.y} ${diamond.first.x},${diamond.first.y} ${diamond.second.x},${diamond.second.y} ${diamond.third.x},${diamond.third.y}`}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    opacity="0.4"
                />

                {/* 各塁 */}
                {Object.entries(diamond).map(([name, pos]) => (
                    <rect
                        key={name}
                        x={pos.x - 4}
                        y={pos.y - 4}
                        width="8"
                        height="8"
                        fill={name === 'home' ? '#ffffff' : '#f5f5f5'}
                        transform={`rotate(45 ${pos.x} ${pos.y})`}
                        opacity="0.7"
                    />
                ))}

                {/* ピッチャーマウンド */}
                <circle
                    cx={FIELD_WIDTH / 2}
                    cy={(diamond.home.y + diamond.second.y) / 2 + 10}
                    r="5"
                    fill="#8B7355"
                    opacity="0.5"
                />

                {/* ポジションラベル */}
                <text x="60" y="120" fill="#64748b" fontSize="9" textAnchor="middle" opacity="0.6">LF</text>
                <text x={FIELD_WIDTH / 2} y="60" fill="#64748b" fontSize="9" textAnchor="middle" opacity="0.6">CF</text>
                <text x="340" y="120" fill="#64748b" fontSize="9" textAnchor="middle" opacity="0.6">RF</text>
                <text x="125" y="200" fill="#64748b" fontSize="9" textAnchor="middle" opacity="0.6">SS</text>
                <text x="275" y="200" fill="#64748b" fontSize="9" textAnchor="middle" opacity="0.6">2B</text>

                {/* 打球プロット */}
                {atBats
                    .filter(ab => ab.direction)
                    .map((ab, i) => {
                        const color = getBallColor(ab, ab._gameType);
                        const size = getBallSize(ab);
                        const shape = getBallShape(ab);
                        const isPractice = ab._gameType === 'practice';
                        const opacity = isPractice ? 0.7 : 0.9;

                        return (
                            <g key={ab.id || i}>
                                {shape === 'circle' && (
                                    <circle
                                        cx={ab.direction.x}
                                        cy={ab.direction.y}
                                        r={size}
                                        fill={color}
                                        opacity={opacity}
                                        stroke={isPractice ? color : 'none'}
                                        strokeWidth={isPractice ? 2 : 0}
                                        strokeDasharray={isPractice ? '3,2' : 'none'}
                                        filter={!isPractice ? '' : ''}
                                    >
                                        <title>{ab.notes || ab.result}</title>
                                    </circle>
                                )}
                                {shape === 'diamond' && (
                                    <rect
                                        x={ab.direction.x - size}
                                        y={ab.direction.y - size}
                                        width={size * 2}
                                        height={size * 2}
                                        fill={color}
                                        opacity={opacity}
                                        transform={`rotate(45 ${ab.direction.x} ${ab.direction.y})`}
                                        stroke={isPractice ? '#fff' : 'none'}
                                        strokeWidth={isPractice ? 1 : 0}
                                        strokeDasharray={isPractice ? '2,2' : 'none'}
                                    >
                                        <title>{ab.notes || ab.result}</title>
                                    </rect>
                                )}
                                {shape === 'triangle' && (
                                    <polygon
                                        points={`${ab.direction.x},${ab.direction.y - size} ${ab.direction.x - size},${ab.direction.y + size * 0.6} ${ab.direction.x + size},${ab.direction.y + size * 0.6}`}
                                        fill={color}
                                        opacity={opacity}
                                        stroke={isPractice ? '#fff' : 'none'}
                                        strokeWidth={isPractice ? 1 : 0}
                                        strokeDasharray={isPractice ? '2,2' : 'none'}
                                    >
                                        <title>{ab.notes || ab.result}</title>
                                    </polygon>
                                )}
                                {/* パルスアニメーション（会心の当たり） */}
                                {ab.quality === 'Solid' && !isPractice && (
                                    <circle
                                        cx={ab.direction.x}
                                        cy={ab.direction.y}
                                        r={size + 3}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth="1"
                                        opacity="0.4"
                                    >
                                        <animate
                                            attributeName="r"
                                            values={`${size + 2};${size + 8};${size + 2}`}
                                            dur="2s"
                                            repeatCount="indefinite"
                                        />
                                        <animate
                                            attributeName="opacity"
                                            values="0.4;0;0.4"
                                            dur="2s"
                                            repeatCount="indefinite"
                                        />
                                    </circle>
                                )}
                            </g>
                        );
                    })}

                {/* 入力モード時の選択位置表示 */}
                {interactive && selectedPosition && (
                    <g>
                        <circle
                            cx={selectedPosition.x}
                            cy={selectedPosition.y}
                            r="10"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="2"
                        >
                            <animate
                                attributeName="r"
                                values="8;14;8"
                                dur="1.5s"
                                repeatCount="indefinite"
                            />
                        </circle>
                        <circle
                            cx={selectedPosition.x}
                            cy={selectedPosition.y}
                            r="4"
                            fill="#f59e0b"
                        />
                    </g>
                )}

                {/* インタラクティブモードの説明テキスト */}
                {interactive && !selectedPosition && (
                    <text
                        x={FIELD_WIDTH / 2}
                        y={FIELD_HEIGHT / 2}
                        fill="#94a3b8"
                        fontSize="13"
                        textAnchor="middle"
                        fontWeight="500"
                    >
                        グラウンドをタップして打球位置を指定
                    </text>
                )}
            </svg>

            {/* 凡例 */}
            {showLegend && (
                <div className="flex flex-wrap gap-3 mt-3 justify-center text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[#ef4444] inline-block"></span>
                        <span className="text-text-secondary">試合ヒット</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[#3b82f6] inline-block"></span>
                        <span className="text-text-secondary">試合アウト</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full border-2 border-[#fb923c] inline-block" style={{ borderStyle: 'dashed' }}></span>
                        <span className="text-text-secondary">練習ヒット</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full border-2 border-[#7dd3fc] inline-block" style={{ borderStyle: 'dashed' }}></span>
                        <span className="text-text-secondary">練習アウト</span>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-border">
                        <span className="w-3 h-3 rounded-full bg-text-muted inline-block"></span>
                        <span className="text-text-secondary">ゴロ</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-text-muted inline-block" style={{ transform: 'rotate(45deg)', borderRadius: '1px' }}></span>
                        <span className="text-text-secondary">ライナー</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="inline-block" style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '10px solid #64748b' }}></span>
                        <span className="text-text-secondary">フライ</span>
                    </div>
                </div>
            )}
        </div>
    );
}
