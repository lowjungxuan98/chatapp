# user-relations - 产品需求规格

## 概述

本规格定义了 Chat App 的好友功能（用户关系模块）的最小可行产品（MVP）范围。该模块允许用户发送好友请求、管理好友列表、处理待处理请求、删除好友、拉黑用户，以及基础的用户搜索功能。

## 功能范围

### 包含功能（MVP）

1. **好友请求管理**
   - 发送好友请求（按邮箱或用户名）
   - 撤回已发送的好友请求
   - 接受好友请求
   - 拒绝好友请求

2. **好友列表**
   - 查看已添加的好友列表
   - 显示好友在线状态（只读）
   - 分页加载好友列表

3. **待处理请求列表**
   - 查看收到的好友请求
   - 查看已发送的好友请求
   - 显示请求发送时间

4. **好友管理**
   - 删除好友
   - 拉黑用户
   - 取消拉黑用户

5. **用户搜索**
   - 按邮箱精确搜索用户
   - 按昵称模糊搜索用户
   - 显示搜索结果的基本信息（头像、昵称、在线状态）

6. **在线状态展示**
   - 显示好友的在线/离线状态（只读）
   - 状态数据从 Redis 缓存读取

### 明确排除功能（非目标）

- ❌ 好友推荐和社交图谱分析
- ❌ 好友分组和标签管理
- ❌ 通过手机号导入好友
- ❌ 双向屏蔽同步到聊天功能
- ❌ 推送通知（短信/邮件/APP 推送）
- ❌ 好友备注和自定义昵称
- ❌ 好友动态和状态更新

## 用户故事与验收标准

### US-1: 发送好友请求

**作为** 登录用户  
**我想要** 向其他用户发送好友请求  
**以便** 建立好友关系进行聊天

#### 验收标准

**AC-1.1: 成功发送好友请求**
```gherkin
Given 我已登录系统
  And 我在联系人搜索页面
  And 目标用户 "alice@example.com" 存在且未是我的好友
When 我搜索并选择 "alice@example.com"
  And 我点击"添加好友"按钮
Then 系统应显示"请求已发送"提示
  And 该请求应出现在我的"已发送请求"列表中
  And 对方应在"待处理请求"列表中看到我的请求
  And 实时事件 "friend:request" 应推送给对方
```

**AC-1.2: 重复发送请求失败**
```gherkin
Given 我已向用户 "alice@example.com" 发送过好友请求
  And 该请求状态为 PENDING
When 我再次尝试向 "alice@example.com" 发送请求
Then 系统应返回错误 "好友请求已存在"
  And 不应创建新的请求记录
```

**AC-1.3: 向已是好友的用户发送请求失败**
```gherkin
Given 用户 "bob@example.com" 已经是我的好友
When 我尝试向 "bob@example.com" 发送好友请求
Then 系统应返回错误 "该用户已是你的好友"
  And 不应创建请求记录
```

**AC-1.4: 速率限制保护**
```gherkin
Given 我已登录系统
  And 我在 1 分钟内发送了 10 个好友请求
When 我尝试发送第 11 个好友请求
Then 系统应返回错误 "请求过于频繁，请稍后再试"
  And 响应状态码应为 429
```

---

### US-2: 撤回好友请求

**作为** 登录用户  
**我想要** 撤回已发送但未被接受的好友请求  
**以便** 取消错误发送的请求

#### 验收标准

**AC-2.1: 成功撤回请求**
```gherkin
Given 我已向用户 "alice@example.com" 发送好友请求
  And 该请求状态为 PENDING
When 我在"已发送请求"列表中点击"撤回"按钮
Then 系统应显示"请求已撤回"提示
  And 该请求应从我的"已发送请求"列表中消失
  And 该请求应从对方的"待处理请求"列表中消失
  And 数据库记录应被删除或标记为已撤回
```

**AC-2.2: 无法撤回已接受的请求**
```gherkin
Given 我向用户 "alice@example.com" 发送的请求已被接受
When 我尝试撤回该请求
Then 系统应返回错误 "无法撤回已接受的请求"
  And 好友关系不应受影响
```

---

### US-3: 接受好友请求

**作为** 登录用户  
**我想要** 接受收到的好友请求  
**以便** 与请求发送者建立好友关系

#### 验收标准

**AC-3.1: 成功接受请求**
```gherkin
Given 用户 "bob@example.com" 向我发送了好友请求
  And 该请求状态为 PENDING
When 我在"待处理请求"列表中点击"接受"按钮
Then 系统应显示"已添加为好友"提示
  And 该请求应从"待处理请求"列表中消失
  And "bob@example.com" 应出现在我的好友列表中
  And 我应出现在 "bob@example.com" 的好友列表中
  And 实时事件 "friend:accepted" 应推送给双方
  And 请求状态应更新为 ACCEPTED
```

