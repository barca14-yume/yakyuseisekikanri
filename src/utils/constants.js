/**
 * アプリケーション全体で使用する定数定義
 */

// 打席結果の選択肢
export const RESULT_OPTIONS = [
    { value: '1B', label: 'シングルヒット', short: '安打' },
    { value: '2B', label: 'ツーベースヒット', short: '二塁打' },
    { value: '3B', label: 'スリーベースヒット', short: '三塁打' },
    { value: 'HR', label: 'ホームラン', short: 'HR' },
    { value: 'GO', label: 'ゴロアウト', short: 'ゴロ' },
    { value: 'FO', label: 'フライアウト', short: 'フライ' },
    { value: 'LO', label: 'ライナーアウト', short: 'ライナー' },
    { value: 'K', label: '三振', short: '三振' },
    { value: 'BB', label: '四球', short: '四球' },
    { value: 'HBP', label: '死球', short: '死球' },
    { value: 'SAC', label: '犠打', short: '犠打' },
    { value: 'SF', label: '犠飛', short: '犠飛' },
    { value: 'FC', label: 'フィールダースチョイス', short: 'FC' },
    { value: 'E', label: 'エラー出塁', short: 'エラー' },
    { value: 'DP', label: '併殺打', short: '併殺' },
];

// ヒットと判定される結果
export const HIT_RESULTS = ['1B', '2B', '3B', 'HR'];

// 打数に含まれない結果（四球、死球、犠打、犠飛）
export const NON_AB_RESULTS = ['BB', 'HBP', 'SAC', 'SF'];

// インプレー結果（バットに当たった結果）
export const IN_PLAY_RESULTS = ['1B', '2B', '3B', 'HR', 'GO', 'FO', 'LO', 'FC', 'E', 'DP'];

// 打球の種類
export const BALL_TYPE_OPTIONS = [
    { value: 'Grounder', label: 'ゴロ', icon: '⚡' },
    { value: 'Liner', label: 'ライナー', icon: '➡️' },
    { value: 'Fly', label: 'フライ', icon: '🔼' },
    { value: 'Popup', label: 'ポップフライ', icon: '⬆️' },
    { value: 'Bunt', label: 'バント', icon: '🔹' },
];

// 打球のクオリティ
export const QUALITY_OPTIONS = [
    { value: 'Solid', label: '会心の当たり', color: '#10b981' },
    { value: 'Normal', label: '普通', color: '#f59e0b' },
    { value: 'Weak', label: '詰まり', color: '#ef4444' },
    { value: 'Jammed', label: '根っこ', color: '#dc2626' },
    { value: 'Pulled', label: '泳ぎ', color: '#f97316' },
];

// 球種の選択肢
export const PITCH_TYPE_OPTIONS = [
    { value: 'fastball', label: 'ストレート' },
    { value: 'curve', label: 'カーブ' },
    { value: 'slider', label: 'スライダー' },
    { value: 'change', label: 'チェンジアップ' },
    { value: 'unknown', label: '不明' },
];

// ストライクゾーンのコース
export const ZONE_OPTIONS = [
    { value: 'inner-high', label: '内角高め' },
    { value: 'center-high', label: '真ん中高め' },
    { value: 'outer-high', label: '外角高め' },
    { value: 'inner-mid', label: '内角' },
    { value: 'center-mid', label: '真ん中' },
    { value: 'outer-mid', label: '外角' },
    { value: 'inner-low', label: '内角低め' },
    { value: 'center-low', label: '真ん中低め' },
    { value: 'outer-low', label: '外角低め' },
    { value: 'ball-inside', label: 'ボール（内）' },
    { value: 'ball-outside', label: 'ボール（外）' },
    { value: 'ball-high', label: 'ボール（高）' },
    { value: 'ball-low', label: 'ボール（低）' },
];

// 1球ごとの投球結果
export const PITCH_RESULT_OPTIONS = [
    { value: 'ball', label: 'ボール', short: 'B', color: '#10b981', category: 'ball' },
    { value: 'strike_looking', label: '見逃し', short: 'S見', color: '#f59e0b', category: 'strike' },
    { value: 'strike_swinging', label: '空振り', short: 'S空', color: '#ef4444', category: 'strike' },
    { value: 'foul', label: 'ファウル', short: 'F', color: '#8b5cf6', category: 'foul' },
    { value: 'foul_tip', label: 'ファウルチップ', short: 'Fチ', color: '#7c3aed', category: 'foul' },
    { value: 'in_play', label: 'インプレー', short: '打', color: '#3b82f6', category: 'in_play' },
    { value: 'hit_by_pitch', label: '死球', short: 'HBP', color: '#06b6d4', category: 'hbp' },
];

// ファウルの方向
export const FOUL_DIRECTION_OPTIONS = [
    { value: 'left', label: 'レフト方向' },
    { value: 'center-left', label: '左中間方向' },
    { value: 'center', label: 'センター方向' },
    { value: 'center-right', label: '右中間方向' },
    { value: 'right', label: 'ライト方向' },
    { value: 'back', label: 'バックネット方向' },
    { value: 'bunt-foul', label: 'バントファウル' },
];

