# 素材来源

本游戏采用 GitHub / 开源社区广泛使用的组合方案（参考 [Bunbun](https://github.com/BRousserie/Bunbun) 等 STS 克隆项目）：

| 素材 | 作者 | 许可 | 来源 |
|------|------|------|------|
| **game-icons.net** | Lorc, Delapouite 等 | [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/) | https://github.com/game-icons/icons |
| Board Game Icons | Kenney | CC0 1.0 | https://kenney.nl/assets/board-game-icons |
| Particle Pack | Kenney | CC0 1.0 | https://kenney.nl/assets/particle-pack |
| Micro Roguelike *(可选)* | Kenney | CC0 1.0 | https://kenney.nl/assets/micro-roguelike |

## 归属说明 (CC-BY)

卡牌 / 英雄 / 敌人插画使用 [game-icons.net](https://game-icons.net) 图标风格。完整矢量文件可通过：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/download-github-assets.ps1
```

建议在关于/设置页注明：**Icons by Lorc & Delapouite — game-icons.net**

Kenney 素材为 CC0，无需署名（感谢 Kenney 即可）。

## 技术栈

- 纯 HTML / CSS / ES Modules，无构建步骤
- game-icons 内置 SVG + 可选 GitHub 完整库 / jsDelivr CDN 回退
- Kenney 图标仅用于 HUD / 牌堆 / VFX
- Web Audio API + Canvas 2D 环境粒子
