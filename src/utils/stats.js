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

/**
 * 投手成績を計算する
 * @param {Array} games - ゲームデータの配列
 * @returns {Object} 投手成績のオブジェクト
 */
export function calculatePitchingStats(games) {
    const pitchingGames = games.filter(g => g.pitching && g.pitching.innings > 0);

    if (pitchingGames.length === 0) {
        return {
            gamesStarted: 0,
            totalInnings: 0,
            totalPitchCount: 0,
            totalHits: 0,
            totalRuns: 0,
            totalEarnedRuns: 0,
            totalWalks: 0,
            totalStrikeouts: 0,
            totalHitBatters: 0,
            totalWildPitches: 0,
            wins: 0,
            losses: 0,
            saves: 0,
            era: 0,
            whip: 0,
            k9: 0,
            bb9: 0,
            kbb: 0,
            battingAgainst: 0,
            avgPitchCount: 0,
        };
    }

    const totalInnings = pitchingGames.reduce((s, g) => s + (g.pitching.innings || 0), 0);
    const totalPitchCount = pitchingGames.reduce((s, g) => s + (g.pitching.pitchCount || 0), 0);
    const totalHits = pitchingGames.reduce((s, g) => s + (g.pitching.hits || 0), 0);
    const totalRuns = pitchingGames.reduce((s, g) => s + (g.pitching.runs || 0), 0);
    const totalEarnedRuns = pitchingGames.reduce((s, g) => s + (g.pitching.earnedRuns || 0), 0);
    const totalWalks = pitchingGames.reduce((s, g) => s + (g.pitching.walks || 0), 0);
    const totalStrikeouts = pitchingGames.reduce((s, g) => s + (g.pitching.strikeouts || 0), 0);
    const totalHitBatters = pitchingGames.reduce((s, g) => s + (g.pitching.hitBatters || 0), 0);
    const totalWildPitches = pitchingGames.reduce((s, g) => s + (g.pitching.wildPitches || 0), 0);

    const wins = pitchingGames.filter(g => g.pitching.decision === 'win').length;
    const losses = pitchingGames.filter(g => g.pitching.decision === 'loss').length;
    const saves = pitchingGames.filter(g => g.pitching.decision === 'save').length;

    // ERA = (自責点 × 7) / イニング数（少年野球は7イニング制）
    const era = totalInnings > 0 ? (totalEarnedRuns * 7) / totalInnings : 0;

    // WHIP = (被安打 + 四球) / イニング数
    const whip = totalInnings > 0 ? (totalHits + totalWalks) / totalInnings : 0;

    // K/9 = (奪三振 × 9) / イニング数
    const k9 = totalInnings > 0 ? (totalStrikeouts * 9) / totalInnings : 0;

    // BB/9 = (四球 × 9) / イニング数
    const bb9 = totalInnings > 0 ? (totalWalks * 9) / totalInnings : 0;

    // K/BB
    const kbb = totalWalks > 0 ? totalStrikeouts / totalWalks : totalStrikeouts;

    // 被打率（推定）
    const totalBF = pitchingGames.reduce((s, g) => s + (g.pitching.battersFaced || 0), 0);
    const estimatedAB = totalBF - totalWalks - totalHitBatters;
    const battingAgainst = estimatedAB > 0 ? totalHits / estimatedAB : 0;

    // 平均球数/試合
    const avgPitchCount = pitchingGames.length > 0 ? totalPitchCount / pitchingGames.length : 0;

    return {
        gamesStarted: pitchingGames.length,
        totalInnings,
        totalPitchCount,
        totalHits,
        totalRuns,
        totalEarnedRuns,
        totalWalks,
        totalStrikeouts,
        totalHitBatters,
        totalWildPitches,
        wins,
        losses,
        saves,
        era,
        whip,
        k9,
        bb9,
        kbb,
        battingAgainst,
        avgPitchCount,
    };
}

/**
 * 守備成績を計算する
 * @param {Array} games - ゲームデータの配列
 * @returns {Object} 守備成績のオブジェクト
 */
export function calculateFieldingStats(games) {
    const allPlays = [];
    games.forEach(g => {
        (g.fielding || []).forEach(f => {
            allPlays.push({ ...f, _gameType: g.type, _gameDate: g.date });
        });
    });

    if (allPlays.length === 0) {
        return {
            totalPlays: 0,
            putouts: 0,
            assists: 0,
            errors: 0,
            finePlays: 0,
            fieldingPercentage: 0,
            byPosition: {},
        };
    }

    const putouts = allPlays.filter(p => p.result === 'putout' || p.result === 'fine_play').length;
    const assists = allPlays.filter(p => p.result === 'assist').length;
    const errors = allPlays.filter(p => p.result === 'error').length;
    const finePlays = allPlays.filter(p => p.result === 'fine_play').length;

    // 守備率 = (刺殺 + 補殺) / (刺殺 + 補殺 + 失策)
    const totalChances = putouts + assists + errors;
    const fieldingPercentage = totalChances > 0 ? (putouts + assists) / totalChances : 0;

    // ポジション別集計
    const byPosition = {};
    allPlays.forEach(p => {
        const pos = p.position || 'unknown';
        if (!byPosition[pos]) {
            byPosition[pos] = { putouts: 0, assists: 0, errors: 0, finePlays: 0, total: 0 };
        }
        byPosition[pos].total++;
        if (p.result === 'putout' || p.result === 'fine_play') byPosition[pos].putouts++;
        if (p.result === 'assist') byPosition[pos].assists++;
        if (p.result === 'error') byPosition[pos].errors++;
        if (p.result === 'fine_play') byPosition[pos].finePlays++;
    });

    // ポジション別の守備率を計算
    Object.keys(byPosition).forEach(pos => {
        const bp = byPosition[pos];
        const tc = bp.putouts + bp.assists + bp.errors;
        bp.fieldingPercentage = tc > 0 ? (bp.putouts + bp.assists) / tc : 0;
    });

    return {
        totalPlays: allPlays.length,
        putouts,
        assists,
        errors,
        finePlays,
        fieldingPercentage,
        byPosition,
    };
}

/**
 * イニング数をフォーマットする（例: 2.333... → "2 1/3"）
 * @param {number} innings - イニング数
 * @returns {string} フォーマットされたイニング表記
 */
export function formatInnings(innings) {
    if (!innings && innings !== 0) return '-';
    const whole = Math.floor(innings);
    const fraction = innings - whole;
    if (fraction < 0.2) return `${whole}`;
    if (fraction < 0.5) return `${whole} 1/3`;
    return `${whole} 2/3`;
}
