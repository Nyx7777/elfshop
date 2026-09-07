# elfshop · 暮灯当铺 · 勇者归来之后

异世界当铺（elfshop）经营网页游戏，以魔王讨伐八十年后的原创小镇为背景。参考《深空当铺：可能是偷的》官方介绍中的鉴定、议价、生产、违禁品与房租经营循环；不是原作 Demo 的逐项复刻。
参考来源：https://store.steampowered.com/app/4348910?l=schinese

## 游玩

七日、21 次来访；鉴定、魔力感知、报价、采购、加工、零售、批发、藏匿、巡查、拟态魔族识别、派系声望与多结局。所有游戏状态仅存在当前浏览器 localStorage，支持 JSON 存档导入导出，不依赖外部模型或 API。网页右上角「?」查看完整规则。

第一天可以保留艾琳的吊坠，最后一天归还。第 3、4、6 天先巡查、再卖货、最后扣租金。第七天付租后够 1000 金币会自动买下店铺。当前内容固定为七日篇章。

## 开发与验证

- `npm install`
- `npm run dev`（Node 22.13+）
- `npm run build`
- `npx tsc --noEmit`
- `node --experimental-strip-types --test tests/game.test.mjs`（Node 24）

游戏规则集中于 `lib/game.ts`，界面在 `app/page.tsx`。包含 11 组规则测试，覆盖完整七日通关、破产、资金约束、巡查、生产、魔族识别、回忆归还与存档验证。

未执行浏览器视觉或交互测试。WebMCP 使用功能检测暴露只读状态及物品鉴定；当前无支持的验证上下文，因此不声称验证了其浏览器协议契约。

## 原创画面

通过内置 imagegen 生成，每张生成一次。

- `public/shop-scene.png`：1536×1024 奇幻当铺，黄昏金色光线、木质柜台、药瓶书架；右侧银发成年精灵、墨绿披风与象牙白内衣，温柔怅惘；左侧较暗供界面覆盖，无字、无界面、无水印。
- `public/portraits.png`：1536×1024、3×2 等分人物立绘；上排矮人铁匠、黑发女盗贼、金发王国骑士；下排采药少女（成年人）、拟态魔族男子、戴眼镜的成年学徒。深绿色背景、暖琥珀光、手绘奇幻动画风，无字无格线。

原图由生成工具产出后复制进项目；人物网格由 CSS background-position 显示，无远程美术依赖。

## GitHub Pages

仓库：https://github.com/Nyx7777/elfshop

GitHub Pages 采用独立的纯静态构建入口，复用同一套界面和游戏规则，无需服务器或 API：

- `npm run build:pages`：生成 `dist-pages/`，基础路径为 `/elfshop/`。
- `npm run preview:pages`：本地预览静态产物。
- `.github/workflows/pages.yml`：推送到 `main` 后，自动运行规则测试、类型检查、静态构建和 Pages 部署。
- 仓库 Settings → Pages 的发布来源需设为 GitHub Actions。
- 默认目标地址为 `https://nyx7777.github.io/elfshop/`，以 GitHub 实际部署成功结果为准。

原 Sites 构建仍使用 `npm run build`。不同域名的浏览器存档相互独立；迁移旧进度请先从旧站导出存档，再到新站导入。
