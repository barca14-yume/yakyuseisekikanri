/**
 * 統計計算ユーティリティ
 * 打率、出塁率、長打率、OPS、各種カスタム指標を計算する
 */

import { HIT_RESULTS, NON_AB_RESULTS, IN_PLAY_RESULTS, TOTAL_BASES_MAP } from './constants';

/**
 * 打席データの配列からスタッツを計算する
 * @param {Array} atBats - 打席データの配列
 * @returns {Object} 各種スタッツのオブジェクト
 */
export function calculateStats(atBats) {
    if (!atBats || atBats.length === 0) {
        return {
            plateAppearances: 0,
            atBatCount: 0,
            hits: 0,
            singles: 0,
            doubles: 0,
            triples: 0,
            homeRuns: 0,
            walks: 0,
            hitByPitch: 0,
            strikeouts: 0,
            battingAverage: 0,
            onBasePercentage: 0,
            sluggingPercentage: 0,
            ops: 0,
            strikeoutRate: 0,
            contactRate: 0,
            qualityContactRate: 0,
            totalBases: 0,
        };
    }

    const plateAppearances = atBats.length;
    const nonAbResults = atBats.filter(ab => NON_AB_RESULTS.includes(ab.result));
    const atBatCount = plateAppearances - nonAbResults.length;

    const hits = atBats.filter(ab => HIT_RESULTS.includes(ab.result)).length;
    const singles = atBats.filter(ab => ab.result === '1B').length;
    const doubles = atBats.filter(ab => ab.result === '2B').length;
    const triples = atBats.filter(ab => ab.result === '3B').length;
    const homeRuns = atBats.filter(ab => ab.result === 'HR').length;
    const walks = atBats.filter(ab => ab.result === 'BB').length;
    const hitByPitch = atBats.filter(ab => ab.result === 'HBP').length;
    const strikeouts = atBats.filter(ab => ab.result === 'K').length;

    // 塁打数
    const totalBases = atBats.reduce((sum, ab) => {
        return sum + (TOTAL_BASES_MAP[ab.result] || 0);
    }, 0);

    // 打率 = 安打 / 打数
    const battingAverage = atBatCount > 0 ? hits / atBatCount : 0;

    // 出塁率 = (安打 + 四球 + 死球) / (打数 + 四球 + 死球 + 犠飛)
    const sacFlies = atBats.filter(ab => ab.result === 'SF').length;
    const obpDenominator = atBatCount + walks + hitByPitch + sacFlies;
    const onBasePercentage = obpDenominator > 0
        ? (hits + walks + hitByPitch) / obpDenominator
        : 0;

    // 長打率 = 塁打 / 打数
    const sluggingPercentage = atBatCount > 0 ? totalBases / atBatCount : 0;

    // OPS = 出塁率 + 長打率
    const ops = onBasePercentage + sluggingPercentage;

    // 三振率 = 三振 / 打席数
    const strikeoutRate = plateAppearances > 0 ? strikeouts / plateAppearances : 0;

    // コンタクト率 = バットに当たった回数 / (打数 - 四球 - 死球)
    // ※三振以外の打数が分母
    const contactAtBats = atBatCount;
    const contactCount = atBats.filter(ab => IN_PLAY_RESULTS.includes(ab.result)).length;
    const contactRate = contactAtBats > 0 ? contactCount / contactAtBats : 0;

    // 有効打球率 = ライナー性の打球 / インプレー打球数
    const inPlayBalls = atBats.filter(ab => IN_PLAY_RESULTS.includes(ab.result));
    const qualityBalls = inPlayBalls.filter(ab =>
        ab.type === 'Liner' || ab.quality === 'Solid'
    ).length;
    const qualityContactRate = inPlayBalls.length > 0
        ? qualityBalls / inPlayBalls.length
        : 0;

    return {
        plateAppearances,
        atBatCount,
        hits,
        singles,
        doubles,
        triples,
        homeRuns,
        walks,
        hitByPitch,
        strikeouts,
        battingAverage,
        onBasePercentage,
        sluggingPercentage,
        ops,
        strikeoutRate,
        contactRate,
        qualityContactRate,
        totalBases,
    };
}

/**
 * スタッツ値をフォーマットする（.000 のような形式）
 * @param {number} value - 数値
 * @param {number} decimals - 小数点以下の桁数
 * @returns {string} フォーマットされた文字列
 */
export function formatStat(value, decimals = 3) {
    if (value === 0) return '.000';
    if (value >= 1) return value.toFixed(decimals);
    return value.toFixed(decimals).replace(/^0/, '');
}

/**
 * パーセント表記でフォーマットする
 * @param {number} value - 0～1の数値
 * @returns {string} パーセント表記
 */
export function formatPercent(value) {
    return `${(value * 100).toFixed(1)}%`;
}

/**
 * バット別のスタッツを計算する
 * @param {Array} games - ゲームデータの配列
 * @returns {Object} バット名をキーとしたスタッツのオブジェクト
 */
export function calculateStatsByBat(games) {
    const batStats = {};

    games.forEach(game => {
        const bat = game.bat || 'Unknown';
        if (!batStats[bat]) {
            batStats[bat] = [];
        }
        batStats[bat].push(...(game.at_bats || []));
    });

    const result = {};
    Object.keys(batStats).forEach(bat => {
        result[bat] = calculateStats(batStats[bat]);
    });

    return result;
}
