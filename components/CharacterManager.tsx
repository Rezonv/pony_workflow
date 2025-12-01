
import React, { useState, useMemo, useEffect } from 'react';
import { Character, InventoryItem, CombatStats, UserState, SceneContext, TraceNode } from '../types';
import { getCharData, calculateStats, getBondLevel, PATH_MAP_CN, ELEMENT_MAP_CN } from '../data/combatData';
import { getTraces, getAffection, calculateFinalStats } from '../data/DataManager';
import CharacterStatsPanel from './character/CharacterStatsPanel';
import CharacterGrowthPanel from './character/CharacterGrowthPanel';
import CharacterEquipmentPanel from './character/CharacterEquipmentPanel';
import CharacterBondPanel from './character/CharacterBondPanel';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    characters: Character[];
    inventory: InventoryItem[];
    onEquipItem: (charId: string, itemId: string, slot: 'weapon' | 'armor' | 'accessory') => void;
    onUnequipItem: (charId: string, slot: 'weapon' | 'armor' | 'accessory') => void;
    customAvatars: { [key: string]: string };
    userState: UserState;
    onUpdateUserState: (newState: UserState) => void;
    onUpdateInventory: (newInv: InventoryItem[]) => void;
    affectionMap?: { [charId: string]: number };
    onUpdateAffection?: (charId: string, newScore: number) => void;
    onStartSpecialStory?: (char: Character, scene: SceneContext) => void;
    onUploadUltImage?: (charId: string, file: File) => void;
    ultImages?: { [key: string]: string };
    customLoras?: { [key: string]: string };
    onUpdateLora?: (charId: string, loraTag: string) => void;
    customLoraTriggers?: { [key: string]: string };
    onUpdateLoraTrigger?: (charId: string, trigger: string) => void;
}

