# Usage Guide — Engineering Architecture Skill

> 面向 `engineering-architecture` / Codex Architecture Governor 的实际使用手册  
> 目标：让 Codex 在已有项目和持续开发中，稳定遵守架构边界，而不是把 Skill 当成一次性“目录生成器”。

---

## 1. 使用原则

这个 Skill 不应该在每一次修改中都重度介入。

推荐理解为：

```text
Skill
= architecture decision process

docs/ARCHITECTURE.md
= 当前项目的 architecture system of record

AGENTS.md
= Codex 每次任务的 routing / execution instruction

lint / tests / scripts / CI
= executable guardrails
```

因此，不同类型的任务应使用不同强度的治理。

---

# 2. 场景一：第一次接管已有项目

这是已有项目最重要的一次使用。

目标不是立即重构，而是：

1. 理解当前 repo 实际形成的架构；
2. 恢复隐含的 architecture intent；
3. 找出 ownership / boundary 问题；
4. 建立治理基线。

推荐显式调用 Skill：

```text
$engineering-architecture

对当前已有项目进行 architecture baseline audit（架构基线审计）。

这是一个已经开发了一段时间的真实项目。当前目标不是套用新的目录模板，也不是立即重构，而是先理解现有架构，并建立后续 Codex 开发可以遵守的治理基线。

请按 Deepen 模式执行。

要求：

1. 先读取并理解：
   - repo tree
   - package.json / workspace config
   - AGENTS.md
   - README / docs
   - 主要 entrypoints
   - routing
   - state management
   - API/data access
   - 核心 feature/module
   - tests
   - lint / build / dependency configuration

2. 识别当前项目实际上已经形成的 architecture，而不是从零设计一套你偏好的 architecture。

3. 输出：
   - System shape
   - 当前 module / feature 划分
   - 每个主要模块的 ownership
   - state ownership
   - data/API ownership
   - dependency direction
   - public / internal boundaries
   - entrypoint responsibilities
   - shared code 当前职责
   - 当前已经形成但没有文档化的 architecture conventions

4. 找出 architecture smells，但区分：
   - 明确 boundary violation
   - ownership 不清
   - maintainability risk
   - 单纯代码较长但职责仍然一致

不要仅根据 LOC 判断是否需要拆分。

5. 特别检查：
   - giant App.tsx / page / route
   - feature-specific logic 是否进入 app/root layer
   - cross-feature internal imports
   - duplicated state ownership
   - server state → local state mirror
   - Effect 是否在弥补错误的数据 ownership
   - shared 是否成为 dumping ground
   - 是否存在 premature abstraction
   - 同一业务概念是否散落多个 owner

6. 对问题按实际 change cost 和 architecture risk 排序。

7. 给出 proposed Architecture Contract 草案，但本轮：
   - 不修改 production code
   - 不进行大规模重构
   - 不安装新的 dependency
   - 不把个人偏好升级成项目规则

最后输出：
A. Current Architecture
B. Ownership Map
C. Boundary Map
D. Architecture Risks
E. Recommended Architecture Contract
F. Recommended Deepen priorities
G. 哪些规则值得未来变成 executable guardrail
```

### 验收重点

这一轮不要看它“说得多专业”。

重点检查：

- 有没有真正读懂现有架构；
- 有没有把现有 project convention 当作事实；
- 有没有因为 Skill 自己喜欢某种结构而重写设计；
- 有没有正确区分 smell 和 violation；
- ownership 判断是否符合项目实际。

---

# 3. 场景二：建立项目级 Architecture Contract

Baseline Audit 通过后，再把结论固化。

