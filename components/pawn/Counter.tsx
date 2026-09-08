'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { assetUrl } from '@/lib/assets';
import { catalog, categoryNames, factionNames } from '@/lib/pawn/catalog';
import { current } from '@/lib/pawn/engine';
import { estimate, pledged, value } from '@/lib/pawn/inventory';
import type { Action, Goods, Shop } from '@/lib/pawn/types';

export type Controls = { shop: Shop; send: (a: Action) => void };
function priceSuggestion(g: Goods, night = false) {
  const known = g.scanned || (!catalog[g.itemId].magical && g.inspected);
  return Math.round(
    (known ? value(g) : catalog[g.itemId].value) * (night ? 1.2 : 0.95),
  );
}
export function Counter({ shop: s, send }: Controls) {
  const v = current(s);
  const [offer, setOffer] = useState(v ? String(v.ask) : ''),
    [selected, setSelected] = useState<number>(0),
    [sale, setSale] = useState('');
  const available = s.stock.filter(
    (g) => g.listed && g.zone === 'shop' && !pledged(s, g.uid),
  );
  const g = v?.goods,
    d = g ? catalog[g.itemId] : null;
  const contract = s.contracts.find((c) => c.id === v?.contractId);
  return (
    <section className="p-counter p-panel">
      <div className="p-section-title">
        <span>柜台</span>
        <small>
          {s.cursor < s.visits.length
            ? `${s.cursor + 1} / ${s.visits.length} 位来客`
            : '今日接待完毕'}
        </small>
      </div>
      <div
        className="p-scene"
        style={{ backgroundImage: `url(${assetUrl('shop-scene.png')})` }}
      >
        {v && v.portrait >= 0 && (
          <div
            className="p-person"
            aria-hidden="true"
            style={{
              backgroundImage: `url(${assetUrl('portraits.png')})`,
              backgroundPosition: `${(v.portrait % 3) * 50}% ${Math.floor(v.portrait / 3) * 100}%`,
            }}
          />
        )}
        <div className="p-scene-shade" />
        <div className="p-person-title">
          <small>
            {v ? `${factionNames[v.faction]} · ${v.role}` : '橡木镇 · 南街七号'}
          </small>
          <h2>{v?.name || '门铃安静了'}</h2>
        </div>
      </div>
      {!v ? (
        <div className="p-counter-content">
          <p>
            今天的生意已经做完。整理库存、安排明天的招牌，或拿一部分收入偿还贷款。
          </p>
          <Button
            className="p-button p-primary"
            onClick={() => send({ type: 'endDay' })}
          >
            打烊 · 支付今日开支
          </Button>
        </div>
      ) : (
        <div className="p-counter-content">
          <div className="p-visitor-kind">
            <span>
              {
                {
                  seller: '卖货',
                  buyer: '买货',
                  pawn: '典当',
                  service: '委托',
                  redeem: '赎当',
                }[v.kind]
              }
            </span>
            <small>
              谈价余地 {'●'.repeat(v.patience)}
              {'○'.repeat(3 - v.patience)}
            </small>
          </div>
          <p className="p-dialogue">“{v.line}”</p>
          {g && d && (
            <div className="p-counter-item">
              <span className="p-item-symbol">{d.icon}</span>
              <div>
                <strong>{d.name}</strong>
                <p>{d.description}</p>
                <small>
                  {d.w}×{d.h} 格 ·{' '}
                  {g.inspected ? `成色 ${g.condition}%` : '成色待查'} ·{' '}
                  {estimate(g)}
                </small>
              </div>
            </div>
          )}
          {!v.resolved && (
            <>
              <div className="p-actions">
                {g && (
                  <Button
                    className="p-button"
                    disabled={g.inspected || s.energy < 1}
                    onClick={() => send({ type: 'inspect' })}
                  >
                    {g.inspected ? '已检查外观' : '检查外观 · 1 精力'}
                  </Button>
                )}
                {g && d?.magical && (
                  <Button
                    className="p-button"
                    disabled={g.scanned || !s.skills.magic || s.energy < 2}
                    onClick={() => send({ type: 'scan' })}
                  >
                    {g.scanned
                      ? '已鉴魔'
                      : s.skills.magic
                        ? '鉴魔 · 2 精力'
                        : '鉴魔 · 需学习'}
                  </Button>
                )}
                <Button
                  className="p-button"
                  disabled={v.observed || s.energy < 1}
                  onClick={() => send({ type: 'observe' })}
                >
                  {v.observed ? '已观察来客' : '观察 · 1 精力'}
                </Button>
              </div>
              {g?.scanned && (
                <p className="p-clue">
                  {g.authentic ? '魔力真实' : '幻术仿品'} ·{' '}
                  {g.cursed ? '有诅咒' : '无诅咒'}
                </p>
              )}
              {g?.inspected && !d?.magical && (
                <p className="p-clue">材质：{g.authentic ? '真实' : '仿品'}</p>
              )}
              {v.observed && <p className="p-clue">{v.clue}</p>}
              {s.upgrades.includes('bell') && v.thief && (
                <p className="p-warning">货架警铃轻响，有人在靠近展示区。</p>
              )}
              {(v.kind === 'seller' || v.kind === 'pawn') && (
                <div className="p-deal">
                  <label htmlFor="counter-offer">
                    {v.kind === 'pawn' ? '放款金额 · 利息 20%' : '我的收购价'}
                  </label>
                  <div className="p-price-input">
                    <input
                      id="counter-offer"
                      type="number"
                      min="1"
                      max={s.gold}
                      value={offer}
                      onChange={(e) => setOffer(e.target.value)}
                    />
                    <span>金币</span>
                  </div>
                  <Button
                    className="p-button p-primary"
                    onClick={() =>
                      send({ type: 'offer', amount: Number(offer) })
                    }
                  >
                    {v.kind === 'pawn'
                      ? `签约放款 · ${v.story === 'elyn' ? '5' : '3'} 天后赎回`
                      : '报价收购'}
                  </Button>
                </div>
              )}
              {v.kind === 'buyer' && (
                <div className="p-deal">
                  <p className="p-muted">
                    找：{categoryNames[v.category]} · 成色至少 {v.minCondition}%
                    · 预算 {v.budget} G
                  </p>
                  <label htmlFor="buyer-goods">从展示货架推荐</label>
                  <select
                    id="buyer-goods"
                    value={selected || ''}
                    onChange={(e) => {
                      const uid = Number(e.target.value);
                      setSelected(uid);
                      const goods = available.find((x) => x.uid === uid);
                      setSale(
                        goods
                          ? String(
                              priceSuggestion(goods, v.faction === 'night'),
                            )
                          : '',
                      );
                    }}
                  >
                    <option value="">选择一件货物</option>
                    {available.map((x) => (
                      <option key={x.uid} value={x.uid}>
                        {catalog[x.itemId].name} · {estimate(x)}
                      </option>
                    ))}
                  </select>
                  {!available.length && (
                    <p className="p-warning">
                      没有展示中的货物。可以在右侧仓储选中自有货物后上架。
                    </p>
                  )}
                  <label htmlFor="buyer-price">我的售价</label>
                  <div className="p-price-input">
                    <input
                      id="buyer-price"
                      type="number"
                      min="1"
                      value={sale}
                      onChange={(e) => setSale(e.target.value)}
                    />
                    <span>金币</span>
                  </div>
                  <Button
                    className="p-button p-primary"
                    disabled={!selected}
                    onClick={() =>
                      send({
                        type: 'sell',
                        uid: selected,
                        amount: Number(sale),
                      })
                    }
                  >
                    拿给客人 · 报价出售
                  </Button>
                </div>
              )}
              {v.kind === 'service' && (
                <div className="p-deal">
                  <p className="p-muted">
                    当场完成，客人带走物品。
                    {v.service === 'repair'
                      ? '材料按损坏程度计费'
                      : '耗材 8 金币'}
                    ，消耗 2 精力。
                  </p>
                  <Button
                    className="p-button p-primary"
                    disabled={
                      !s.skills[v.service!] ||
                      s.energy < (v.service === 'magic' && g?.scanned ? 0 : 2)
                    }
                    onClick={() => send({ type: 'service' })}
                  >
                    {v.service === 'repair' ? '修复并交付' : '鉴定并交付'} ·
                    收取 {v.ask} G
                  </Button>
                </div>
              )}
              {v.kind === 'redeem' && contract && (
                <div className="p-deal">
                  <p>
                    本金 {contract.principal} G ＋ 利息 {contract.fee} G · 第{' '}
                    {contract.due} 天到期
                  </p>
                  {contract.reliable ? (
                    <Button
                      className="p-button p-primary"
                      onClick={() => send({ type: 'redeem' })}
                    >
                      收钱 · 归还抵押物
                    </Button>
                  ) : (
                    <div className="p-actions">
                      <Button
                        className="p-button p-primary"
                        onClick={() => send({ type: 'extend' })}
                      >
                        宽限一天 · 不加息
                      </Button>
                      <Button
                        className="p-button p-danger"
                        onClick={() => send({ type: 'forfeit' })}
                      >
                        依约转死当
                      </Button>
                    </div>
                  )}
                </div>
              )}
              <div className="p-actions p-secondary">
                <Button
                  className="p-button p-quiet"
                  onClick={() => send({ type: 'refuse' })}
                >
                  {v.kind === 'redeem' ? '明天再处理' : '婉拒这笔生意'}
                </Button>
                {v.observed && (
                  <Button
                    className="p-button p-quiet"
                    onClick={() => send({ type: 'guard' })}
                  >
                    请离货架 · 结束接待
                  </Button>
                )}
              </div>
            </>
          )}
          {v.resolved && (
            <div className="p-resolved">
              <span>本次接待已结束</span>
              <Button
                className="p-button p-primary"
                onClick={() => send({ type: 'next' })}
              >
                {s.cursor + 1 < s.visits.length
                  ? '迎接下一位 →'
                  : '送客 · 整理店铺 →'}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