const LevelUpPopup = ({ oldStats, newStats, onClose }: { oldStats: CombatStats, newStats: CombatStats, onClose: () => void }) => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-gray-900 border-2 border-yellow-500 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(234,179,8,0.3)] relative overflow-hidden" onClick={onClose}>
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 to-transparent pointer-events-none"></div>
            <h3 className="text-3xl font-black text-center text-yellow-400 mb-6 italic tracking-tighter animate-bounce">LEVEL UP!</h3>
            <div className="space-y-3">
                {[
                    { l: 'HP', k: 'hp' }, { l: 'ATK', k: 'atk' }, { l: 'DEF', k: 'def' }
                ].map(({ l, k }) => {
                    const key = k as keyof CombatStats;
                    const diff = (newStats[key] || 0) - (oldStats[key] || 0);
                    return (
                        <div key={k} className="flex justify-between items-center border-b border-gray-800 pb-2">
                            <span className="text-gray-400 font-bold">{l}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-gray-500">{Math.floor(oldStats[key] || 0)}</span>
                                <span className="text-gray-600">→</span>
                                <span className="text-white font-bold text-lg">{Math.floor(newStats[key] || 0)}</span>
                                <span className="text-green-400 text-xs">(+{Math.floor(diff)})</span>
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="mt-8 text-center text-xs text-gray-500 animate-pulse">點擊任意處關閉</div>
        </div>
    </div>
);

const CharacterManager: React.FC<Props> = ({
    isOpen, onClose, characters, inventory, onEquipItem, onUnequipItem, customAvatars,
    userState, onUpdateUserState, onUpdateInventory, affectionMap = {}, onUpdateAffection,
    onStartSpecialStory, onUploadUltImage, ultImages = {}, customLoras, onUpdateLora,
    customLoraTriggers, onUpdateLoraTrigger
}) => {
    const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'INFO' | 'GROWTH' | 'EQUIP' | 'BOND'>('INFO');
    const [levelUpData, setLevelUpData] = useState<{ old: CombatStats, new: CombatStats } | null>(null);
    const [isEquipModalOpen, setIsEquipModalOpen] = useState<{ slot: 'weapon' | 'armor' | 'accessory', open: boolean }>({ slot: 'weapon', open: false });

    if (!isOpen) return null;

    const selectedChar = characters.find(c => c.id === selectedCharId) || characters[0];
    if (!selectedCharId && characters.length > 0) setSelectedCharId(characters[0].id);

    const progression = userState.characterProgression?.[selectedChar.id] || { level: 1, exp: 0, ascension: 0, unlockedTraces: [] };
    const unlockedTraces = progression.unlockedTraces || [];
    const currentLevelCap = 20 + (progression.ascension * 20);
    const affection = affectionMap[selectedChar.id] || 50;
    const bondInfo = getBondLevel(affection);

    const traces = useMemo(() => getTraces(selectedChar.id), [selectedChar.id]);
    const milestones = useMemo(() => getAffection(selectedChar.id), [selectedChar.id]);
    const combatData = getCharData(selectedChar.id, selectedChar.name);

    const baseStats = calculateStats(selectedChar, progression.level, progression.ascension, 0);
    const finalStatsWithoutEquip = calculateFinalStats(baseStats, selectedChar.id, unlockedTraces, affection);

    let equipBonus = { hp: 0, atk: 0, def: 0, spd: 0 };
    ['weapon', 'armor', 'accessory'].forEach(slot => {
        const id = selectedChar.equipment?.[slot === 'weapon' ? 'weaponId' : slot === 'armor' ? 'armorId' : 'accessoryId'];
        if (id) {
            const item = inventory.find(i => i.id === id);
            if (item && item.stats) {
                if (item.stats.hp) equipBonus.hp += item.stats.hp;
                if (item.stats.atk) equipBonus.atk += item.stats.atk;
                if (item.stats.def) equipBonus.def += item.stats.def;
                if (item.stats.spd) equipBonus.spd += item.stats.spd;
            }
        }
    });

    const viewStats = {
        hp: finalStatsWithoutEquip.hp + equipBonus.hp,
        atk: finalStatsWithoutEquip.atk + equipBonus.atk,
        def: finalStatsWithoutEquip.def + equipBonus.def,
        spd: finalStatsWithoutEquip.spd + equipBonus.spd,
        critRate: finalStatsWithoutEquip.critRate,
        critDmg: finalStatsWithoutEquip.critDmg,
        energyRegen: finalStatsWithoutEquip.energyRegen,
        breakEffect: finalStatsWithoutEquip.breakEffect || 0,
        outgoingHealing: finalStatsWithoutEquip.outgoingHealing || 0,
        effectHitRate: finalStatsWithoutEquip.effectHitRate || 0,
        effectRes: finalStatsWithoutEquip.effectRes || 0
    };

    const handleLevelUp = () => {
        if (progression.level >= currentLevelCap) return alert("需突破才能繼續升級");
        const expBooks = inventory.find(i => i.id === 'exp_book_purple');
        if (!expBooks || expBooks.count < 1) return alert("經驗書不足 (需 漫遊指南)");

        const oldStats = { ...viewStats };

        const newInventory = inventory.map(i => i.id === 'exp_book_purple' ? { ...i, count: i.count - 1 } : i);
        const newProgression = { ...progression, level: progression.level + 1 };

        onUpdateInventory(newInventory);
        onUpdateUserState({
            ...userState,
            characterProgression: {
                ...userState.characterProgression,
                [selectedChar.id]: newProgression
            }
        });

        const newBase = calculateStats(selectedChar, newProgression.level, newProgression.ascension, 0);
        const newFinal = calculateFinalStats(newBase, selectedChar.id, unlockedTraces, affection);
        const newTotal = {
            hp: newFinal.hp + equipBonus.hp,
            atk: newFinal.atk + equipBonus.atk,
            def: newFinal.def + equipBonus.def,
            spd: newFinal.spd + equipBonus.spd,
            critRate: newFinal.critRate,
            critDmg: newFinal.critDmg
        };

        setLevelUpData({ old: oldStats, new: newTotal });
    };

    const handleQuickEquip = () => {
        let updates: { slot: 'weapon' | 'armor' | 'accessory', id: string }[] = [];

        (['weapon', 'armor', 'accessory'] as const).forEach(slot => {
            if (selectedChar.equipment?.[slot === 'weapon' ? 'weaponId' : slot === 'armor' ? 'armorId' : 'accessoryId']) return;

            const candidates = inventory.filter(i =>
                i.type === 'equipment' &&
                i.equipType === slot &&
                (!i.targetCharacterId || i.targetCharacterId === selectedChar.id)
            );

            candidates.sort((a, b) => {
                const rA = a.rarity === 'SSR' ? 3 : a.rarity === 'SR' ? 2 : 1;
                const rB = b.rarity === 'SSR' ? 3 : b.rarity === 'SR' ? 2 : 1;
                return rB - rA;
            });

            if (candidates.length > 0) {
                updates.push({ slot, id: candidates[0].id });
            }
        });

        if (updates.length === 0) return alert("沒有更合適的裝備");
        updates.forEach(u => onEquipItem(selectedChar.id, u.id, u.slot));
        alert(`已快速裝備 ${updates.length} 件物品`);
    };

    const handleUnlockTrace = (node: TraceNode) => {
        if (unlockedTraces.includes(node.id)) return;
        if (progression.level < node.reqLevel) return alert(`需要等級 Lv.${node.reqLevel}`);
        if (progression.ascension < node.reqAscension) return alert(`需要突破階級 ${node.reqAscension}`);
        if (node.dependsOn && !node.dependsOn.every(id => unlockedTraces.includes(id))) return alert("前置節點未解鎖");

        const newTraces = [...unlockedTraces, node.id];
        onUpdateUserState({
            ...userState,
            characterProgression: {
                ...userState.characterProgression,
                [selectedChar.id]: { ...progression, unlockedTraces: newTraces }
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-950 flex animate-fade-in font-sans text-gray-100">

            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-gray-900/40 z-10"></div>
                <img src={ultImages[selectedChar.id] || customAvatars[selectedChar.id] || selectedChar.avatarUrl} className="w-full h-full object-cover object-top opacity-40 blur-sm" />
            </div>

            {levelUpData && <LevelUpPopup oldStats={levelUpData.old} newStats={levelUpData.new} onClose={() => setLevelUpData(null)} />}

            <div className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-center pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-4">
                    <button onClick={onClose} className="bg-black/40 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-full p-3 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black italic tracking-tighter text-white drop-shadow-lg">CHARACTER // {selectedChar.name}</h1>
                        <div className="text-lg text-yellow-500 font-bold tracking-tighter">
                            {'★'.repeat(selectedChar.rarity)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-20 w-full h-full flex">

                <div className="w-80 h-full flex flex-col pt-20 pb-6 pl-6 z-30 pointer-events-none">
                    <div className="pointer-events-auto flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                        {characters.map(char => {
                            const data = getCharData(char.id, char.name);
                            const isGenshin = char.game === 'Genshin Impact';
                            const roleText = isGenshin ? ELEMENT_MAP_CN[data.element] : PATH_MAP_CN[data.path];

                            // Rarity colors
                            const isSSR = char.rarity === 5;
                            const borderColor = isSSR ? 'border-yellow-500' : char.rarity === 4 ? 'border-purple-500' : 'border-blue-500';
                            // const textColor = isSSR ? 'text-yellow-500' : char.rarity === 4 ? 'text-purple-400' : 'text-blue-400';

                            return (
                                <div key={char.id} onClick={() => setSelectedCharId(char.id)} className={`group cursor-pointer flex items-center gap-3 p-2 rounded-r-full transition-all ${selectedChar.id === char.id ? 'bg-gradient-to-r from-pink-600/80 to-transparent pl-4 border-l-4 border-pink-400' : 'hover:bg-white/5'}`}>
                                    <div className={`w-12 h-12 rounded-full border-2 overflow-hidden shrink-0 ${selectedChar.id === char.id ? `${borderColor} scale-110` : `${borderColor} grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100`}`}>
                                        <img src={customAvatars[char.id] || char.avatarUrl} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <div className={`font-bold text-sm truncate ${selectedChar.id === char.id ? 'text-white' : 'text-gray-400'}`}>{char.name}</div>
                                        </div>
                                        <div className="text-[10px] text-gray-500 uppercase truncate">{roleText || data.path}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 h-full relative flex items-center justify-center z-10 -ml-20 pointer-events-none">
                    <img
                        src={selectedChar.portraitUrl || ultImages[selectedChar.id] || customAvatars[selectedChar.id] || selectedChar.avatarUrl}
                        className="h-[110%] object-contain drop-shadow-2xl transition-all duration-500 mask-image-gradient-b animate-breathe"
                        style={{ transform: 'translateX(-10%)' }}
                    />
                </div>

                <div className="w-[500px] h-full bg-gray-900/80 backdrop-blur-xl border-l border-white/10 flex flex-col pt-20 pb-6 px-8 shadow-2xl z-40">

                    <div className="flex bg-black/40 rounded-lg p-1 mb-6 shrink-0">
                        {[
                            { id: 'INFO', label: '資訊', icon: '📊' },
                            { id: 'GROWTH', label: '成長', icon: '⚡' },
                            { id: 'EQUIP', label: '裝備', icon: '🎒' },
                            { id: 'BOND', label: '羈絆', icon: '❤' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">

                        {activeTab === 'INFO' && (
                            <div className="space-y-4">
                                <CharacterStatsPanel
                                    combatData={combatData}
                                    level={progression.level}
                                    maxLevel={currentLevelCap}
                                    viewStats={viewStats}
                                    baseStats={baseStats}
                                />

                                {/* LoRA Settings Section */}
                                <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                                    <h3 className="text-pink-400 font-bold mb-2 flex items-center gap-2">
                                        <span>🎨 LoRA 設定 (AI 繪圖)</span>
                                        <span className="text-[10px] bg-pink-900/50 px-2 py-0.5 rounded text-pink-200">進階</span>
                                    </h3>
                                    <div className="space-y-3">
                                        <p className="text-xs text-gray-400">設定 Stable Diffusion LoRA 模型與權重。</p>

                                        {(() => {
                                            const currentVal = customLoras?.[selectedChar.id] || '';
                                            const match = currentVal.match(/<lora:(.+):(.+)>/);
                                            const name = match ? match[1] : (currentVal.startsWith('<') ? '' : currentVal);
                                            const weight = match ? parseFloat(match[2]) : 0.8;

                                            const update = (n: string, w: number) => {
                                                let finalName = n;
                                                let finalWeight = w;

                                                // Handle pasted full tag (e.g., <lora:name:1.0>)
                                                const pasteMatch = n.match(/<lora:(.+):(.+)>/);
                                                if (pasteMatch) {
                                                    finalName = pasteMatch[1];
                                                    const parsedWeight = parseFloat(pasteMatch[2]);
                                                    if (!isNaN(parsedWeight)) {
                                                        finalWeight = parsedWeight;
                                                    }
                                                } else {
                                                    // Cleanup if user pasted partial tag or corrupted state
                                                    finalName = finalName.replace(/^<lora:/, '').replace(/:[0-9.]+>?$/, '');
                                                }

                                                if (!finalName) {
                                                    onUpdateLora && onUpdateLora(selectedChar.id, '');
                                                } else {
                                                    onUpdateLora && onUpdateLora(selectedChar.id, `<lora:${finalName}:${finalWeight.toFixed(1)}>`);
                                                }
                                            };

                                            return (
                                                <>
                                                    <div>
                                                        <label className="text-xs text-gray-500 mb-1 block">模型名稱 (Model Name)</label>
                                                        <input
                                                            type="text"
                                                            placeholder="例: Mihoyo"
                                                            className="w-full bg-gray-900/80 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-pink-500 outline-none transition-colors"
                                                            value={name}
                                                            onChange={(e) => update(e.target.value, weight)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                            <span>權重 (Weight)</span>
                                                            <span>{weight.toFixed(1)}</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0.1"
                                                            max="1.5"
                                                            step="0.1"
                                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                                            value={weight}
                                                            onChange={(e) => update(name, parseFloat(e.target.value))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500 mb-1 block">觸發詞 (Trigger Words)</label>
                                                        <input
                                                            key={`trigger-${selectedChar.id}`}
                                                            type="text"
                                                            placeholder="例: firefly, mecha girl"
                                                            className="w-full bg-gray-900/80 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-pink-500 outline-none transition-colors"
                                                            value={customLoraTriggers?.[selectedChar.id] || ''}
                                                            onChange={(e) => {
                                                                if (onUpdateLoraTrigger) {
                                                                    onUpdateLoraTrigger(selectedChar.id, e.target.value);
                                                                } else {
                                                                    console.error("onUpdateLoraTrigger is missing!");
                                                                    alert("系統更新中，請重新整理頁面以啟用此功能。");
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'GROWTH' && (
                            <CharacterGrowthPanel
                                progression={progression}
                                maxLevel={currentLevelCap}
                                traces={traces}
                                unlockedTraces={unlockedTraces}
                                onLevelUp={handleLevelUp}
                                onUnlockTrace={handleUnlockTrace}
                            />
                        )}

                        {activeTab === 'EQUIP' && (
                            <CharacterEquipmentPanel
                                character={selectedChar}
                                inventory={inventory}
                                onUnequipItem={onUnequipItem}
                                onOpenEquipModal={(slot) => setIsEquipModalOpen({ slot, open: true })}
                                onQuickEquip={handleQuickEquip}
                            />
                        )}

                        {activeTab === 'BOND' && (
                            <CharacterBondPanel
                                character={selectedChar}
                                affection={affection}
                                bondInfo={bondInfo}
                                milestones={milestones}
                                onStartSpecialStory={onStartSpecialStory}
                                onUpdateAffection={onUpdateAffection}
                            />
                        )}
                    </div>
                </div>
            </div>

            {
                isEquipModalOpen.open && (
                    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-gray-900 w-full max-w-md rounded-xl border border-gray-700 max-h-[80vh] flex flex-col shadow-2xl">
                            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                                <h3 className="text-white font-bold">選擇裝備 ({isEquipModalOpen.slot === 'weapon' ? '武器' : isEquipModalOpen.slot === 'armor' ? '防具' : '飾品'})</h3>
                                <button onClick={() => setIsEquipModalOpen({ ...isEquipModalOpen, open: false })} className="text-gray-400">✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                                {inventory.filter(i => i.equipType === isEquipModalOpen.slot).map(item => (
                                    <button key={item.id} onClick={() => { onEquipItem(selectedChar.id, item.id, isEquipModalOpen.slot); setIsEquipModalOpen({ ...isEquipModalOpen, open: false }); }} className="w-full text-left p-3 hover:bg-gray-800 rounded-lg flex items-center gap-4 border-b border-gray-800 last:border-0 transition-colors">
                                        <div className="text-2xl">{item.icon}</div>
                                        <div className="flex-1">
                                            <div className="text-white font-bold text-sm">{item.name}</div>
                                            <div className="text-[10px] text-gray-500">{item.rarity}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default CharacterManager;
