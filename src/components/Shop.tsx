import { useState, useEffect } from 'react';
import { ShoppingBag, Sparkles, Coins, Check } from 'lucide-react';
import { ShopItem } from '../types';

interface ShopProps {
  coins: number;
  onPurchase: (item: ShopItem) => Promise<void>;
  ownedItems: string[];
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'badge_pro',
    name: 'Pro Dev Badge',
    description: 'Displays a shiny golden [PRO] badge beside your avatar.',
    price: 30,
    icon: '🏆',
  },
  {
    id: 'avatar_glowing',
    name: 'Neon Border Frame',
    description: 'A gorgeous cycling cyan-to-violet border for your profile picture.',
    price: 60,
    icon: '🔮',
  },
  {
    id: 'mystery_box',
    name: 'Mystery Hack Box',
    description: 'Open to find randomly selected retro sound themes and easter eggs!',
    price: 25,
    icon: '🎁',
  },
  {
    id: 'title_billionaire',
    name: '"Virtual Whale" Title',
    description: 'Earn respect and dynamic visual sparkle effects on the leaderboard.',
    price: 100,
    icon: '👑',
  }
];

export default function Shop({ coins, onPurchase, ownedItems }: ShopProps) {
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const handleBuy = async (item: ShopItem) => {
    if (coins < item.price) return;
    setPurchasingId(item.id);
    try {
      await onPurchase(item);
    } catch (e) {
      console.error(e);
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="glass-panel p-5 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#EAB308]" />
          <h3 className="text-sm font-semibold text-white font-sans">Virtual Rewards Shop</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono text-[10px]">PMSL</span>
      </div>

      {/* Grid of items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
        {SHOP_ITEMS.map((item) => {
          const isOwned = ownedItems.includes(item.id);
          const isSingleUse = item.id === 'mystery_box'; // Mystery box can be bought multiple times
          const showOwned = isOwned && !isSingleUse;
          const canAfford = coins >= item.price;

          return (
            <div 
              key={item.id} 
              className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                showOwned 
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400' 
                  : 'bg-white/3 border-white/5 hover:border-white/10 hover:bg-white/5 text-white'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Item Icon */}
                <span className="text-2xl p-2 bg-white/5 border border-white/5 rounded-lg shrink-0">
                  {item.icon}
                </span>
                
                {/* Item Metadata */}
                <div className="space-y-1">
                  <h4 className="font-semibold text-xs text-slate-200 flex items-center gap-1">
                    {item.name}
                    {showOwned && <span className="bg-emerald-500/15 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded uppercase font-mono">Owned</span>}
                  </h4>
                  <p className="text-[10.5px] text-slate-400 leading-normal line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Purchase Actions */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                <div className="flex items-center gap-1 text-xs font-semibold text-[#EAB308] font-mono">
                  <Coins className="w-3.5 h-3.5 text-[#EAB308]" />
                  {item.price}
                </div>

                {showOwned ? (
                  <div className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 py-1">
                    <Check className="w-3 h-3" /> Activated
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford || purchasingId !== null}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                      canAfford 
                        ? 'bg-[#EAB308] text-black hover:opacity-90 cursor-pointer shadow-md' 
                        : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                    }`}
                    id={`btn-shop-buy-${item.id}`}
                  >
                    {purchasingId === item.id ? (
                      <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Buy Item'
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
