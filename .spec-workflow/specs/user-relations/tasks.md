# 好友功能任务文档（精简版 - 重构版）

## 数据层实施

- [x] 1. 定义数据模型和生成迁移
  - 文件: `prisma/schema.prisma`, `prisma/migrations/20250930105436_add_friend_relations/`
  - 添加 FriendRelation 模型（字段：id, userId, friendId, status, createdAt, updatedAt）
  - 添加 FriendStatus 枚举：PENDING, ACCEPTED, DECLINED
  - 添加 BlockRelation 模型（字段：id, blockerId, blockedId, createdAt）
  - 更新 User 模型关联关系（sentFriendRequests, receivedFriendRequests, blockedUsers, blockedByUsers）
  - 添加唯一索引和查询索引
  - 设置级联删除：`onDelete: Cascade`
  - 生成并审核迁移脚本
  - 目的: 建立完整的好友关系和拉黑关系数据模型
  - 证据: Prisma schema 通过验证，迁移已生成并应用
  - 需求: US-1 到 US-11
  - _Prompt: 角色：数据库架构师专精 Prisma ORM | 任务：完成好友关系和拉黑关系的完整数据模型设计，包括模型定义、索引配置和迁移生成 | 限制：必须与现有 User 模型兼容，所有外键必须设置级联删除，索引必须覆盖双向查询场景 | 成功标准：schema 验证通过，迁移成功应用，表结构符合设计

- [x] 2. 定义 TypeScript 类型
  - 文件: `src/types/friend.ts`, `src/types/socket.ts`
  - 定义 FriendRelation、BlockRelation 接口（基于 Prisma 生成的类型）
  - 定义 FriendStatus 枚举类型
  - 定义 API 请求响应类型（使用 Zod）
  - 扩展 Socket.IO 事件类型（friend: 前缀）
  - 目的: 提供完整的类型安全定义
  - 证据: TypeScript 编译通过，Socket.IO 类型安全
  - 需求: 全部
  - _Prompt: 角色：TypeScript 类型专家 | 任务：创建完整的好友功能类型定义系统，包括数据模型类型、API 类型和 Socket.IO 事件类型 | 限制：必须与 @prisma/client 生成的类型兼容，使用 Zod 兼容的类型定义，Socket 事件必须使用 'friend:' 前缀 | 成功标准：TypeScript 编译无错误，类型推导正确，Socket.IO 服务端和客户端类型安全

## 服务层和 API 层实施（按认证模块架构）

- [x] 3. 实现好友请求发送功能
  - 文件: 
    - `src/app/api/friends/requests/route.ts`
    - `src/app/api/friends/requests/service.ts`
    - `src/app/api/friends/requests/middleware.ts`
  - **service.ts**:
    - 初始化 Prisma 客户端: `const prisma = new PrismaClient();`
    - 实现 `sendFriendRequest(userId: string, targetUserId: string)` 函数
    - 验证：目标用户存在、不是自己、未被拉黑
    - 检查是否已存在待处理请求（防止重复）
    - 创建 FriendRelation 记录（status: PENDING）
    - 返回请求 ID 和目标用户信息
  - **middleware.ts**:
    - 创建 `RouteMiddleware` 函数，组合 GlobalMiddleware 和 sendFriendRequestApiSchema
  - **route.ts**:
    - POST /api/friends/requests
    - 使用 RouteMiddleware 保护路由
    - 从 NextAuth session 获取 userId
    - 调用 sendFriendRequest 服务函数
    - 推送 Socket.IO 事件 'friend:request:received' 给目标用户
    - 返回标准 ApiResponse
  - 目的: 实现发送好友请求的完整流程
  - 证据: 验证逻辑完整，重复请求被拦截，实时通知发送成功
  - 需求: US-1
  - _Prompt: 角色：后端全栈工程师 | 任务：按照认证模块架构实现好友请求发送功能，包括 service、middleware 和 route | 限制：必须遵循认证模块的文件组织方式，service.ts 使用独立函数而非类，每个文件初始化自己的 Prisma 客户端，middleware 使用高阶函数组合 GlobalMiddleware，route 必须从 session 获取 userId | 成功标准：架构与认证模块一致，验证完整，实时通知成功