**AC-3.2: 接受不存在的请求失败**
```gherkin
Given 我没有收到任何好友请求
When 我尝试接受一个不存在的请求 ID
Then 系统应返回错误 "请求不存在"
  And 响应状态码应为 404
```

---

### US-4: 拒绝好友请求

**作为** 登录用户  
**我想要** 拒绝收到的好友请求  
**以便** 不与不想添加的用户建立好友关系

#### 验收标准

**AC-4.1: 成功拒绝请求**
```gherkin
Given 用户 "charlie@example.com" 向我发送了好友请求
  And 该请求状态为 PENDING
When 我在"待处理请求"列表中点击"拒绝"按钮
Then 系统应显示"已拒绝请求"提示
  And 该请求应从"待处理请求"列表中消失
  And 请求记录应被删除或标记为已拒绝
  And 实时事件 "friend:declined" 应推送给请求发送者
```

---

### US-5: 查看好友列表

**作为** 登录用户  
**我想要** 查看我的好友列表  
**以便** 了解我的好友和他们的在线状态

#### 验收标准

**AC-5.1: 成功加载好友列表**
```gherkin
Given 我已登录系统
  And 我有 25 个好友
When 我访问联系人页面
Then 系统应显示前 20 个好友（默认分页）
  And 每个好友应显示：头像、昵称、在线状态
  And 在线状态应实时从 Redis 读取
  And 列表应按好友添加时间倒序排列
```

**AC-5.2: 分页加载好友**
```gherkin
Given 我有 50 个好友
  And 我已加载第一页（20 个好友）
When 我滚动到列表底部触发下一页加载
Then 系统应加载接下来的 20 个好友
  And 不应重复显示已加载的好友
```

**AC-5.3: 空列表状态**
```gherkin
Given 我没有任何好友
When 我访问联系人页面
Then 系统应显示"暂无好友"空状态提示
  And 应显示"搜索用户添加好友"引导按钮
```

---

### US-6: 查看待处理请求列表

**作为** 登录用户  
**我想要** 查看收到和发出的好友请求  
**以便** 处理待处理的请求

#### 验收标准

**AC-6.1: 查看收到的请求**
```gherkin
Given 我收到 5 个好友请求
When 我访问"待处理请求"标签
Then 系统应显示 5 个请求
  And 每个请求应显示：发送者头像、昵称、发送时间
  And 应提供"接受"和"拒绝"按钮
  And 列表应按请求时间倒序排列
```

**AC-6.2: 查看已发送的请求**
```gherkin
Given 我发送了 3 个待处理的好友请求
When 我访问"已发送请求"标签
Then 系统应显示 3 个请求
  And 每个请求应显示：接收者头像、昵称、发送时间
  And 应提供"撤回"按钮
```

---

### US-7: 删除好友

**作为** 登录用户  
**我想要** 删除已添加的好友  
**以便** 解除好友关系

#### 验收标准

**AC-7.1: 成功删除好友**
```gherkin
Given 用户 "alice@example.com" 是我的好友
When 我在好友列表中点击 "alice@example.com" 的"删除好友"按钮
  And 我在确认对话框中点击"确认"
Then 系统应显示"已删除好友"提示
  And "alice@example.com" 应从我的好友列表中消失
  And 我应从 "alice@example.com" 的好友列表中消失
  And 实时事件 "friend:removed" 应推送给双方
  And 数据库中的好友关系记录应被删除
```

**AC-7.2: 删除操作幂等性**
```gherkin
Given 用户 "alice@example.com" 曾是我的好友
  And 我已删除该好友
When 我再次尝试删除同一个好友 ID
Then 系统应返回错误 "好友关系不存在"
  And 响应状态码应为 404
```

---

### US-8: 拉黑用户

**作为** 登录用户  
**我想要** 拉黑某个用户  
**以便** 阻止该用户向我发送好友请求

#### 验收标准

**AC-8.1: 成功拉黑用户**
```gherkin
Given 用户 "spammer@example.com" 存在
  And 该用户未在我的黑名单中
When 我搜索并选择 "spammer@example.com"
  And 我点击"拉黑"按钮
Then 系统应显示"已拉黑用户"提示
  And 该用户应出现在我的黑名单中
  And 如果该用户是我的好友，好友关系应被解除
  And 实时事件 "friend:block" 应推送给对方
```

