/**
 * 少年野球 成績管理アプリケーション
 * メインコンポーネント - SPA全体のルーティングと状態管理
 */

import { useState, useCallback } from 'react';
import {
  BarChart3, Plus, List, Settings, X,
  Download, Upload, RotateCcw, ChevronLeft,
  Activity,
} from 'lucide-react';
import { useGameData } from './hooks/useGameData';
import Dashboard from './components/Dashboard';
import GameForm from './components/GameForm';
import GameList from './components/GameList';

// ナビゲーションのタブ定義
const TABS = [
  { key: 'dashboard', label: 'ダッシュボード', icon: BarChart3 },
  { key: 'games', label: 'データ一覧', icon: List },
];

// ヘッダーコンポーネント
function Header({ currentTab, showForm, onBack }) {
  return (
    <header className="sticky top-0 z-40 glass-strong">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {showForm ? (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">戻る</span>
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-gradient-start to-gradient-end rounded-lg flex items-center justify-center shadow-lg shadow-accent-blue/20">
                <Activity size={18} className="text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent-emerald rounded-full border-2 border-bg-primary animate-pulse"></div>
            </div>
            <div>
              <h1 className="font-heading font-bold text-text-primary text-base leading-tight">BatStats</h1>
              <p className="text-[10px] text-text-muted leading-tight">少年野球成績分析</p>
            </div>
          </div>
        )}

        {showForm && (
          <h2 className="font-heading font-semibold text-text-primary text-sm">
            データ入力
          </h2>
        )}

        <div className="w-20"></div>
      </div>
    </header>
  );
}

// ボトムナビゲーション
function BottomNav({ currentTab, onTabChange, onAdd }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-border/50">
      <div className="max-w-4xl mx-auto flex items-center justify-around py-1.5 px-2">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-all duration-200 ${currentTab === tab.key
                ? 'text-accent-blue'
                : 'text-text-muted hover:text-text-secondary'
              }`}
          >
            <tab.icon size={20} strokeWidth={currentTab === tab.key ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}

        {/* 中央の追加ボタン */}
        <button
          onClick={onAdd}
          className="relative -mt-6 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-gradient-start to-gradient-end rounded-2xl shadow-lg shadow-accent-blue/30 hover:shadow-accent-blue/50 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Plus size={28} className="text-white" strokeWidth={2.5} />
          <div className="absolute inset-0 rounded-2xl animate-pulse-glow"></div>
        </button>

        {/* 設定ボタン（ダミースペース） */}
        <button
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-all duration-200 ${currentTab === 'settings'
              ? 'text-accent-blue'
              : 'text-text-muted hover:text-text-secondary'
            }`}
        >
          <Settings size={20} strokeWidth={currentTab === 'settings' ? 2.5 : 1.5} />
          <span className="text-[10px] font-medium">設定</span>
        </button>
      </div>
    </nav>
  );
}

// 設定画面
function SettingsPage({ onExport, onImport, onReset }) {
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState(null);

  const handleImport = () => {
    const success = onImport(importText);
    setImportResult(success ? 'success' : 'error');
    if (success) {
      setImportText('');
      setShowImport(false);
    }
    setTimeout(() => setImportResult(null), 3000);
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const success = onImport(evt.target.result);
      setImportResult(success ? 'success' : 'error');
      setTimeout(() => setImportResult(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <h2 className="font-heading font-bold text-text-primary text-lg">設定</h2>

      {/* データのエクスポート */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-heading font-semibold text-text-primary mb-2">データのバックアップ</h3>
        <p className="text-xs text-text-secondary mb-3">
          全データをJSONファイルとしてダウンロードします。
        </p>
        <button
          onClick={onExport}
          className="flex items-center gap-2 bg-accent-blue/10 text-accent-blue px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-blue/20 transition-colors w-full justify-center"
        >
          <Download size={16} />
          データをエクスポート
        </button>
      </div>

      {/* データのインポート */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-heading font-semibold text-text-primary mb-2">データの復元</h3>
        <p className="text-xs text-text-secondary mb-3">
          バックアップファイルからデータを復元します。現在のデータは上書きされます。
        </p>

        <label className="flex items-center gap-2 bg-accent-emerald/10 text-accent-emerald px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-emerald/20 transition-colors w-full justify-center cursor-pointer">
          <Upload size={16} />
          ファイルを選択してインポート
          <input
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />
        </label>

        {importResult && (
          <div className={`mt-2 text-xs text-center py-1.5 rounded-lg ${importResult === 'success'
              ? 'bg-accent-emerald/10 text-accent-emerald'
              : 'bg-accent-red/10 text-accent-red'
            }`}>
            {importResult === 'success' ? 'インポート成功！' : 'インポートに失敗しました。ファイルを確認してください。'}
          </div>
        )}
      </div>

      {/* データリセット */}
      <div className="glass rounded-xl p-4 border border-accent-red/20">
        <h3 className="text-sm font-heading font-semibold text-accent-red mb-2">データのリセット</h3>
        <p className="text-xs text-text-secondary mb-3">
          全データを初期状態（サンプルデータ）にリセットします。この操作は取り消せません。
        </p>
        <button
          onClick={() => {
            if (window.confirm('本当にすべてのデータをリセットしますか？\nこの操作は取り消せません。')) {
              onReset();
            }
          }}
          className="flex items-center gap-2 bg-accent-red/10 text-accent-red px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-red/20 transition-colors w-full justify-center"
        >
          <RotateCcw size={16} />
          データをリセット
        </button>
      </div>

      {/* バージョン情報 */}
      <div className="text-center py-4">
        <p className="text-xs text-text-muted">BatStats v1.0.0</p>
        <p className="text-[10px] text-text-muted mt-1">少年野球 成績分析アプリケーション</p>
      </div>
    </div>
  );
}

export default function App() {
  const {
    games,
    addGame,
    updateGame,
    deleteGame,
    exportData,
    importData,
    resetData,
  } = useGameData();

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState(null);

  // 新規入力
  const handleAdd = useCallback(() => {
    setEditingGame(null);
    setShowForm(true);
  }, []);

  // 編集開始
  const handleEdit = useCallback((game) => {
    setEditingGame(game);
    setShowForm(true);
  }, []);

  // 保存処理
  const handleSave = useCallback((gameData) => {
    if (editingGame) {
      updateGame(editingGame.id, gameData);
    } else {
      addGame(gameData);
    }
    setShowForm(false);
    setEditingGame(null);
    setCurrentTab('games');
  }, [editingGame, addGame, updateGame]);

  // キャンセル
  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingGame(null);
  }, []);

  // 削除
  const handleDelete = useCallback((gameId) => {
    deleteGame(gameId);
  }, [deleteGame]);

  // タブ変更
  const handleTabChange = useCallback((tab) => {
    setCurrentTab(tab);
    setShowForm(false);
    setEditingGame(null);
  }, []);

  return (
    <div className="min-h-screen pb-20">
      <Header
        currentTab={currentTab}
        showForm={showForm}
        onBack={handleCancel}
      />

      <main className="max-w-4xl mx-auto px-4 py-4">
        {showForm ? (
          <GameForm
            onSave={handleSave}
            onCancel={handleCancel}
            editGame={editingGame}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard games={games} />
            )}
            {currentTab === 'games' && (
              <GameList
                games={games}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
            {currentTab === 'settings' && (
              <SettingsPage
                onExport={exportData}
                onImport={importData}
                onReset={resetData}
              />
            )}
          </>
        )}
      </main>

      {!showForm && (
        <BottomNav
          currentTab={currentTab}
          onTabChange={handleTabChange}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}