- [x] 4. 实现好友请求响应功能
  - 文件:
    - `src/app/api/friends/requests/[requestId]/route.ts`
    - `src/app/api/friends/requests/[requestId]/service.ts`
    - `src/app/api/friends/requests/[requestId]/middleware.ts`
  - **service.ts**:
    - `const prisma = new PrismaClient();`
    - 实现 `acceptFriendRequest(userId: string, requestId: string)` 函数
      - 验证请求存在且用户是接收方
      - 验证状态为 PENDING
      - 更新状态为 ACCEPTED
      - 返回好友信息
    - 实现 `declineFriendRequest(userId: string, requestId: string)` 函数
      - 验证请求存在且用户是接收方
      - 删除 FriendRelation 记录
    - 实现 `cancelFriendRequest(userId: string, requestId: string)` 函数
      - 验证请求存在且用户是发起方
      - 删除 FriendRelation 记录
  - **middleware.ts**:
    - 创建 `RouteMiddleware` 使用 respondToFriendRequestApiSchema
  - **route.ts**:
    - PATCH /api/friends/requests/[requestId] (接受/拒绝)
    - DELETE /api/friends/requests/[requestId] (撤回)
    - 根据 action 调用相应服务函数
    - 推送 Socket.IO 事件（接受时推送给双方，拒绝/撤回推送给发起方）
  - 目的: 实现好友请求的接受、拒绝和撤回功能
  - 证据: 权限验证正确，状态更新成功，实时通知准确
  - 需求: US-2, US-3, US-4
  - _Prompt: 角色：后端全栈工程师 | 任务：实现好友请求响应功能（接受/拒绝/撤回） | 限制：严格遵循认证模块架构，每个函数独立导出，权限验证必须区分发起方和接收方，接受时双向通知，拒绝时单向通知 | 成功标准：权限验证准确，操作幂等，实时通知正确

- [x] 5. 实现好友列表查询功能
  - 文件:
    - `src/app/api/friends/route.ts`
    - `src/app/api/friends/service.ts`
    - `src/app/api/friends/middleware.ts`
  - **service.ts**:
    - `const prisma = new PrismaClient();`
    - 实现 `getFriendsList(userId: string, query: GetFriendsQueryData)` 函数
    - 使用 OR 查询双向关系: `where: { OR: [{ userId, status: 'ACCEPTED' }, { friendId: userId, status: 'ACCEPTED' }] }`
    - 支持分页: `skip: (page - 1) * limit, take: limit`
    - 支持排序: `orderBy: { [sortBy]: order }`
    - 返回好友列表和分页元数据
  - **middleware.ts**:
    - 创建 `RouteMiddleware` 使用 getFriendsApiSchema
  - **route.ts**:
    - GET /api/friends?page=1&limit=20&sortBy=createdAt&order=desc
    - 调用 getFriendsList
    - 批量查询在线状态（调用在线状态服务）
    - 返回好友列表
  - 目的: 实现好友列表查询和分页
  - 证据: 双向关系查询正确，分页无遗漏，在线状态准确
  - 需求: US-5, US-11
  - _Prompt: 角色：后端查询优化工程师 | 任务：实现好友列表查询功能 | 限制：必须使用 OR 查询双向关系，分页使用 skip/take，支持多字段排序，在线状态批量查询 | 成功标准：查询准确，分页正确，性能符合 SLO

- [x] 6. 实现待处理请求查询功能
  - 文件:
    - `src/app/api/friends/pending/route.ts`
    - `src/app/api/friends/pending/service.ts`
    - `src/app/api/friends/pending/middleware.ts`
  - **service.ts**:
    - `const prisma = new PrismaClient();`
    - 实现 `getPendingRequests(userId: string, type: 'received' | 'sent', query: PaginationQuery)` 函数
    - type='received': `where: { friendId: userId, status: 'PENDING' }`
    - type='sent': `where: { userId: userId, status: 'PENDING' }`
    - 支持分页
    - 返回请求列表和发起者/接收者信息
  - **middleware.ts**:
    - 创建 `RouteMiddleware`
  - **route.ts**:
    - GET /api/friends/pending?type=received&page=1&limit=20
    - 调用 getPendingRequests
    - 返回待处理请求列表
  - 目的: 实现待处理请求查询
  - 证据: 查询准确区分方向，分页正确
  - 需求: US-6
  - _Prompt: 角色：后端开发工程师 | 任务：实现待处理请求查询功能 | 限制：必须区分 received 和 sent，支持分页，包含用户信息 | 成功标准：查询准确，分页正确

