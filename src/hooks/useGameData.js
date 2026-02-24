/**
 * LocalStorageを使用したデータ永続化のカスタムフック
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'yakyuseiseki_data';

// 初期サンプルデータ（デモ用）- 1球ごとのpitches配列を含む
const INITIAL_DATA = {
    games: [
        {
            id: '1',
            date: '2026-02-15',
            opponent: 'タイガースJr.',
            tournament: '春季大会',
            bat: 'Legacy 78cm',
            type: 'game',
            at_bats: [
                {
                    id: 'ab1',
                    inning: 1,
                    result: '2B',
                    direction: { x: 280, y: 80 },
                    type: 'Liner',
                    quality: 'Solid',
                    notes: '外角高めを右中間へ',
                    pitches: [
                        { id: 'p1', result: 'ball', zone: 'ball-outside', pitchType: 'fastball', notes: '' },
                        { id: 'p2', result: 'in_play', zone: 'outer-high', pitchType: 'fastball', notes: '右中間へ二塁打' },
                    ],
                },
                {
                    id: 'ab2',
                    inning: 3,
                    result: 'GO',
                    direction: { x: 120, y: 150 },
                    type: 'Grounder',
                    quality: 'Weak',
                    notes: '内角低めのカーブに詰まる',
                    pitches: [
                        { id: 'p3', result: 'strike_looking', zone: 'outer-low', pitchType: 'curve', notes: '' },
                        { id: 'p4', result: 'foul', zone: 'inner-mid', pitchType: 'fastball', foulDirection: 'left', notes: 'レフト方向ファウル' },
                        { id: 'p5', result: 'in_play', zone: 'inner-low', pitchType: 'curve', notes: '詰まってサードゴロ' },
                    ],
                },
                {
                    id: 'ab3',
                    inning: 5,
                    result: '1B',
                    direction: { x: 200, y: 110 },
                    type: 'Liner',
                    quality: 'Solid',
                    notes: 'センター返し',
                    pitches: [
                        { id: 'p6', result: 'ball', zone: 'ball-low', pitchType: 'change', notes: '' },
                        { id: 'p7', result: 'ball', zone: 'ball-inside', pitchType: 'fastball', notes: '' },
                        { id: 'p8', result: 'strike_swinging', zone: 'outer-low', pitchType: 'slider', notes: '' },
                        { id: 'p9', result: 'in_play', zone: 'center-mid', pitchType: 'fastball', notes: 'センター返し' },
                    ],
                },
            ],
            pitching: {
                innings: 3,
                pitchCount: 42,
                battersFaced: 12,
                hits: 2,
                runs: 1,
                earnedRuns: 1,
                walks: 1,
                strikeouts: 4,
                hitBatters: 0,
                wildPitches: 0,
                decision: 'win',
                notes: '3回を1失点、4奪三振',
            },
            fielding: [
                { id: 'f1', inning: 1, position: 'P', playType: 'groundball', result: 'assist', notes: 'ピッチャーゴロ→ファーストへ送球' },
                { id: 'f2', inning: 2, position: 'P', playType: 'bunt_field', result: 'assist', notes: 'バント処理→ファーストへ' },
                { id: 'f3', inning: 4, position: 'SS', playType: 'groundball', result: 'assist', notes: 'ショートゴロ→ファーストへ送球' },
                { id: 'f4', inning: 5, position: 'SS', playType: 'flyball', result: 'putout', notes: 'ショートフライ捕球' },
            ],
        },
        {
            id: '2',
            date: '2026-02-08',
            opponent: 'イーグルスJr.',
            tournament: '練習試合',
            bat: 'Legacy 78cm',
            type: 'game',
            at_bats: [
                {
                    id: 'ab4',
                    inning: 1,
                    result: 'K',
                    direction: null,
                    type: null,
                    quality: null,
                    notes: '外角低めスライダーに空振り三振',
                    strikeoutType: 'swinging',
                    strikeoutZone: 'outer-low',
                    pitches: [
                        { id: 'p10', result: 'ball', zone: 'ball-inside', pitchType: 'fastball', notes: '' },
                        { id: 'p11', result: 'strike_looking', zone: 'outer-mid', pitchType: 'slider', notes: '' },
                        { id: 'p12', result: 'foul', zone: 'center-mid', pitchType: 'fastball', foulDirection: 'right', notes: 'ライト方向ファウル' },
                        { id: 'p13', result: 'strike_swinging', zone: 'outer-low', pitchType: 'slider', notes: '空振り三振' },
                    ],
                },
                {
                    id: 'ab5',
                    inning: 3,
                    result: 'HR',
                    direction: { x: 200, y: 20 },
                    type: 'Fly',
                    quality: 'Solid',
                    notes: '真ん中高めのストレートをセンターオーバー',
                    pitches: [
                        { id: 'p14', result: 'in_play', zone: 'center-high', pitchType: 'fastball', notes: 'センターオーバーHR' },
                    ],
                },
                {
                    id: 'ab6',
                    inning: 5,
                    result: 'FO',
                    direction: { x: 300, y: 70 },
                    type: 'Fly',
                    quality: 'Normal',
                    notes: 'ライトフライ',
                    pitches: [
                        { id: 'p15', result: 'strike_looking', zone: 'outer-mid', pitchType: 'fastball', notes: '' },
                        { id: 'p16', result: 'ball', zone: 'ball-low', pitchType: 'change', notes: '' },
                        { id: 'p17', result: 'in_play', zone: 'outer-high', pitchType: 'change', notes: 'ライトフライ' },
                    ],
                },
            ],
            pitching: null,
            fielding: [
                { id: 'f5', inning: 1, position: 'SS', playType: 'groundball', result: 'assist', notes: 'ショートゴロ→ファーストへ' },
                { id: 'f6', inning: 3, position: 'SS', playType: 'liner', result: 'fine_play', notes: 'ジャンピングキャッチ！' },
                { id: 'f7', inning: 4, position: 'SS', playType: 'groundball', result: 'error', notes: 'ショートゴロをトンネル' },
                { id: 'f8', inning: 5, position: 'SS', playType: 'throw', result: 'assist', notes: 'ダブルプレーの中継' },
            ],
        },
        {
            id: '3',
            date: '2026-02-22',
            opponent: '',
            tournament: 'フリーバッティング',
            bat: 'Legacy 78cm',
            type: 'practice',
            at_bats: [
                {
                    id: 'ab7',
                    inning: 1,
                    result: '2B',
                    direction: { x: 310, y: 60 },
                    type: 'Liner',
                    quality: 'Solid',
                    notes: '右中間ライナー',
                    pitches: [
                        { id: 'p18', result: 'in_play', zone: 'center-mid', pitchType: 'fastball', notes: '' },
                    ],
                },
                {
                    id: 'ab8',
                    inning: 1,
                    result: '1B',
                    direction: { x: 100, y: 130 },
                    type: 'Liner',
                    quality: 'Solid',
                    notes: 'レフト前',
                    pitches: [
                        { id: 'p19', result: 'foul', zone: 'inner-high', pitchType: 'fastball', foulDirection: 'left', notes: '' },
                        { id: 'p20', result: 'in_play', zone: 'inner-mid', pitchType: 'fastball', notes: '' },
                    ],
                },
                {
                    id: 'ab9',
                    inning: 1,
                    result: 'HR',
                    direction: { x: 200, y: 10 },
                    type: 'Fly',
                    quality: 'Solid',
                    notes: 'センターオーバー柵越え',
                    pitches: [
                        { id: 'p21', result: 'in_play', zone: 'center-high', pitchType: 'fastball', notes: '' },
                    ],
                },
                {
                    id: 'ab10',
                    inning: 1,
                    result: '1B',
                    direction: { x: 250, y: 120 },
                    type: 'Liner',
                    quality: 'Normal',
                    notes: 'ライト前',
                    pitches: [
                        { id: 'p22', result: 'ball', zone: 'ball-high', pitchType: 'fastball', notes: '' },
                        { id: 'p23', result: 'in_play', zone: 'outer-mid', pitchType: 'fastball', notes: '' },
                    ],
                },
                {
                    id: 'ab11',
                    inning: 1,
                    result: '2B',
                    direction: { x: 130, y: 80 },
                    type: 'Liner',
                    quality: 'Solid',
                    notes: 'レフトオーバー',
                    pitches: [
                        { id: 'p24', result: 'strike_swinging', zone: 'outer-low', pitchType: 'fastball', notes: '' },
                        { id: 'p25', result: 'in_play', zone: 'inner-high', pitchType: 'fastball', notes: '' },
                    ],
                },
                {
                    id: 'ab12',
                    inning: 1,
                    result: 'GO',
                    direction: { x: 180, y: 170 },
                    type: 'Grounder',
                    quality: 'Weak',
                    notes: 'ショートゴロ',
                    pitches: [
                        { id: 'p26', result: 'foul', zone: 'center-mid', pitchType: 'fastball', foulDirection: 'right', notes: '' },
                        { id: 'p27', result: 'in_play', zone: 'inner-low', pitchType: 'fastball', notes: '' },
                    ],
                },
            ],
            pitching: null,
            fielding: [],
        },
    ],
};

/**
 * LocalStorageに保存・読み込みするカスタムフック
 * @returns {Object} データ管理用のメソッドとデータ
 */