```text
$engineering-architecture

基于上一轮 architecture baseline audit，现在正式为当前 repo 建立 architecture governance baseline。

目标不是继续设计 architecture，而是把已经确认的架构决策固化为项目级 contract。

请执行：

1. 创建或完善：

docs/ARCHITECTURE.md

它作为当前项目 architecture system of record。

至少记录：

- System Shape
- Module / Feature Ownership
- Dependency Direction
- Entry Points
- State Ownership
- Data/API Ownership
- Public Module Surfaces
- Internal Boundaries
- Shared-Code Promotion Rules
- Testing Boundaries
- Known Exceptions
- Architecture Decisions
- Current Deepen Priorities

2. 更新根目录 AGENTS.md。

不要复制整份 ARCHITECTURE.md。

只加入简短治理入口，明确：

- non-trivial implementation 必须先读取 docs/ARCHITECTURE.md；
- 涉及 feature/module/state/data-flow/dependency boundary 的修改，应使用 engineering-architecture Skill；
- 尊重 module ownership 和 public surface；
- 禁止静默绕过 architecture contract；
- 如果需求与现有 contract 冲突，应显式说明并有意识地更新 architecture decision；
- trivial change 不需要完整 architecture workflow。

3. 如果 repo 是 monorepo 或存在明确独立 subsystem，
判断是否需要局部 AGENTS.md。
只有真正存在不同 architecture contract 时才添加。

4. 不要仅为了治理而重构 production code。

5. 检查当前已有 lint/test/tooling。
只提出值得机械化的 guardrail。
本轮不要无理由安装一整套新的 architecture tooling。

6. 完成后说明：
- 新增/修改了哪些 governance files；
- Codex 后续应该如何读取它们；
- 哪些 architecture rules 目前仍是 soft contract；
- 哪些未来适合 Harden。
```

推荐最终形成：

```text
project/
├── AGENTS.md
├── docs/
│   └── ARCHITECTURE.md
└── src/
```

---

# 4. 场景三：普通小修改

例如：

```text
把 Save 改成 Apply。
```

或者：

```text
调整按钮间距。
```

通常不要显式调用 Skill。

目标：

- 不制造 architecture ceremony；
- 不让简单任务变复杂；
- 不因为 Skill 存在就开始重构。

如果项目 `AGENTS.md` 已经写好 routing，Codex 应该能自动判断这是 trivial change。

---

# 5. 场景四：实现新 Feature

当需求会引入新的：

- workflow；
- feature；
- state；
- data flow；
- module；
- shared abstraction；

建议显式使用：

```text
$engineering-architecture

按照当前项目 docs/ARCHITECTURE.md 实现消息搜索功能。

先确定：
- feature ownership
- state ownership
- data ownership
- module placement
- public surface

要求：
- 尊重已有 module boundaries；
- 如果现有 architecture 已经可以自然容纳该功能，不要创造新的 abstraction；
- 不要把 feature-specific logic 放进 app/root entrypoint；
- 不要为了“复用”提前提升到 shared；
- 完成实现后执行 architecture conformance review。
```

### 关注点

新 feature 最容易导致：

```text
App.tsx
→ 新 state
→ 新 fetch
→ 新 modal
→ 新 handler
```

所以最重要的是先确定 owner。

---

# 6. 场景五：新增 Shared Abstraction

例如准备创建：

```text
shared/hooks/
shared/services/
shared/components/
```

建议先让 Skill 判断是否真的应该 shared。

```text
$engineering-architecture

评估当前准备新增的 shared abstraction 是否合理。

请检查：

1. 当前是否已经存在至少两个 independent vertical consumer；
2. 它们共享的是稳定 semantic contract，还是只是代码长得相似；
3. promotion 到 shared 是否会隐藏真实业务 ownership；
4. 未来修改它时是否会造成多个 feature 被迫一起变化；
5. 是否更适合保留 duplicated-but-local implementation。

如果 shared contract 证据不足，保持 local。
```

原则：

> duplication 并不总比错误 abstraction 更糟。

---

# 7. 场景六：已有 Giant App.tsx / Page / Route

不要直接说：

```text
把 App.tsx 拆一下。
```

更推荐：