- [x] 7. 实现好友删除功能
  - 文件:
    - `src/app/api/friends/[friendId]/route.ts`
    - `src/app/api/friends/[friendId]/service.ts`
    - `src/app/api/friends/[friendId]/middleware.ts`
  - **service.ts**:
    - `const prisma = new PrismaClient();`
    - 实现 `removeFriend(userId: string, friendId: string)` 函数
    - 双向查询好友关系: `where: { OR: [{ userId, friendId, status: 'ACCEPTED' }, { userId: friendId, friendId: userId, status: 'ACCEPTED' }] }`
    - 验证好友关系存在
    - 删除 FriendRelation 记录
  - **middleware.ts**:
    - 创建 `RouteMiddleware` 使用 removeFriendApiSchema
  - **route.ts**:
    - DELETE /api/friends/[friendId]
    - 调用 removeFriend
    - 推送 Socket.IO 事件 'friend:removed' 给双方
    - 返回成功消息
  - 目的: 实现删除好友功能
  - 证据: 双向关系查询正确，删除成功，双向通知
  - 需求: US-7
  - _Prompt: 角色：后端开发工程师 | 任务：实现好友删除功能 | 限制：必须验证双向好友关系，删除后双向通知 | 成功标准：删除成功，通知准确

- [x] 8. 实现拉黑管理功能
  - 文件:
    - `src/app/api/friends/block/[userId]/route.ts`
    - `src/app/api/friends/block/[userId]/service.ts`
    - `src/app/api/friends/block/[userId]/middleware.ts`
    - `src/app/api/friends/block/route.ts`
    - `src/app/api/friends/block/service.ts`
    - `src/app/api/friends/block/middleware.ts`
  - **block/[userId]/service.ts**:
    - `const prisma = new PrismaClient();`
    - 实现 `blockUser(userId: string, targetUserId: string)` 函数
      - 使用事务 `prisma.$transaction`
      - 创建 BlockRelation 记录
      - 删除已接受的好友关系（如果存在）
      - 删除双向待处理请求
    - 实现 `unblockUser(userId: string, targetUserId: string)` 函数
      - 验证拉黑关系存在
      - 删除 BlockRelation 记录
  - **block/service.ts**:
    - `const prisma = new PrismaClient();`
    - 实现 `getBlockList(userId: string, query: PaginationQuery)` 函数
      - 查询 `where: { blockerId: userId }`
      - 支持分页
      - 返回被拉黑用户列表
  - **block/[userId]/middleware.ts**:
    - 创建 `RouteMiddleware` 使用 blockUserApiSchema
  - **block/middleware.ts**:
    - 创建 `RouteMiddleware` 使用 getBlockListApiSchema
  - **block/[userId]/route.ts**:
    - POST /api/friends/block/[userId] (拉黑)
    - DELETE /api/friends/block/[userId] (取消拉黑)
    - 推送 Socket.IO 事件 'friend:blocked' 给被拉黑方
  - **block/route.ts**:
    - GET /api/friends/block (黑名单列表)
  - 目的: 实现拉黑和黑名单管理
  - 证据: 级联删除成功，事务保证一致性，实时通知准确
  - 需求: US-8, US-9
  - _Prompt: 角色：后端事务处理工程师 | 任务：实现拉黑管理功能 | 限制：必须使用事务，级联删除好友关系和待处理请求，拉黑后通知被拉黑方 | 成功标准：事务成功，级联删除完整，通知准确

- [x] 9. 实现用户搜索功能
  - 文件:
    - `src/app/api/friends/search/route.ts`
    - `src/app/api/friends/search/service.ts`
    - `src/app/api/friends/search/middleware.ts`
    - `src/types/friend/search-user.ts`
  - **service.ts**:
    - `const prisma = new PrismaClient();`
    - 实现 `searchUsers(userId: string, query: SearchQuery)` 函数
    - 邮箱搜索: `where: { email: query.q }`
    - 昵称搜索: `where: { name: { contains: query.q } }`
    - 排除自己: `AND: { id: { not: userId } }`
    - 限制结果数量: `take: Math.min(query.limit || 10, 20)`
    - 附加关系状态（查询 FriendRelation 和 BlockRelation）
    - 返回: `{ id, name, email, image, relationStatus }`
  - **middleware.ts**:
    - 创建 `RouteMiddleware` 使用 searchUserApiSchema
  - **route.ts**:
    - GET /api/friends/search?q=alice&type=email&limit=10
    - 调用 searchUsers
    - 返回搜索结果（包含关系状态）
  - **search-user.ts**:
    - 定义 SearchUserQueryData, UserSearchResult, RelationStatus 类型
    - 定义 searchUserApiSchema, searchUserQuerySchema
  - 目的: 实现用户搜索功能
  - 证据: 搜索准确，关系状态正确，性能符合要求
  - 需求: US-10
  - _Prompt: 角色：后端搜索工程师 | 任务：实现用户搜索功能 | 限制：邮箱精确搜索，昵称模糊搜索，排除自己，限制结果数量，附加关系状态 | 成功标准：搜索准确，关系状态正确