// 三振の種類
export const STRIKEOUT_TYPE_OPTIONS = [
    { value: 'swinging', label: '空振り三振' },
    { value: 'looking', label: '見逃し三振' },
];

// バットの選択肢
export const BAT_OPTIONS = [
    { value: 'Legacy 78cm', label: 'Legacy 78cm' },
    { value: 'Legacy 80cm', label: 'Legacy 80cm' },
    { value: 'Wooden', label: '木製バット' },
    { value: 'iota 78cm', label: 'iota 78cm' },
    { value: 'Other', label: 'その他' },
];

// セッション種別
export const SESSION_TYPE_OPTIONS = [
    { value: 'game', label: '公式戦 / 練習試合' },
    { value: 'practice', label: '練習（フリーバッティング等）' },
];

// 塁打数のマッピング
export const TOTAL_BASES_MAP = {
    '1B': 1,
    '2B': 2,
    '3B': 3,
    'HR': 4,
};

// ===== 守備関連の定数 =====

// 守備位置
export const POSITION_OPTIONS = [
    { value: 'P', label: '投手', short: 'P' },
    { value: 'C', label: '捕手', short: 'C' },
    { value: '1B', label: '一塁手', short: '1B' },
    { value: '2B', label: '二塁手', short: '2B' },
    { value: '3B', label: '三塁手', short: '3B' },
    { value: 'SS', label: '遊撃手', short: 'SS' },
    { value: 'LF', label: '左翼手', short: 'LF' },
    { value: 'CF', label: '中堅手', short: 'CF' },
    { value: 'RF', label: '右翼手', short: 'RF' },
];

// 守備機会の種類
export const FIELDING_PLAY_OPTIONS = [
    { value: 'groundball', label: 'ゴロ捕球', icon: '⚡' },
    { value: 'flyball', label: 'フライ捕球', icon: '🔼' },
    { value: 'liner', label: 'ライナー捕球', icon: '➡️' },
    { value: 'throw', label: '送球', icon: '💨' },
    { value: 'tag', label: 'タッチプレー', icon: '🏷️' },
    { value: 'relay', label: '中継プレー', icon: '🔄' },
    { value: 'bunt_field', label: 'バント処理', icon: '🔹' },
    { value: 'cover', label: 'ベースカバー', icon: '🛡️' },
    { value: 'backup', label: 'カバーリング', icon: '📐' },
    { value: 'pickoff', label: '牽制', icon: '⚠️' },
    { value: 'catch', label: '捕球（捕手）', icon: '🧤' },
    { value: 'other', label: 'その他', icon: '📝' },
];

// 守備結果
export const FIELDING_RESULT_OPTIONS = [
    { value: 'putout', label: '刺殺', color: '#10b981' },
    { value: 'assist', label: '補殺', color: '#3b82f6' },
    { value: 'error', label: '失策', color: '#ef4444' },
    { value: 'fine_play', label: 'ファインプレー', color: '#f59e0b' },
    { value: 'passed_ball', label: '捕逸', color: '#f97316' },
    { value: 'no_play', label: '処理なし（カバーのみ）', color: '#64748b' },
];

// ===== 投手成績関連の定数 =====

// 投手の勝敗
export const PITCHING_DECISION_OPTIONS = [
    { value: 'win', label: '勝ち', color: '#10b981' },
    { value: 'loss', label: '負け', color: '#ef4444' },
    { value: 'save', label: 'セーブ', color: '#3b82f6' },
    { value: 'hold', label: 'ホールド', color: '#06b6d4' },
    { value: 'no_decision', label: '記録なし', color: '#64748b' },
];

// イニング数の選択肢（1/3イニング単位）
export const INNINGS_OPTIONS = [];
for (let i = 0; i <= 7; i++) {
    INNINGS_OPTIONS.push({ value: i, label: `${i}` });
    if (i < 7) {
        INNINGS_OPTIONS.push({ value: i + 1 / 3, label: `${i} 1/3` });
        INNINGS_OPTIONS.push({ value: i + 2 / 3, label: `${i} 2/3` });
    }
}

/**
 * 投球履歴からカウントを自動計算する
 * @param {Array} pitches - 投球データの配列
 * @returns {{ balls: number, strikes: number }} 現在のカウント
 */
export function calculateCountFromPitches(pitches) {
    let balls = 0;
    let strikes = 0;
    (pitches || []).forEach(p => {
        if (p.result === 'ball') {
            balls = Math.min(balls + 1, 3);
        } else if (p.result === 'strike_looking' || p.result === 'strike_swinging') {
            strikes = Math.min(strikes + 1, 2);
        } else if (p.result === 'foul' || p.result === 'foul_tip') {
            // ファウルは2ストライクまでのみカウント（2ストライク後は増えない）
            // ただしバントファウルは2ストライク後でも三振
            if (strikes < 2) {
                strikes++;
            } else if (p.result === 'foul_tip' || p.foulDirection === 'bunt-foul') {
                // ファウルチップまたはバントファウルは2ストライクなら三振扱いになるが、
                // ここではカウントのみ返す（結果判定は呼び出し側）
                strikes = Math.min(strikes + 1, 3);
            }
        }
    });
    return { balls, strikes };
}
