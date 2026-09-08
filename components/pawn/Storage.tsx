'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { catalog } from '@/lib/pawn/catalog';
import {
  board,
  dimensions,
  estimate,
  fits,
  pledged,
  repairCost,
  usedSpace,
  value,
} from '@/lib/pawn/inventory';
import type { Zone } from '@/lib/pawn/types';
import type { Controls } from './Counter';

export function Storage({ shop: s, send }: Controls) {
  const [uid, setUid] = useState(0),
    [rotated, setRotated] = useState(false);
  const selected = s.stock.find((g) => g.uid === uid),
    d = selected ? catalog[selected.itemId] : null;
  const rotateSelected = () => {
    if (!selected) return;
    const next = !rotated;
    setRotated(next);
    if (fits(s, { ...selected, rotated: next }))
      send({
        type: 'move',
        uid: selected.uid,
        x: selected.x,
        y: selected.y,
        zone: selected.zone,
        rotated: next,
      });
  };
  const place = (zone: Zone, x: number, y: number, dragUid?: number) => {
    const target = dragUid ? s.stock.find((g) => g.uid === dragUid) : selected;
    if (target)
      send({
        type: 'move',
        uid: target.uid,
        zone,
        x,
        y,
        rotated: dragUid ? target.rotated : rotated,
      });
  };
  const renderBoard = (zone: Zone) => {
    const [w, h] = board(s, zone);
    if (!h) return null;
    return (
      <div className="p-storage-zone" key={zone}>
        <div className="p-zone-title">
          <span>{zone === 'shop' ? '店内货架' : '柜下暗格'}</span>
          <small>
            {usedSpace(s, zone)} / {w * h} 格
          </small>
        </div>
        <div
          className="p-grid"
          style={{
            gridTemplateColumns: `repeat(${w}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${h}, var(--cell))`,
          }}
          aria-label={zone === 'shop' ? '店内空间' : '暗格空间'}
        >
          {Array.from({ length: w * h }, (_, n) => (
            <button
              key={`cell-${n}`}
              className="p-cell"
              aria-label={`${zone === 'shop' ? '店内' : '暗格'}第 ${Math.floor(n / w) + 1} 行第 ${(n % w) + 1} 列${selected ? '，放置选中物品' : ''}`}
              style={{
                gridColumn: (n % w) + 1,
                gridRow: Math.floor(n / w) + 1,
              }}
              onClick={() => place(zone, n % w, Math.floor(n / w))}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                place(
                  zone,
                  n % w,
                  Math.floor(n / w),
                  Number(e.dataTransfer.getData('text/plain')),
                );
              }}
            />
          ))}
          {s.stock
            .filter((g) => g.zone === zone)
            .map((g) => {
              const [gw, gh] = dimensions(g),
                item = catalog[g.itemId],
                loan = pledged(s, g.uid);
              return (
                <button
                  key={g.uid}
                  draggable
                  onDragStart={(e) => {
                    setUid(g.uid);
                    setRotated(g.rotated);
                    e.dataTransfer.setData('text/plain', String(g.uid));
                  }}
                  className={`p-goods ${uid === g.uid ? 'is-selected' : ''} ${loan ? 'is-pledged' : ''} ${item.illegal ? 'is-illegal' : ''}`}
                  style={{
                    gridColumn: `${g.x + 1} / span ${gw}`,
                    gridRow: `${g.y + 1} / span ${gh}`,
                  }}
                  onClick={() => {
                    setUid(g.uid);
                    setRotated(g.rotated);
                  }}
                  aria-label={`${item.name}，${gw}乘${gh}格，${loan ? '抵押保管' : g.listed ? '展示中' : '未上架'}，选择整理`}
                >
                  <span>{item.icon}</span>
                  <strong>{item.name}</strong>
                  <small>{loan ? '典当' : g.listed ? '展示' : '库存'}</small>
                </button>
              );
            })}
        </div>
      </div>
    );
  };
  return (
    <section className="p-storage p-panel">
      <div className="p-section-title">
        <span>货架与仓储</span>
        <small>空间，也是本钱</small>
      </div>
      <div className="p-storage-inner">
        <p className="p-muted">
          点击货物，再点击空格移动。也可拖放；占用格子不能重叠。
        </p>
        {renderBoard('shop')}
        {renderBoard('vault')}
        {!s.upgrades.includes('vault') && (
          <div className="p-locked-note">
            柜下暗格尚未建造 · 禁品暴露在店内会被搜查。
          </div>
        )}
        {selected && d ? (
          <div className="p-selected">
            <div className="p-selected-heading">
              <strong>
                {d.icon} {d.name}
              </strong>
              <span>
                {selected.zone === 'vault'
                  ? '暗格'
                  : selected.listed
                    ? '展示中'
                    : '未上架'}
              </span>
            </div>
            <p>{d.description}</p>
            <div className="p-mini-stats">
              <span>
                成本 <b>{selected.paid} G</b>
              </span>
              <span>
                成色{' '}
                <b>
                  {selected.inspected ? `${selected.condition}%` : '待检查'}
                </b>
              </span>
              <span>
                估值 <b>{estimate(selected)}</b>
              </span>
            </div>
            {pledged(s, uid) ? (
              <p className="p-clue">
                {pledged(s, uid)!.customer}的抵押物，第 {pledged(s, uid)!.due}{' '}
                天到期。可以挪动保管，不能加工或出售。
              </p>
            ) : (
              <>
                {selected.scanned && (
                  <p className="p-clue">
                    {selected.authentic ? '真品' : '仿品'} ·{' '}
                    {selected.cursed ? '有诅咒' : '无诅咒'}
                  </p>
                )}
                <div className="p-actions">
                  <Button
                    className="p-button"
                    disabled={selected.zone !== 'shop'}
                    onClick={() => send({ type: 'list', uid })}
                  >
                    {selected.listed ? '撤下展示' : '摆上货架'}
                  </Button>
                  <Button
                    className="p-button"
                    disabled={selected.inspected || s.energy < 1}
                    onClick={() => send({ type: 'inspectStock', uid })}
                  >
                    外观检查 · 1 精力
                  </Button>
                  {d.repairable && (
                    <Button
                      className="p-button"
                      disabled={
                        !s.skills.repair ||
                        selected.condition >= 100 ||
                        s.energy < 2
                      }
                      onClick={() => send({ type: 'repair', uid })}
                    >
                      修复 · {repairCost(selected, s.skills.repair)} G
                    </Button>
                  )}
                  {d.magical && (
                    <Button
                      className="p-button"
                      disabled={
                        !s.skills.magic || selected.scanned || s.energy < 2
                      }
                      onClick={() => send({ type: 'scanStock', uid })}
                    >
                      鉴魔 · 2 精力
                    </Button>
                  )}
                  {selected.scanned && selected.cursed && (
                    <Button
                      className="p-button"
                      disabled={s.skills.magic < 2 || s.energy < 2}
                      onClick={() => send({ type: 'purify', uid })}
                    >
                      净化 · 25 G
                    </Button>
                  )}
                </div>
              </>
            )}
            <div className="p-actions">
              <Button className="p-button" onClick={rotateSelected}>
                ↻{' '}
                {rotated !== selected.rotated
                  ? '已旋转，点击空格放置'
                  : '旋转物品'}
              </Button>
              <Button className="p-button p-quiet" onClick={() => setUid(0)}>
                取消选择
              </Button>
            </div>
            {!pledged(s, uid) && (
              <Button
                className="p-button p-quiet p-liquidate"
                onClick={() => send({ type: 'liquidate', uid })}
              >
                低价清仓 · 回收 {Math.round(value(selected) * 0.48)} G
              </Button>
            )}
          </div>
        ) : (
          <div className="p-empty-selection">
            <span>◇</span>
            <p>
              选中一件货物
              <br />
              查看、加工或调整摆放
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