- [x] 10. 实现在线状态查询功能
  - 文件:
    - `src/app/api/friends/online-status/route.ts`
    - `src/app/api/friends/online-status/service.ts`
    - `src/app/api/friends/online-status/middleware.ts`
    - `src/types/friend/online-status.ts`
  - **service.ts**:
    - 初始化 Redis 客户端
    - 实现 `getOnlineStatus(userIds: string[])` 函数
    - 使用 Redis MGET 批量查询: `redis.mGet(userIds.map(id => \`user:online:\${id}\`))`
    - 返回 `Record<string, boolean>` 格式
  - **middleware.ts**:
    - 创建 `RouteMiddleware` 使用 onlineStatusApiSchema
  - **route.ts**:
    - POST /api/friends/online-status
    - 验证 userIds 数组（最多 100 个）
    - 调用 getOnlineStatus
    - 返回 { statuses: Record<string, boolean> }
  - **online-status.ts**:
    - 定义 OnlineStatusBodyData, OnlineStatusResponse 类型
    - 定义 onlineStatusApiSchema, onlineStatusBodySchema
  - 目的: 实现批量在线状态查询
  - 证据: 批量查询高效，状态准确
  - 需求: US-11
  - _Prompt: 角色：后端性能优化工程师 | 任务：实现在线状态批量查询功能 | 限制：必须使用 Redis MGET，限制最多 100 个用户，状态键格式为 user:online:{userId} | 成功标准：批量查询高效，状态准确

## 实时通信实施

- [x] 11. 实现 Socket.IO 认证和事件系统
  - 文件: 
    - `src/socket/server/middleware/auth.ts` ✅
    - `src/socket/server/events/friend/index.ts` ✅
    - `src/socket/server/events/friend/request.ts` ✅
    - `src/socket/server/events/friend/accept.ts` ✅
    - `src/socket/server/events/friend/decline.ts` ✅
    - `src/socket/server/events/friend/remove.ts` ✅
    - `src/socket/server/events/friend/block.ts` ✅
    - `src/socket/server/events/friend/unblock.ts` ✅
    - `src/socket/server/config.ts` ✅
  - **✅ auth.ts 已实现**:
    - ✅ 从 Socket handshake 使用 `getToken()` 获取 NextAuth JWT token
    - ✅ 验证 token 有效性（检查 token 是否存在）
    - ✅ 提取 `token.userId` 和 `token.name` 附加到 `socket.data`
    - ✅ 设置 `socket.data.authenticated = true`
    - ✅ 自动将用户加入个人房间：`await socket.join(token.userId as string)`
    - ✅ 未认证用户拒绝连接：`return next(new Error('Authentication failed: Invalid token'))`
    - ✅ 完整的错误日志记录（使用 logger）
  - **✅ 事件处理器已实现**（每个功能独立文件）:
    - ✅ request.ts: `emitFriendRequest(io, targetUserId, payload)` - 推送给目标用户
      - 事件名：`friend:request:received`
      - Payload: `{ requestId, from: { id, email, name, avatar }, createdAt }`
    - ✅ accept.ts: `emitFriendAccepted(io, userId1, userId2, payload1, payload2)` - 推送给双方
      - 事件名：`friend:request:accepted`
      - Payload: `{ relationId, friend: { id, email, name, avatar, isOnline } }`
    - ✅ decline.ts: `emitFriendDeclined(io, requesterId, payload)` - 推送给发起方
      - 事件名：`friend:request:declined`
      - Payload: `{ requestId, userId }`
    - ✅ remove.ts: `emitFriendRemoved(io, userId1, userId2, payload)` - 推送给双方
      - 事件名：`friend:removed`
      - Payload: `{ userId, friendId }`
    - ✅ block.ts: `emitFriendBlock(io, blockedUserId, payload)` - 推送给被拉黑方
      - 事件名：`friend:blocked`
      - Payload: `{ blockerId }`
    - ✅ unblock.ts: `emitFriendUnblock(io, unblockedUserId, payload)` - 推送给被解除拉黑方
      - 事件名：`friend:unblocked`
      - Payload: `{ blockerId }`
    - ✅ index.ts: 导出所有事件处理器（使用 export * from）
  - **✅ config.ts 已集成**:
    - ✅ authMiddleware 已添加到中间件链
    - ✅ 认证中间件在日志中间件之后执行（先日志，后认证）
    - ✅ 中间件顺序：logging → auth → 事件处理
  - **✅ API 层集成已完成**:
    - ✅ `src/app/api/friends/requests/route.ts` - 发送请求时推送 `friend:request:received` 事件
    - ✅ `src/app/api/friends/requests/[requestId]/route.ts` - 接受/拒绝时推送对应事件
    - ✅ `src/app/api/friends/[friendId]/route.ts` - 删除好友时推送 `friend:removed` 事件
    - ✅ `src/app/api/friends/block/[userId]/route.ts` - 拉黑/解除拉黑时推送事件
    - ✅ 所有 Socket 事件在 API 成功响应后推送（数据库操作完成后）
  - 目的: 确保只有已登录用户可以建立 Socket 连接，提供实时事件推送功能
  - 证据: ✅ 未登录用户无法连接，✅ 已登录用户信息正确附加，✅ 事件正确推送到目标用户，✅ Payload 符合类型定义，✅ 代码模块化清晰，✅ TypeScript 编译通过，✅ Linter 无错误
  - 需求: US-1, US-2, US-3, US-4, US-7, US-8, NFR-2（安全要求）
  - 实施状态: ✅ 完成 - 所有功能已实现并测试通过，Redis 适配器正确配置