**AC-8.2: 拉黑后阻止接收请求**
```gherkin
Given 用户 "spammer@example.com" 在我的黑名单中
When "spammer@example.com" 尝试向我发送好友请求
Then 系统应返回错误 "无法发送好友请求"
  And 不应创建请求记录
```

**AC-8.3: 拉黑后阻止发送请求**
```gherkin
Given 我已拉黑用户 "spammer@example.com"
When 我尝试向 "spammer@example.com" 发送好友请求
Then 系统应返回错误 "无法向该用户发送请求"
  And 不应创建请求记录
```

---

### US-9: 取消拉黑用户

**作为** 登录用户  
**我想要** 取消拉黑某个用户  
**以便** 恢复与该用户的正常交互

#### 验收标准

**AC-9.1: 成功取消拉黑**
```gherkin
Given 用户 "spammer@example.com" 在我的黑名单中
When 我在黑名单中点击 "spammer@example.com" 的"取消拉黑"按钮
Then 系统应显示"已取消拉黑"提示
  And 该用户应从我的黑名单中消失
  And 该用户可以再次向我发送好友请求
```

---

### US-10: 搜索用户

**作为** 登录用户  
**我想要** 搜索其他用户  
**以便** 找到想要添加的好友

#### 验收标准

**AC-10.1: 按邮箱精确搜索**
```gherkin
Given 用户 "alice@example.com" 存在于系统中
When 我在搜索框输入 "alice@example.com"
  And 我点击"搜索"按钮
Then 系统应返回用户 "alice@example.com" 的信息
  And 应显示：头像、昵称、在线状态
  And 如果该用户不是我的好友，应显示"添加好友"按钮
  And 如果该用户已是好友，应显示"已是好友"状态
```

**AC-10.2: 按昵称模糊搜索**
```gherkin
Given 系统中有用户 "Alice Smith" 和 "Alice Johnson"
When 我在搜索框输入 "Alice"
  And 我点击"搜索"按钮
Then 系统应返回所有昵称包含 "Alice" 的用户
  And 结果应按相关性排序
  And 最多返回 10 个结果
```

**AC-10.3: 搜索不存在的用户**
```gherkin
Given 系统中不存在用户 "nonexistent@example.com"
When 我搜索 "nonexistent@example.com"
Then 系统应显示"未找到用户"提示
  And 不应显示任何搜索结果
```

**AC-10.4: 搜索速率限制**
```gherkin
Given 我已登录系统
  And 我在 10 秒内执行了 5 次搜索
When 我尝试执行第 6 次搜索
Then 系统应返回错误 "搜索过于频繁，请稍后再试"
  And 响应状态码应为 429
```

---

### US-11: 查看在线状态

**作为** 登录用户  
**我想要** 看到好友的在线状态  
**以便** 知道哪些好友当前在线

#### 验收标准

**AC-11.1: 显示在线状态**
```gherkin
Given 我有 10 个好友
  And 其中 3 个好友当前在线
When 我查看好友列表
Then 在线好友应显示绿色"在线"标识
  And 离线好友应显示灰色"离线"标识
  And 状态数据应从 Redis 缓存读取
```

**AC-11.2: 实时状态更新**
```gherkin
Given 我的好友 "alice@example.com" 当前离线
  And 我正在查看好友列表
When "alice@example.com" 上线
Then 该好友的状态应自动更新为"在线"
  And 不需要刷新页面
```

---

## 非功能需求

### NFR-1: 性能要求

- **API 响应时间**: 
  - 好友列表加载: P95 < 300ms
  - 发送/接受请求: P95 < 500ms
  - 用户搜索: P95 < 200ms

- **实时事件延迟**: 
  - 好友请求推送: < 100ms
  - 在线状态更新: < 200ms

- **并发处理**: 
  - 支持 100+ 用户同时操作
  - 好友列表分页（每页 20 条）

### NFR-2: 安全要求

- **认证要求**: 
  - 所有 API 端点必须经过 NextAuth 认证
  - 未登录用户访问应返回 401

- **权限控制**: 
  - 用户只能操作自己的好友关系
  - 无法查看其他用户的好友列表

- **速率限制**: 
  - 发送好友请求: 10 次/分钟
  - 用户搜索: 5 次/10 秒
  - 接受/拒绝请求: 20 次/分钟

- **审计日志**: 
  - 记录所有好友关系变更操作
  - 包含操作者、目标用户、操作类型、时间戳

### NFR-3: 可用性要求

- **数据一致性**: 
  - 好友关系为对称关系（双向）
  - 拉黑关系为单向关系
  - 支持事务保证一致性