```text
$engineering-architecture

当前 App.tsx 已经明显承担多个职责。

进入 Deepen 模式。

目标不是按文件大小拆分，而是识别 ownership seam。

请：

1. 列出 App.tsx 当前承担的独立 responsibilities；
2. 标记每个 responsibility 的合理 owner；
3. 判断哪些属于：
   - application composition
   - routing
   - feature behavior
   - state ownership
   - remote data
   - UI interaction
   - shared primitive
4. 按 architecture value 排序拆分候选；
5. 选择一个最高价值、最低风险的 coherent vertical slice；
6. 只迁移这一 slice；
7. 保持行为不变；
8. 跑现有 tests/typecheck/build；
9. 做 architecture conformance review。

不要：
- 一次重写整个 App.tsx；
- 仅按 LOC 拆文件；
- 创建大量 passthrough wrapper；
- 创建 speculative shared abstraction。
```

---

# 8. 场景七：Architecture Conformance Review

这是日常最实用的用法之一。

当你怀疑 Codex 又开始“哪里方便写哪里”时：

```text
$engineering-architecture

暂停继续实现。

对当前 uncommitted diff 做 architecture conformance review。

重点检查：

- ownership drift
- entrypoint responsibility growth
- cross-module reach-through
- cross-feature internal imports
- duplicate state ownership
- server-state mirroring
- Effect-as-glue
- shared dumping
- premature abstraction
- public/internal boundary violations

要求：

- 只检查当前 diff 引入或扩大了什么问题；
- 不借机清理无关旧代码；
- 如果发现问题，优先修复当前 change；
- 如果没有架构问题，不要为了使用 Skill 而制造重构。
```

非常适合：

```text
feature 做完
→ commit 前
→ architecture review
```

---

# 9. 场景八：只审计当前 Diff，不改代码

如果你只想看判断：

```text
$engineering-architecture

只审计当前 git diff。

不要修改任何文件。

请判断：

1. 当前 change 是否改变 architecture；
2. 是否引入新的 owner；
3. 是否改变 state/data ownership；
4. 是否引入新的 dependency direction；
5. 是否突破 module public surface；
6. 是否需要更新 docs/ARCHITECTURE.md；
7. 是否只是 local implementation detail。

最后给出：
- PASS
- PASS WITH ARCHITECTURE NOTE
- NEEDS REPAIR

并说明原因。

不要根据文件数量或 LOC 单独决定结果。
```

---

# 10. 场景九：重构一个模块

```text
$engineering-architecture

对当前 chat module 进入 Deepen 模式。

目标：
降低 change cost，同时保持现有外部行为。

请：

1. 读取 docs/ARCHITECTURE.md；
2. 找出 chat module 当前最高价值 architecture seam；
3. 说明当前问题属于：
   - ownership
   - boundary
   - dependency
   - state
   - data access
   - public surface
4. 只选择一个 coherent vertical slice；
5. 给出 before / after ownership；
6. 执行最小重构；
7. 跑现有验证；
8. 检查 architecture contract 是否需要更新。

禁止：
- 顺便重构整个 repo；
- 为统一风格修改无关文件；
- 引入尚无真实需求的抽象层。
```

---

# 11. 场景十：跨 Feature Internal Import

例如出现：

```text
feature-a
→ feature-b/internal/foo
```

先修当前设计：

```text
$engineering-architecture

检查当前 cross-feature internal import。

请判断：

1. dependency direction 是否合理；
2. 当前代码真正 owner 是谁；
3. 是否应该：
   - 暴露一个稳定 public contract；
   - 调整 ownership；
   - 通过 application orchestration；
   - 使用 adapter/event；
   - 保留 exception。

不要为了消除 import 而机械移动文件。
```

如果重复发生，再进入 Harden。

---

# 12. 场景十一：Harden — 把规则变成 Guardrail

当同一种违规重复出现时：