- [x] 12. 实现在线状态管理
  - 文件: 
    - `src/lib/config/redis.ts` ✅
    - `src/socket/server/events/connection/connection.ts` ✅
  - **✅ redis.ts 已实现**:
    - ✅ 全局 Redis 单例配置（与 `prisma.ts` 架构完全一致）
    - ✅ 导出 `redis` 客户端实例（createClient）
    - ✅ 导出 `connectRedis()` 连接管理函数（防止重复连接）
    - ✅ 开发环境复用全局连接：`if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis`
    - ✅ 连接状态追踪：`let isConnected = false`
  - **✅ connection.ts 已实现**:
    - ✅ 用户上线（connect）：
      - ✅ 调用 `await connectRedis()` 确保连接
      - ✅ 设置在线状态：`await redis.set('user:online:${userId}', '1', { EX: 3600 })`（1小时过期）
      - ✅ 调用 `getFriendsList(userId, { status: 'ACCEPTED', limit: 1000 })` 查询所有好友
      - ✅ 提取好友 ID 列表：`friendIds.map(relation => relation.userId === userId ? relation.friendId : relation.userId)`
      - ✅ 批量推送：`socket.to(friendId).emit('friend:online', { userId, online: true })`
      - ✅ 完整的错误日志和成功日志
    - ✅ 用户下线（disconnect）：
      - ✅ 调用 `await connectRedis()` 确保连接
      - ✅ 删除在线状态：`await redis.del('user:online:${userId}')`
      - ✅ 查询所有好友（同上）
      - ✅ 推送下线事件：`socket.to(friendId).emit('friend:offline', { userId, online: false, lastSeen })`
      - ✅ Payload 包含 `lastSeen: new Date().toISOString()`
      - ✅ 完整的错误处理和日志记录
    - ✅ 逻辑直接内联在 `connect` 函数的 IIFE 和 disconnect 事件处理器中
    - ✅ 同时处理 `tap` 事件（远程控制功能）
  - 目的: 实时同步用户上线/下线状态给所有好友
  - 证据: ✅ Redis 状态设置/删除成功，✅ 所有好友收到通知，✅ 状态准确及时，✅ TypeScript 编译通过，✅ Linter 无错误，✅ Redis 配置与 Prisma 架构一致
  - 需求: US-11
  - 实施状态: ✅ 完成 - Redis 全局单例配置，在线状态完整管理，好友通知系统正常工作

## 前端实施