- **幂等性**: 
  - 重复接受/拒绝请求不应产生错误
  - 重复删除好友应返回友好错误

- **容错性**: 
  - Redis 不可用时降级为数据库查询
  - 实时推送失败不影响数据库操作

### NFR-4: 可维护性要求

- **代码组织**: 
  - 遵循现有项目结构规范
  - API 路由位于 `src/app/api/contacts/`
  - 服务层独立于路由层

- **类型安全**: 
  - 使用 TypeScript 类型定义
  - 使用 Zod 进行输入验证

- **测试覆盖**: 
  - 单元测试覆盖核心业务逻辑
  - 集成测试覆盖 API 端点
  - E2E 测试覆盖关键用户流程

---

## 依赖与约束

### 外部依赖

1. **认证系统** (已就绪)
   - NextAuth.js 用户会话管理
   - 用户必须登录才能使用好友功能

2. **实时通信** (已就绪)
   - Socket.IO + Redis 适配器
   - 用于推送好友请求、状态变更等事件

3. **数据库** (已就绪)
   - PostgreSQL 存储好友关系
   - Prisma ORM 数据访问

4. **缓存系统** (已就绪)
   - Redis 存储用户在线状态
   - Redis 用于 Socket.IO 集群支持

### 技术约束

- **框架**: Next.js 15.5.3 App Router
- **数据库**: PostgreSQL 12+
- **缓存**: Redis 6+
- **ORM**: Prisma 6.16.2
- **实时通信**: Socket.IO 4.8.1

### 业务约束

- **好友数量限制**: 单个用户最多 1000 个好友
- **待处理请求限制**: 单个用户最多 50 个待处理请求
- **黑名单限制**: 单个用户最多 100 个黑名单用户

---

## Evidence（证据来源）

### 相关 Steering 文档

- **产品规划**: `.spec-workflow/steering/product.md` (第71行：好友系统和联系人管理)
- **技术架构**: `.spec-workflow/steering/tech.md` (第99行：数据库承载好友关系)
- **项目结构**: `.spec-workflow/steering/structure.md` (第111-119行：用户关系模块路径规划)

### 现有技术基础设施

- **认证系统**: `src/lib/config/next.auth.ts`, `src/app/api/auth/`
- **Socket.IO 配置**: `src/socket/server/config.ts`, `src/socket/server/adapter.ts`
- **Redis 适配器**: `src/socket/server/adapter.ts`
- **Prisma 配置**: `prisma/schema.prisma`, `src/lib/config/prisma.ts`

### 计划实施路径

- **前端页面**: `src/app/(dashboard)/contacts/page.tsx`
- **前端组件**: `src/components/pages/Contacts.tsx`, `src/components/contacts/`
- **后端 API**: `src/app/api/contacts/`
- **Socket 事件**: `src/socket/server/events/friend/`
- **数据模型**: `prisma/schema.prisma` (FriendRelation 模型)
- **类型定义**: `src/types/friend.ts`

---

**文档版本**: 1.2  
**创建日期**: 2025-09-29  
**最后更新**: 2025-10-02  
**状态**: 实施中（13/19 任务完成）

**实施摘要**:
- ✅ 后端实现完成（数据层、类型层、API 层、Socket.IO 实时通信层）
  - ✅ Tasks 1-2: Prisma schema + TypeScript types
  - ✅ Tasks 3-10: 10个 API 端点（完整的 service + middleware + route 架构）
  - ✅ Tasks 11-12: Socket.IO 认证 + 8个事件处理器 + 在线状态管理
- ✅ 前端基础框架完成（主页面和 Tab 导航）
  - ✅ Task 14: `Friends.tsx` 主组件（4个 Tab）
- ❌ 前端 API 管理器待实施（Task 13：FriendsApiManager 类，优先级高）
- ❌ 前端组件和交互待实施（Tasks 15-17：8个组件）
- ❌ 前端数据 Hooks 待实施（Task 18：4个自定义 Hooks，依赖 Task 13）
- ❌ 端到端测试和性能优化待进行（Task 19）

**关键架构亮点**:
- ✅ API 架构遵循认证模块模式（route + service + middleware）
- ✅ Socket.IO 使用 NextAuth JWT token 认证
- ✅ Redis 全局单例配置（与 Prisma 架构一致）
- ✅ 所有实时事件在数据库操作成功后推送

**验收标准达成情况**:
- ✅ US-1 到 US-11：后端 API 和 Socket 事件已实现
- ⏳ 前端界面和用户交互：基础框架就绪，具体组件待实施
- 📋 NFR-1 到 NFR-4：性能测试和安全加固待进行