export function useGameData() {
    const [data, setData] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
            return INITIAL_DATA;
        } catch {
            return INITIAL_DATA;
        }
    });

    // データが変更されたらLocalStorageに保存
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('LocalStorageへの保存に失敗:', error);
        }
    }, [data]);

    // ゲーム/練習セッションを追加
    const addGame = useCallback((game) => {
        const newGame = {
            ...game,
            id: Date.now().toString(),
            at_bats: game.at_bats || [],
        };
        setData(prev => ({
            ...prev,
            games: [newGame, ...prev.games],
        }));
        return newGame.id;
    }, []);

    // ゲーム/練習セッションを更新
    const updateGame = useCallback((gameId, updates) => {
        setData(prev => ({
            ...prev,
            games: prev.games.map(g =>
                g.id === gameId ? { ...g, ...updates } : g
            ),
        }));
    }, []);

    // ゲーム/練習セッションを削除
    const deleteGame = useCallback((gameId) => {
        setData(prev => ({
            ...prev,
            games: prev.games.filter(g => g.id !== gameId),
        }));
    }, []);

    // 打席データを追加
    const addAtBat = useCallback((gameId, atBat) => {
        const newAtBat = {
            ...atBat,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        };
        setData(prev => ({
            ...prev,
            games: prev.games.map(g =>
                g.id === gameId
                    ? { ...g, at_bats: [...(g.at_bats || []), newAtBat] }
                    : g
            ),
        }));
    }, []);

    // 打席データを更新
    const updateAtBat = useCallback((gameId, atBatId, updates) => {
        setData(prev => ({
            ...prev,
            games: prev.games.map(g =>
                g.id === gameId
                    ? {
                        ...g,
                        at_bats: (g.at_bats || []).map(ab =>
                            ab.id === atBatId ? { ...ab, ...updates } : ab
                        ),
                    }
                    : g
            ),
        }));
    }, []);

    // 打席データを削除
    const deleteAtBat = useCallback((gameId, atBatId) => {
        setData(prev => ({
            ...prev,
            games: prev.games.map(g =>
                g.id === gameId
                    ? { ...g, at_bats: (g.at_bats || []).filter(ab => ab.id !== atBatId) }
                    : g
            ),
        }));
    }, []);

    // 全データをリセット
    const resetData = useCallback(() => {
        setData(INITIAL_DATA);
    }, []);

    // データをエクスポート
    const exportData = useCallback(() => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `baseball-stats-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [data]);

    // データをインポート
    const importData = useCallback((jsonString) => {
        try {
            const imported = JSON.parse(jsonString);
            if (imported.games && Array.isArray(imported.games)) {
                setData(imported);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, []);

    return {
        data,
        games: data.games || [],
        addGame,
        updateGame,
        deleteGame,
        addAtBat,
        updateAtBat,
        deleteAtBat,
        resetData,
        exportData,
        importData,
    };
}