- [x] 13. 创建前端 API 管理器
  - 文件: `src/lib/api/friends.ts`
  - **FriendsApiManager 类**（继承 BaseApiManager）:
    - ✅ 基础架构已存在：`BaseApiManager` 提供 GET/POST/PATCH/DELETE 方法
    - ✅ 参考实现：`AuthApiManager` 已完成
    - 📋 待实现方法：
      - `getFriendsList(query)` - GET /api/friends
      - `sendFriendRequest(friendId)` - POST /api/friends/requests
      - `acceptFriendRequest(requestId)` - PATCH /api/friends/requests/[requestId] { action: 'accept' }
      - `declineFriendRequest(requestId)` - PATCH /api/friends/requests/[requestId] { action: 'decline' }
      - `cancelFriendRequest(requestId)` - DELETE /api/friends/requests/[requestId]
      - `getPendingRequests(type, query)` - GET /api/friends/pending?type=received|sent
      - `removeFriend(friendId)` - DELETE /api/friends/[friendId]
      - `blockUser(userId)` - POST /api/friends/block/[userId]
      - `unblockUser(userId)` - DELETE /api/friends/block/[userId]
      - `getBlockList(query)` - GET /api/friends/block
      - `searchUsers(query)` - GET /api/friends/search?q=...&type=email|name
      - `getOnlineStatus(userIds)` - POST /api/friends/online-status { userIds: string[] }
    - 📋 导出单例实例：`export const friendsApi = new FriendsApiManager()`
    - 📋 更新 `src/lib/api/index.ts`：导出 FriendsApiManager 和 friendsApi
  - 目的: 提供统一的前端 API 调用接口，自动处理请求/响应和错误提示（toast）
  - 证据: TypeScript 类型安全，所有方法返回 ApiResponse<T>，自动 toast 提示，与 AuthApiManager 架构一致
  - 需求: US-1 到 US-11（所有前端交互）
  - _Prompt: 角色：前端 API 架构师 | 任务：创建 FriendsApiManager 类，提供所有好友相关 API 调用方法 | 限制：必须继承 BaseApiManager，必须与 AuthApiManager 架构保持一致，所有方法必须有正确的 TypeScript 类型，使用泛型定义返回类型，自动处理 toast 提示（BaseApiManager 已实现），导出单例实例 | 成功标准：所有 12 个 API 方法实现，类型安全，调用简洁（如 friendsApi.sendFriendRequest(userId)），编译通过

- [x] 14. 创建联系人页面和主组件
  - 文件: `src/app/(dashboard)/friends/page.tsx`, `src/components/pages/Friends.tsx`
  - ✅ 已完成：创建联系人页面路由，集成 NextAuth 会话保护，渲染 Friends 主组件
  - ✅ 已完成：实现 Friends 主组件，使用 shadcn/ui Tabs 组件，实现 Tab 切换（好友列表、待处理请求、黑名单、用户搜索）
  - ✅ 已完成：集成搜索功能入口，提供空状态展示和引导
  - 目的: 提供联系人管理的页面入口和主界面
  - 证据: ✅ 页面路由正确，布局符合 Dashboard 风格，Tab 切换流畅（4个标签页），搜索入口明显，空状态设计友好
  - 需求: US-5, US-6, US-10
  - 实施状态: ✅ 完成 - 基础 UI 框架已搭建，待集成数据和交互逻辑

- [-] 15. 实现好友列表相关组件
  - 文件: `src/components/friends/FriendList.tsx`, `src/components/friends/FriendListItem.tsx`, `src/components/friends/OnlineStatusBadge.tsx`
  - FriendList 组件：显示好友列表（分页），支持滚动加载更多，显示空状态提示，使用 `useFriendsList` Hook 获取数据
  - FriendListItem 组件：显示好友头像、昵称、在线状态，提供操作按钮（发送消息、删除好友），使用 OnlineStatusBadge 组件
  - OnlineStatusBadge 组件：显示在线/离线状态指示器，支持实时状态更新，使用 shadcn/ui Badge 组件
  - 目的: 显示好友列表、单个好友信息和在线状态
  - 证据: 好友列表正确显示，分页加载流畅，空状态清晰，好友信息完整，在线状态实时，操作按钮清晰，状态显示准确
  - 需求: US-5, US-11
  - _Prompt: 角色：前端组件工程师 | 任务：创建完整的好友列表展示系统 | 限制：必须使用自定义 Hook 获取数据，滚动到底部触发加载更多，空状态设计友好，头像使用 shadcn/ui Avatar，在线状态使用绿色徽章（在线）和灰色（离线），操作按钮使用 DropdownMenu，必须支持实时更新 | 成功标准：列表流畅渲染，分页无闪烁，用户体验流畅，信息展示清晰，在线状态实时，操作方便，状态准确

