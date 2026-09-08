'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  catalog,
  categoryNames,
  DEBT,
  EXPENSE,
  factionNames,
  intentNames,
  signNames,
  specialties,
  upgrades,
} from '@/lib/pawn/catalog';
import type { Intent, Specialty } from '@/lib/pawn/types';
import type { Controls } from './Counter';

export function Management({ shop: s, send }: Controls) {
  return (
    <div className="p-management">
      <section className="p-panel">
        <div className="p-section-title">
          <span>明天挂哪块招牌</span>
          <small>招牌制作一次，可反复使用</small>
        </div>
        <div className="p-panel-body">
          <p>
            选择你想做的生意。新来客会更偏向这个方向，已约定的赎当照常到访。
          </p>
          <div className="p-sign-options">
            {s.signs.map((sign) => (
              <Button
                key={sign}
                className={`p-button p-sign ${s.sign === sign ? 'is-active' : ''}`}
                onClick={() => send({ type: 'sign', sign, intent: s.intent })}
              >
                {signNames[sign]}
              </Button>
            ))}
          </div>
          <label htmlFor="shop-intent">招揽意图</label>
          <select
            id="shop-intent"
            value={s.intent}
            onChange={(e) =>
              send({
                type: 'sign',
                sign: s.sign,
                intent: e.target.value as Intent,
              })
            }
          >
            {Object.entries(intentNames).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
          <p className="p-clue">
            {s.intent === 'buy'
              ? '更多卖家与典当客，适合货架空、现金多的时候。'
              : s.intent === 'sell'
                ? '更多买家，但货物类别、成色和价格仍要合适。'
                : s.intent === 'service'
                  ? '修复或鉴定招牌会吸引更多服务委托；旧物买卖和黑市仍以买卖为主。'
                  : '卖家、买家和专业委托混合，给意外的好生意留一点位置。'}
          </p>
        </div>
      </section>
      <div className="p-specialty-grid">
        {(Object.keys(specialties) as Specialty[]).map((key) => {
          const d = specialties[key],
            level = s.skills[key],
            cost = level ? d.advanced : d.cost;
          return (
            <article
              className={`p-panel p-specialty p-specialty-${key}`}
              key={key}
            >
              <div className="p-panel-body">
                <div className="p-specialty-number">
                  {key === 'repair'
                    ? '01 / 锻造'
                    : key === 'magic'
                      ? '02 / 魔法'
                      : '03 / 夜市'}
                </div>
                <h2>{d.name}</h2>
                <p>{d.description}</p>
                <div className="p-learning">
                  <span>
                    {level === 0
                      ? '尚未入门'
                      : level === 1
                        ? '已掌握基础'
                        : '已掌握进阶'}
                  </span>
                  <strong>
                    {level ? `${s.sales[key]} 笔业务` : `${cost} G`}
                  </strong>
                </div>
                <Button
                  className="p-button p-primary"
                  disabled={
                    level >= 2 ||
                    s.gold < cost ||
                    (level === 1 && s.sales[key] < 3)
                  }
                  onClick={() => send({ type: 'learn', key })}
                >
                  {level >= 2
                    ? '已完成学习'
                    : `${level ? '学习进阶' : '购买工具并学习'} · ${cost} G`}
                </Button>
                {level === 1 && (
                  <small>
                    完成 3 笔相关业务后可进阶：
                    {key === 'repair'
                      ? '降低维修材料成本'
                      : key === 'magic'
                        ? '解锁诅咒净化'
                        : '提高地下买家的成交上限'}
                    。
                  </small>
                )}
                <Button
                  className="p-button"
                  disabled={!level || s.signs.includes(key) || s.gold < 70}
                  onClick={() => send({ type: 'makeSign', key })}
                >
                  {s.signs.includes(key)
                    ? '已有专用招牌'
                    : `制作「${signNames[key]}」招牌 · 70 G`}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
      <section className="p-panel">
        <div className="p-section-title">
          <span>扩建与防护</span>
          <small>占地与资金，都要算进去</small>
        </div>
        <div className="p-upgrade-list">
          {Object.entries(upgrades).map(([key, d]) => (
            <article key={key}>
              <div>
                <h3>{d.name}</h3>
                <p>{d.description}</p>
              </div>
              <Button
                className="p-button"
                disabled={s.upgrades.includes(key) || s.gold < d.cost}
                onClick={() => send({ type: 'upgrade', key })}
              >
                {s.upgrades.includes(key) ? '已建成' : `${d.cost} G · 建造`}
              </Button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
export function Ledger({
  shop: s,
  send,
  finish,
}: Controls & { finish: () => void }) {
  const [amount, setAmount] = useState('120');
  const outstanding = s.contracts.filter((c) =>
    ['active', 'overdue'].includes(c.status),
  );
  const nextWeek = (Math.floor(s.day / 7) + (s.day % 7 ? 1 : 0)) * 7;
  const due = Math.min(
    s.debt,
    Math.max(0, Math.floor(nextWeek / 7) * 120 - s.paidDebt),
  );
  return (
    <div className="p-management">
      <section className="p-panel p-deed">
        <div className="p-panel-body">
          <small>接手别人的店，把它变成自己的店</small>
          <h2>{s.debt ? '还清余款，拿到地契。' : '这间店，终于属于你。'}</h2>
          <p>
            店铺总余款 {DEBT.toLocaleString()} 金币。日常开支每日 {EXPENSE}{' '}
            金币；每七天至少累计偿还 120 金币，可以提前多还。
          </p>
          <progress
            className="p-loan-progress"
            aria-label="店铺贷款偿还进度"
            max={DEBT}
            value={s.paidDebt}
          />
          <div className="p-debt-numbers">
            <span>已还 {s.paidDebt} G</span>
            <strong>剩余 {s.debt} G</strong>
          </div>
          {s.debt > 0 ? (
            <>
              <p className="p-muted">
                第 {nextWeek} 天打烊前，还需至少还款 {due}{' '}
                G。先为材料与收货留一点现金。
              </p>
              <div className="p-repay">
                <label className="sr-only" htmlFor="repay-amount">
                  还款金额
                </label>
                <input
                  id="repay-amount"
                  type="number"
                  min="1"
                  max={Math.min(s.gold, s.debt)}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Button
                  className="p-button p-primary"
                  onClick={() =>
                    send({ type: 'repay', amount: Number(amount) })
                  }
                >
                  偿还贷款
                </Button>
                <Button
                  className="p-button"
                  onClick={() => setAmount(String(Math.min(s.gold, s.debt)))}
                >
                  填入可还金额
                </Button>
              </div>
            </>
          ) : (
            <>
              <p>
                可以先完成熟客的约定，再为本周目收尾。尚未结清的典当：
                {outstanding.length} 笔。
              </p>
              <Button
                className="p-button p-primary"
                disabled={!!outstanding.length}
                onClick={finish}
              >
                挂起地契 · 结束本周目
              </Button>
            </>
          )}
        </div>
      </section>
      <section className="p-panel">
        <div className="p-section-title">
          <span>典当契约</span>
          <small>{outstanding.length} 笔待结</small>
        </div>
        <div className="p-panel-body">
          {!s.contracts.length && (
            <p className="p-muted">
              还没有签订契约。典当要留出本金和保管空间，到期会有人来赎回。
            </p>
          )}
          {[...s.contracts]
            .reverse()
            .slice(0, 30)
            .map((c) => {
              const g = s.stock.find((x) => x.uid === c.uid);
              return (
                <article className="p-contract" key={c.id}>
                  <div>
                    <strong>
                      {c.customer}
                      {c.story === 'elyn'
                        ? ' · 月见草吊坠'
                        : g
                          ? ` · ${catalog[g.itemId].name}`
                          : ''}
                    </strong>
                    <small>
                      本金 {c.principal} G · 利息 {c.fee} G · 第 {c.due} 天到期
                    </small>
                  </div>
                  <span className={c.status === 'overdue' ? 'p-warning' : ''}>
                    {
                      {
                        active: '保管中',
                        overdue: '待处理',
                        redeemed: '已赎回',
                        forfeited: '已转死当',
                      }[c.status]
                    }
                  </span>
                </article>
              );
            })}
        </div>
      </section>
      <section className="p-panel">
        <div className="p-section-title">
          <span>收支账簿</span>
          <small>累计交易利润 {s.profit} G</small>
        </div>
        <div className="p-table-wrap">
          <table>
            <thead>
              <tr>
                <th>日期</th>
                <th>事项</th>
                <th>收支</th>
              </tr>
            </thead>
            <tbody>
              {s.log.slice(0, 60).map((entry, i) => (
                <tr key={i}>
                  <td>{entry.day} 日</td>
                  <td>{entry.text}</td>
                  <td className={entry.delta >= 0 ? 'p-positive' : ''}>
                    {entry.delta > 0 ? '+' : ''}
                    {entry.delta} G
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
export function Journal({ shop: s }: Pick<Controls, 'shop'>) {
  return (
    <div className="p-management">
      <section className="p-panel">
        <div className="p-section-title">
          <span>小镇里的关系</span>
          <small>信任会带来更重要的生意</small>
        </div>
        <div className="p-reputations">
          {Object.entries(factionNames).map(([key, name]) => {
            const score = s.reputation[key as keyof typeof s.reputation];
            return (
              <article key={key}>
                <h3>{name}</h3>
                <strong>{score}</strong>
                <p>
                  {score < 0
                    ? '关系冷淡'
                    : score < 8
                      ? '初识 · 做成生意以积累信任'
                      : '熟络 · 特殊来访已可出现'}
                </p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="p-panel">
        <div className="p-section-title">
          <span>柜台边的故事</span>
          <small>来自你做过的选择</small>
        </div>
        <div className="p-panel-body p-journal">
          {s.journal.map((j, i) => (
            <article key={i}>
              <small>霜叶月 · 第 {j.day} 天</small>
              <p>{j.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="p-panel">
        <div className="p-section-title">
          <span>见过的货物 · {s.knownItems.length} 种</span>
          <small>随实际见货记录，真伪与诅咒仍需逐件鉴定</small>
        </div>
        <div className="p-catalog">
          {s.knownItems
            .map((id) => catalog[id])
            .map((d) => (
              <article key={d.id}>
                <span>{d.icon}</span>
                <div>
                  <strong>{d.name}</strong>
                  <small>
                    {categoryNames[d.category]} · {d.w}×{d.h} 格
                    {d.illegal ? ' · 禁品' : ''}
                  </small>
                  <p>{d.description}</p>
                </div>
              </article>
            ))}
        </div>
      </section>
    </div>
  );
}
