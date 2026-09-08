'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Coins,
  Hammer,
  Lamp,
  Package,
  ScrollText,
  BookOpen,
  Settings,
  Sun,
  Sparkles,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { actShop, current, freshShop } from '@/lib/pawn/engine';
import { board, usedSpace } from '@/lib/pawn/inventory';
import { DEBT, EXPENSE, signNames, intentNames } from '@/lib/pawn/catalog';
import { LEGACY_KEY, parseShop, SAVE_KEY } from '@/lib/pawn/save';
import { migrateSave } from '@/lib/migration';
import { validateSave } from '@/lib/game';
import type { Action, Shop } from '@/lib/pawn/types';
import { Counter } from './Counter';
import { Storage } from './Storage';
import { Journal, Ledger, Management } from './Management';
import LegacyGame from './LegacyGame';

const tabs = [
  { id: 'counter', name: '柜台与货架', icon: Package },
  { id: 'workshop', name: '招牌与手艺', icon: Hammer },
  { id: 'ledger', name: '账本与地契', icon: ScrollText },
  { id: 'journal', name: '熟客与手记', icon: BookOpen },
];
function download(raw: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([raw], { type: 'application/json' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function ShopGame() {
  const [shop, setShop] = useState<Shop>(() => freshShop(42)),
    [ready, setReady] = useState(false),
    [writable, setWritable] = useState(false),
    [tab, setTab] = useState('counter'),
    [modal, setModal] = useState(''),
    [saveStatus, setSaveStatus] = useState('正在读取存档'),
    [legacy, setLegacy] = useState(false),
    [hasLegacy, setHasLegacy] = useState(false),
    [notice, setNotice] = useState('');
  const ref = useRef(shop),
    file = useRef<HTMLInputElement>(null);
  const send = useCallback((a: Action) => {
    const next = actShop(ref.current, a);
    ref.current = next;
    setShop(next);
  }, []);
  useEffect(() => {
    let cancelled = false;
    // Browser persistence is loaded after hydration; cancel StrictMode's abandoned mount.
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        setHasLegacy(!!localStorage.getItem(LEGACY_KEY));
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
          const next = parseShop(raw);
          if (next) {
            ref.current = next;
            setShop(next);
            setWritable(true);
          } else {
            setNotice(
              '新版存档未能通过校验。原始数据已保留；请先导出备份，再选择导入或重新开始。',
            );
            setModal('settings');
          }
        } else {
          const next = freshShop();
          ref.current = next;
          setShop(next);
          setWritable(true);
        }
      } catch {
        setNotice('浏览器存储不可用。可以游玩，但请使用导出保存进度。');
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (!ready || !writable || legacy) return;
    let active = true,
      status = '已自动保存 · 本机';
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(shop));
    } catch {
      status = '自动保存失败 · 请导出';
    }
    queueMicrotask(() => {
      if (active) setSaveStatus(status);
    });
    return () => {
      active = false;
    };
  }, [shop, ready, writable, legacy]);
  const exportCurrent = () =>
    download(
      JSON.stringify(ref.current, null, 2),
      `暮灯当铺-贷款篇-第${shop.day}天.json`,
    );
  const exportStored = (key: string) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw)
        download(
          raw,
          key === LEGACY_KEY
            ? '暮灯当铺-旧版存档.json'
            : '暮灯当铺-原始存档备份.json',
        );
      else setNotice('没有找到对应存档。');
    } catch {
      setNotice('无法读取浏览器存档。');
    }
  };
  const reset = () => {
    const next = freshShop();
    ref.current = next;
    setShop(next);
    setWritable(true);
    setModal('');
    setNotice('');
    setTab('counter');
  };
  const importFile = async (input?: File) => {
    if (!input) return;
    try {
      if (input.size > 2000000) throw Error();
      const raw = await input.text(),
        next = parseShop(raw);
      if (next) {
        ref.current = next;
        setShop(next);
        setWritable(true);
        setNotice('贷款篇存档已恢复。');
        setModal('');
        setTab('counter');
      } else {
        const old = migrateSave(JSON.parse(raw));
        if (!old || !validateSave(old)) throw Error();
        localStorage.setItem(LEGACY_KEY, JSON.stringify(old));
        setHasLegacy(true);
        setNotice('旧版存档已恢复到七日篇。新版进度未改动，可进入旧版继续。');
      }
    } catch {
      setNotice('存档无法读取，当前进度没有被覆盖。');
    }
    if (file.current) file.current.value = '';
  };
  if (legacy)
    return (
      <>
        <Button className="p-return-new" onClick={() => setLegacy(false)}>
          ← 回到贷款经营篇
        </Button>
        <LegacyGame />
      </>
    );
  if (!ready)
    return (
      <main className="pawn-app p-loading">
        <Lamp />
        <p>推开暮灯当铺的门……</p>
      </main>
    );
  const progress = Math.round((shop.paidDebt / DEBT) * 100),
    [w, h] = board(shop, 'shop');
  const welcome = !shop.greeted && !modal;
  return (
    <main className="pawn-app">
      <header className="p-header">
        <div className="p-brand">
          <Lamp size={30} />
          <div>
            <strong>暮灯当铺</strong>
            <small>把旧物交给下一段旅程</small>
          </div>
        </div>
        <div className="p-header-day">
          <Sun size={18} />
          霜叶月 · 第 {shop.day} 天
        </div>
        <div className="p-header-actions">
          <span className="p-cash">
            <Coins size={18} />
            <b>{shop.gold}</b>
            <small>金币</small>
          </span>
          <span>
            <Sparkles size={17} />
            <b>{shop.energy}</b>
            <small>/12 精力</small>
          </span>
          <Button
            className="p-icon-button"
            aria-label="存档与设置"
            onClick={() => setModal('settings')}
          >
            <Settings size={19} />
          </Button>
        </div>
      </header>
      <div className="p-layout">
        <aside className="p-sidebar">
          <span className="p-address">橡木镇 · 南街 07 号</span>
          <nav aria-label="当铺功能">
            {tabs.map(({ id, name, icon: Icon }) => (
              <Button
                key={id}
                className={`p-nav ${tab === id ? 'is-active' : ''}`}
                aria-current={tab === id ? 'page' : undefined}
                onClick={() => setTab(id)}
              >
                <Icon size={18} />
                {name}
              </Button>
            ))}
          </nav>
          <div className="p-sidebar-debt">
            <ScrollText size={23} />
            <small>距离自己的店</small>
            <strong>
              {shop.debt.toLocaleString()} <span>G</span>
            </strong>
            <div className="p-debt-track">
              <i style={{ width: `${progress}%` }} />
            </div>
            <span>贷款已偿还 {progress}%</span>
            <Button
              className="p-button p-quiet"
              onClick={() => setTab('ledger')}
            >
              翻开还款账本 →
            </Button>
          </div>
          <div className="p-sidebar-bottom">
            <p>
              “留出一格货架，
              <br />
              也给明天留一个机会。”
            </p>
            <Button
              className="p-button p-quiet"
              onClick={() => setModal('help')}
            >
              掌柜手册
            </Button>
            <small>{saveStatus}</small>
          </div>
        </aside>
        <section className="p-main">
          <div className="p-page-heading">
            <div>
              <small>
                暮灯当铺 / {shop.ended ? '本周目已结束' : '贷款经营篇'}
              </small>
              <h1>{tabs.find((t) => t.id === tab)?.name}</h1>
            </div>
            <div className="p-open-badge">
              <i />
              {shop.ended
                ? '地契已到手'
                : current(shop)
                  ? '开门营业'
                  : '整理店铺'}
            </div>
          </div>
          {notice && (
            <output className="p-notice">
              <span>{notice}</span>
              <button aria-label="关闭通知" onClick={() => setNotice('')}>
                ×
              </button>
            </output>
          )}
          <div className="p-day-strip">
            <span>
              明日招牌 <b>{signNames[shop.sign]}</b> ·{' '}
              {intentNames[shop.intent]}
            </span>
            <span>
              <Shield size={15} />
              {shop.day < 4
                ? '街坊渐渐认识了这间店'
                : shop.heat >= 30
                  ? '风声紧：搜查风险较高'
                  : '留意可疑来客与突然搜查'}
            </span>
          </div>
          <output className="p-feedback" aria-live="polite">
            <Lamp size={19} />
            <span>{shop.message}</span>
          </output>
          <div className={shop.ended ? 'p-ended-content' : ''}>
            {tab === 'counter' && (
              <div className="p-play-layout">
                <Counter
                  key={`${shop.day}-${shop.cursor}-${current(shop)?.id}`}
                  shop={shop}
                  send={send}
                />
                <Storage shop={shop} send={send} />
              </div>
            )}
            {tab === 'workshop' && <Management shop={shop} send={send} />}
            {tab === 'ledger' && (
              <Ledger
                shop={shop}
                send={send}
                finish={() => setModal('finish')}
              />
            )}
            {tab === 'journal' && <Journal shop={shop} />}
          </div>
          <footer className="p-day-footer">
            <span>
              店内占用{' '}
              <b>
                {usedSpace(shop)} / {w * h}
              </b>{' '}
              格
            </span>
            <span>
              每日开支 <b>{EXPENSE} G</b>
            </span>
            <Button
              className="p-button p-primary"
              disabled={!!current(shop) || shop.ended}
              onClick={() => send({ type: 'endDay' })}
            >
              打烊并开新一天 <ArrowRight size={16} />
            </Button>
          </footer>
          {shop.ended && (
            <div className="p-finished-banner">
              <strong>{shop.ending}</strong>
              <Button className="p-button" onClick={exportCurrent}>
                导出这个结局
              </Button>
              <Button
                className="p-button p-primary"
                onClick={() => setModal('reset')}
              >
                再开一家不同的店
              </Button>
            </div>
          )}
        </section>
      </div>
      <Dialog
        open={welcome || !!modal}
        onOpenChange={(open) => {
          if (!open) {
            if (welcome) send({ type: 'greet' });
            setModal('');
          }
        }}
      >
        <DialogContent className="p-modal">
          <DialogTitle>
            {welcome
              ? '这把钥匙，先交给你。'
              : (
                  {
                    settings: '炉火旁的小憩',
                    help: '掌柜的第一本手册',
                    reset: '重新开一家店',
                    finish: '把地契挂上墙',
                  } as Record<string, string>
                )[modal]}
          </DialogTitle>
          <DialogDescription>
            {welcome
              ? '老掌柜准备退休，把当铺赊让给你。还清余款，店就正式属于你。'
              : modal === 'settings'
                ? '贷款篇与旧版七日篇分开保存。导入前建议先导出当前进度。'
                : modal === 'reset'
                  ? '将开始新的贷款经营篇。当前新版进度会被替换，旧版七日篇不受影响。'
                  : modal === 'finish'
                    ? '这一周目的经营与熟客经历将写入结局。'
                    : '生意怎么做，由你的投资、招牌和每一笔交易决定。'}
          </DialogDescription>
          {welcome && (
            <>
              <div className="p-welcome-numbers">
                <span>
                  周转金<b>560 G</b>
                </span>
                <span>
                  店铺余款<b>3,000 G</b>
                </span>
                <span>
                  店内空间<b>24 格</b>
                </span>
              </div>
              <ol className="p-help">
                <li>
                  先接待柜台客人，物品按大小入库。卖货要接待买家，打烊不会自动清空货架。
                </li>
                <li>
                  赚到钱后，购买工具、学习鉴定、制作招牌，逐渐选出自己的经营方向。
                </li>
                <li>
                  典当占用本金与空间，到期会安排赎回来访。每七天至少累计还款 120
                  G，每日开支 18 G。
                </li>
                <li>还清贷款后处理好未结典当，就能拿着地契为这一局收尾。</li>
              </ol>
              {hasLegacy && (
                <p className="p-clue">
                  检测到七日篇旧存档，已原样保留，可在设置中继续。
                </p>
              )}
              <Button
                className="p-button p-primary"
                onClick={() => send({ type: 'greet' })}
              >
                接过钥匙 · 开门营业
              </Button>
            </>
          )}
          {modal === 'settings' && (
            <div className="p-settings">
              <Button className="p-button" onClick={exportCurrent}>
                导出当前贷款篇
              </Button>
              <Button
                className="p-button"
                onClick={() => file.current?.click()}
              >
                导入存档
              </Button>
              <Button
                className="p-button"
                onClick={() => exportStored(SAVE_KEY)}
              >
                备份浏览器原始存档
              </Button>
              {hasLegacy && (
                <>
                  <Button
                    className="p-button"
                    onClick={() => {
                      setLegacy(true);
                      setModal('');
                    }}
                  >
                    继续旧版七日篇
                  </Button>
                  <Button
                    className="p-button"
                    onClick={() => exportStored(LEGACY_KEY)}
                  >
                    导出旧版存档
                  </Button>
                </>
              )}
              <Button
                className="p-button p-danger"
                onClick={() => setModal('reset')}
              >
                重新开始贷款篇
              </Button>
            </div>
          )}
          {modal === 'help' && (
            <ol className="p-help">
              <li>
                <b>钱与空间。</b>
                大件货需要连续空格。选中物品后点击空格移动，或拖放；旋转可以改变占地形状。
              </li>
              <li>
                <b>货物不自动售出。</b>
                先把自有货物上架，再向买家推荐。预算、类别、成色与报价都影响成交。
              </li>
              <li>
                <b>招牌引客。</b>
                先付费学习，再制作对应招牌。收货、卖货、委托的倾向从次日生效。
              </li>
              <li>
                <b>工具与知识。</b>
                外观检查能看成色与普通仿品；魔力真假和诅咒需要学习鉴定。修复与鉴定消耗精力。
              </li>
              <li>
                <b>典当有期限。</b>
                抵押物属于客人，不能随便出售。到期赎回；未能到场的客人可宽限一次或依约转死当。
              </li>
              <li>
                <b>提防意外。</b>
                第四天起，观察可疑来客可以防盗，警铃也能保护展示货物。禁品交易提高风声，暗格可避开突然搜查。
              </li>
              <li>
                <b>留下本钱。</b>每七天至少累计还 120
                G。提前还款抵扣后续最低还款；总余款只有 3,000 G，不会无限增加。
              </li>
            </ol>
          )}
          {modal === 'reset' && (
            <>
              <Button className="p-button" onClick={exportCurrent}>
                先导出当前进度
              </Button>
              <Button className="p-button p-danger" onClick={reset}>
                确认重新开店
              </Button>
            </>
          )}
          {modal === 'finish' && (
            <>
              <p>
                柜台见过的人、你学会的手艺，都留在这间店里。准备好结束本周目了吗？
              </p>
              <Button
                className="p-button p-primary"
                onClick={() => {
                  send({ type: 'finish' });
                  setModal('');
                }}
              >
                确认 · 领取地契结局
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!shop.report.length && !modal && !welcome}
        onOpenChange={(open) => {
          if (!open) send({ type: 'clearReport' });
        }}
      >
        <DialogContent className="p-modal">
          <DialogTitle>
            {shop.ended ? shop.ending : '柜台与打烊手记'}
          </DialogTitle>
          <DialogDescription>
            {shop.ended
              ? '从接下钥匙，到拥有自己的店。'
              : '这一段生意留下的结果。'}
          </DialogDescription>
          <div className="p-report">
            {shop.report.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <Button
            className="p-button p-primary"
            onClick={() => send({ type: 'clearReport' })}
          >
            {shop.ended ? '看看我的店' : '收好手记 · 继续'}
          </Button>
          {shop.ended && (
            <Button className="p-button" onClick={exportCurrent}>
              导出这个结局
            </Button>
          )}
        </DialogContent>
      </Dialog>
      <input
        className="sr-only"
        type="file"
        accept=".json,application/json"
        ref={file}
        onChange={(e) => void importFile(e.target.files?.[0])}
      />
    </main>
  );
}