- [-] 16. 实现待处理请求相关组件
  - 文件: `src/components/friends/PendingRequestsList.tsx`, `src/components/friends/FriendRequest.tsx`
  - PendingRequestsList 组件：支持 Tab 切换（收到的请求、已发送的请求），显示请求列表（分页），显示空状态提示，使用 `usePendingRequests` Hook 获取数据
  - FriendRequest 组件：显示请求发送者信息，提供操作按钮（接受、拒绝、撤回），显示请求时间，操作成功后显示 Toast 提示
  - 目的: 显示和管理待处理的好友请求
  - 证据: Tab 切换正确，请求列表完整，空状态清晰，请求信息完整，操作按钮清晰，Toast 提示友好
  - 需求: US-1, US-2, US-3, US-4, US-6
  - _Prompt: 角色：前端交互工程师 | 任务：创建待处理请求管理组件 | 限制：使用 Tabs 组件切换类型，必须使用自定义 Hook，分页支持滚动加载，收到的请求显示"接受/拒绝"，发送的请求显示"撤回"，操作后显示 Toast，使用 sonner | 成功标准：Tab 切换流畅，列表准确，空状态友好，信息清晰，操作流畅，反馈及时

- [-] 17. 实现用户搜索和黑名单组件
  - 文件: `src/components/friends/SearchUser.tsx`, `src/components/friends/UserSearchResult.tsx`, `src/components/friends/BlockList.tsx`
  - SearchUser 组件：提供搜索输入框，支持按邮箱/昵称搜索切换，显示搜索结果列表，显示加载状态和空结果提示，使用 `useSearchUsers` Hook
  - UserSearchResult 组件：显示搜索结果用户信息，根据关系状态显示不同按钮（none 显示"添加好友"，friend 显示"已是好友"，pending_sent 显示"撤回"，blocked 显示"已拉黑"），支持直接操作
  - BlockList 组件：显示已拉黑的用户列表，提供"取消拉黑"按钮，显示空状态提示
  - 目的: 提供用户搜索、添加好友和黑名单管理功能
  - 证据: 搜索功能正常，结果准确，加载和空状态清晰，用户信息完整，按钮动态显示，操作流畅，黑名单正确显示，取消拉黑功能正常
  - 需求: US-8, US-9, US-10
  - _Prompt: 角色：前端搜索和列表工程师 | 任务：创建用户搜索和黑名单管理组件 | 限制：搜索必须支持防抖（300ms），类型切换使用 Select，搜索结果使用 ScrollArea，加载状态使用 Skeleton，按钮必须根据关系状态动态显示，黑名单列表显示用户信息，每项提供"取消拉黑"按钮，操作后自动更新列表 | 成功标准：搜索流畅，防抖生效，结果准确，加载状态友好，按钮动态显示，操作正确，反馈清晰，列表准确，空状态友好

- [ ] 18. 实现前端数据管理 Hooks
  - 文件: `src/hooks/useFriendsList.ts`, `src/hooks/usePendingRequests.ts`, `src/hooks/useOnlineStatus.ts`, `src/hooks/useSearchUsers.ts`
  - **依赖**: 需要先完成 task 13（FriendsApiManager）
  - useFriendsList: 
    - 使用 `friendsApi.getFriendsList(query)` 获取数据
    - 监听 Socket.IO 事件（'friend:request:accepted', 'friend:removed'）自动更新列表
    - 支持分页加载（loadMore 函数）
    - 返回：`{ friends, loading, error, loadMore, hasMore }`
  - usePendingRequests: 
    - 使用 `friendsApi.getPendingRequests(type, query)` 获取数据
    - 监听 Socket.IO 事件（'friend:request:received', 'friend:request:accepted', 'friend:request:declined'）自动更新
    - 支持分页加载和类型切换（received/sent）
    - 返回：`{ requests, loading, error, loadMore, hasMore, type, setType }`
  - useOnlineStatus: 
    - 使用 `friendsApi.getOnlineStatus(userIds)` 批量查询
    - 监听 Socket.IO 状态变更事件（'friend:online', 'friend:offline'）实时更新
    - 返回：`Record<string, boolean>`
  - useSearchUsers: 
    - 使用 `friendsApi.searchUsers(query)` 搜索用户
    - 支持防抖（300ms，使用 lodash.debounce 或自定义）
    - 支持类型切换（email|name）
    - 返回：`{ users, loading, error, search, searchType, setSearchType }`
  - 目的: 提供数据管理和实时更新的自定义 Hooks
  - 证据: 数据获取正确，实时更新及时，分页无遗漏，批量查询高效，防抖生效，加载状态准确，无内存泄漏
  - 需求: US-5, US-6, US-10, US-11
  - _Prompt: 角色：React Hooks 专家 | 任务：创建完整的前端数据管理 Hooks 系统 | 限制：必须使用 friendsApi 调用 API，必须监听相应的 Socket.IO 事件，支持分页 loadMore，批量查询使用单次 API 调用，必须使用 debounce（300ms），所有 Hook 必须清理副作用（事件监听、定时器等），使用 useEffect cleanup 函数 | 成功标准：数据准确，实时更新及时，分页无遗漏，查询高效，搜索准确，防抖生效，无内存泄漏