```text
$engineering-architecture

当前 repo 已经重复发生 cross-feature internal import。

进入 Harden 模式。

基于 docs/ARCHITECTURE.md 当前 module boundaries，
选择最小、最适合现有 toolchain 的 executable guardrail。

目标：
feature 之间只能访问明确 public surface，
禁止直接访问其他 feature 的 internal implementation。

要求：

- 优先复用已有 ESLint/tooling；
- 不引入大型 architecture framework；
- 给现有合法 exception 明确处理方式；
- 加验证 fixture；
- 在 CI/build workflow 中选择合适执行点；
- 确保错误信息能够告诉 Codex 如何修复，而不只是报错。
```

推荐 enforcement ladder：

```text
document
↓
warning
↓
static check
↓
test
↓
CI gate
```

---

# 13. 场景十二：怀疑 State Ownership 出问题

例如：

- query data 同时 copy 到 local state；
- parent、child、store 各有一份；
- Effect 不断同步 state。

```text
$engineering-architecture

审计当前 workflow 的 state ownership。

请为每一份可变状态标记：

- semantic meaning
- canonical owner
- consumers
- persistence scope
- remote/local/URL/derived classification

重点检查：

- duplicate source of truth
- query → local mirror
- parent/child duplicated state
- store ↔ component synchronization
- Effect-based synchronization

目标：
为每个 state 建立单一 canonical owner。

不要为了统一状态而自动提升到 global store。
```

---

# 14. 场景十三：Effect 越来越多

```text
$engineering-architecture

检查当前新增或已有 Effects。

请把每个 Effect 分类为：

A. 真正 external synchronization
B. event handling 可以替代
C. render-time derivation 可以替代
D. duplicated state ownership 导致
E. unclear ownership / architecture smell

只保留真正需要 Effect 的同步。

不要仅为了减少 Effect 数量而移动逻辑。
```

---

# 15. 场景十四：Shared 目录变成垃圾场

```text
$engineering-architecture

审计当前 shared 目录。

对主要内容判断：

- 真正 cross-feature stable contract
- 应回归具体 feature owner
- accidental duplication
- infrastructure/shared primitive
- unclear owner

目标：
让 shared 表示稳定共享语义，而不是“暂时不知道放哪”。

不要进行大规模文件搬家。
先提出 ranked opportunities，再选择一个高价值 slice。
```

---

# 16. 场景十五：Monorepo

对于：

```text
apps/
packages/
services/
```

不要默认整个 repo 一个 Architecture Contract 就够。

建议：

```text
$engineering-architecture

这是一个 monorepo。

请先识别：

- workspace/package boundaries
- app-level ownership
- service-level ownership
- shared package ownership
- cross-package dependency direction
- package public surfaces

判断：

1. 根 docs/ARCHITECTURE.md 应记录哪些 system-level contract；
2. 哪些 subsystem 需要自己的 architecture doc；
3. 哪些目录需要局部 AGENTS.md；
4. 哪些规则应该由 workspace tooling 执行。

不要复制相同规则到所有 package。
```

推荐：

```text
/AGENTS.md
/docs/ARCHITECTURE.md

/apps/web/AGENTS.md
/apps/web/docs/ARCHITECTURE.md   # 仅在确实需要时

/services/core/AGENTS.md
```

---

# 17. 场景十六：已有架构很好，只是新增功能

Skill 的一个重要能力是 **知道什么时候不要重构**。

```text
$engineering-architecture

先检查当前 architecture 是否已经自然支持这个需求。

如果：
- ownership 清晰；
- dependency direction 合理；
- module boundary 已存在；
- state/data owner 明确；

则直接沿用现有 architecture。

不要因为调用了 architecture Skill 就创建新的 layer、module 或 abstraction。
```

---

# 18. 场景十七：防止过度架构

如果 Codex 开始：

```text
service
repository
adapter
factory
manager
controller
```

但项目其实很小：

```text
$engineering-architecture

重新评估当前方案是否 overengineered。

请逐层回答：

- 这个 abstraction 当前有几个真实 consumer？
- 是否拥有独立 contract？
- 是否存在独立 change reason？
- 是否减少 coupling？
- 是否只是转发调用？
- 删除这一层是否会损失真实 architecture boundary？

删除没有真实 ownership 或 contract 的 abstraction。

目标是 maintainability，不是 layer count。
```

---

# 19. 场景十八：架构变更本身是合理的

Architecture Contract 不是不可修改的法律。

如果新需求真的改变系统形态：

```text
$engineering-architecture

当前需求可能要求改变现有 architecture contract。

请：

1. 先说明现有 contract 与新需求的冲突；
2. 判断这是：
   - implementation inconvenience
   - 还是 architecture assumptions 已经失效；
3. 如果只是 implementation inconvenience，遵守现有 contract；
4. 如果 architecture 确实需要演化：
   - 提出新的 decision
   - 列出 impact
   - 更新 docs/ARCHITECTURE.md
   - 再实施代码修改

不要静默绕过旧 contract。
```

---

# 20. 场景十九：Commit / PR 前最终检查

```text
$engineering-architecture

对本次 change 做最终 architecture review。

范围仅限本次 change。

检查：

- ownership
- module boundaries
- public/internal imports
- dependency direction
- state ownership
- data ownership
- entrypoint responsibilities
- shared promotion
- architecture contract drift
- guardrail results

如果 architecture 没有改变，不要更新 ARCHITECTURE.md。

最后输出：
- Architecture impact
- Violations
- Repairs performed
- Contract updates
- Guardrail results
```

---

# 21. 建议的 AGENTS.md 路由规则

项目治理初始化后，可在根 `AGENTS.md` 中加入：

```md
## Architecture governance

The repository architecture is documented in `docs/ARCHITECTURE.md`.

For non-trivial changes involving feature/module boundaries, state ownership,
data flow, dependency direction, new shared abstractions, or structural
refactoring, use the `engineering-architecture` skill before implementation.

Respect existing module ownership and public surfaces.

Do not silently bypass the architecture contract to make a local change easier.
If a requirement genuinely conflicts with the current architecture, make the
conflict explicit and update the architecture decision intentionally.

Trivial copy, styling, rename, and isolated mechanical changes do not require
the architecture workflow.
```

不要把整个 Skill 内容复制进 `AGENTS.md`。

---

# 22. 推荐长期工作流

最终日常工作流应接近：

```text
用户需求
   ↓
AGENTS.md 判断是否涉及 architecture
   ↓
trivial?
   ├─ yes → 直接实现
   │
   └─ no
       ↓
engineering-architecture
       ↓
读取 ARCHITECTURE.md
       ↓
确定 owner / boundary
       ↓
实现
       ↓
conformance review
       ↓
现有测试 / typecheck / build
       ↓
重复违规？
       ├─ no → 完成
       └─ yes → Harden
```

---

# 23. 已有多个项目时的推荐迁移策略

不要一次性对所有项目做全量重构。

推荐：

### 第一步

对每个重要项目只做：

```text
Baseline Audit
+
Architecture Contract
+
AGENTS.md routing
```

不改 production architecture。

### 第二步

继续正常开发。

### 第三步

只有真实开发碰到 architecture pain 时：

```text
Deepen one seam
```

### 第四步

同一种错误反复出现：

```text
Harden
```

这样不会因为“开始治理”而制造大规模无价值重构。

---

# 24. 判断 Skill 是否真的有效

不要用“生成了多少文件”判断。

真正应该观察：

```text
坏项目
→ 会主动收紧结构

好项目
→ 基本不动架构

小修改
→ 不多管闲事

新 feature
→ 先找到 owner 再写

重复违规
→ 才升级 guardrail
```

如果这五点稳定成立，这个 Skill 才真正起到了 Architecture Governor 的作用。

---

# 25. 最小使用口诀

如果只记住几句话：

```text
已有项目：
先 Audit，不先重构。

项目治理：
Skill 决策，
ARCHITECTURE.md 记答案，
AGENTS.md 做路由，
Guardrails 做硬约束。

新功能：
先找 owner，再写代码。

重构：
一次只修一个高价值 seam。

重复违规：
不要继续加 prompt，
升级成 executable guardrail。

简单修改：
不要过度架构。
```