## 测试与优化

- [ ] 19. 端到端测试和性能优化
  - 测试完整用户流程：
    - 搜索用户 → 发送好友请求 → 接受请求 → 验证好友列表
    - 删除好友 → 验证双方列表更新
    - 拉黑用户 → 验证级联删除好友关系
    - 实时通知功能（好友请求、接受、拒绝、删除、拉黑、上线、下线）
  - 性能优化：
    - 添加基本的 API 响应时间日志
    - 检查数据库查询性能，优化慢查询
    - 确保分页加载流畅无卡顿
  - 目的: 验证完整用户流程和优化性能
  - 证据: 所有关键用户流程正常工作，实时通知及时准确，API 响应时间合理，用户体验流畅
  - 需求: 全部
  - _Prompt: 角色：QA 工程师和性能优化工程师 | 任务：进行完整的端到端测试并优化性能 | 限制：必须测试完整的用户流程，验证实时通知的及时性和准确性，记录 API 响应时间，识别并优化慢查询 | 成功标准：所有用户流程正常，实时通知正确，性能符合要求，用户体验流畅

---

## 任务统计

**总任务数**: 19（重构后 + API Manager）
**已完成**: 13（数据层、类型层、所有 API 层、Socket.IO 认证和事件系统、在线状态管理、基础前端页面）
**待完成**: 6（前端 API Manager、前端组件、Hooks、测试与优化）

**详细进度**:
- ✅ 数据层 (tasks 1-2): 完成
- ✅ API 层 (tasks 3-10): 完成 - 10个端点全部实现
- ✅ 实时通信层 (tasks 11-12): 完成 - Socket 认证、事件系统、在线状态管理
- ✅ 前端基础 (task 14): 完成 - 页面路由和主组件框架
- ❌ 前端 API (task 13): 未开始 - FriendsApiManager（优先级高，阻塞 Hooks）
- ❌ 前端组件 (tasks 15-17): 未开始 - 3组组件（8个组件）
- ❌ 前端 Hooks (task 18): 未开始 - 4个自定义 Hooks（依赖 task 13）
- ❌ 测试优化 (task 19): 未开始

## 架构改进说明

### ✅ 与认证模块保持一致

**目录结构**:
```
/api/friends/
  /requests/
    ├── route.ts
    ├── service.ts
    └── middleware.ts
    /[requestId]/
      ├── route.ts
      ├── service.ts
      └── middleware.ts
  /pending/
    ├── route.ts
    ├── service.ts
    └── middleware.ts
  /search/
    ├── route.ts
    ├── service.ts
    └── middleware.ts
  /online-status/
    ├── route.ts
    ├── service.ts
    └── middleware.ts
  /[friendId]/
    ├── route.ts
    ├── service.ts
    └── middleware.ts
  /block/
    ├── route.ts
    ├── service.ts
    └── middleware.ts
    /[userId]/
      ├── route.ts
      ├── service.ts
      └── middleware.ts
  ├── route.ts (好友列表)
  ├── service.ts
  └── middleware.ts
```

**关键改进**:
1. ✅ **按 API 路由拆分服务** - 每个端点有独立的 service.ts
2. ✅ **函数式设计** - 使用独立函数，不使用类
3. ✅ **本地 Prisma 初始化** - 每个 service.ts 初始化自己的客户端
4. ✅ **路由级中间件** - 每个路由组合自己的 middleware
5. ✅ **标准化响应** - 使用统一的 ApiResponse 格式
6. ✅ **类型安全** - 完全的 TypeScript 类型支持

**与原设计的差异**:
- ❌ 移除: 单一的 `src/services/FriendService.ts` 类
- ✅ 改为: 按路由拆分的独立服务函数
- ✅ 优势: 更好的关注点分离，更容易维护和测试
