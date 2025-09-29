# 认证模块设计文档

## 概述

认证模块采用 Next.js 13+ App Router 架构，结合 NextAuth.js、Prisma ORM 和 PostgreSQL 数据库，实现了完整的用户认证体系。系统支持凭据登录、邮箱验证和密码重置功能，采用现代化的 React 服务器组件和 API 路由设计。

## 技术栈对齐

### 技术标准
- **框架**: Next.js 13+ with App Router ✅ **已实现**
- **认证**: NextAuth.js v5 (Auth.js) ✅ **已实现**
- **数据库**: PostgreSQL with Prisma ORM ✅ **已实现**
- **密码哈希**: Argon2 算法 ✅ **已实现**
- **邮件服务**: Nodemailer with SMTP ✅ **已实现**
- **UI 框架**: React with TypeScript ✅ **已实现**

### 项目结构
遵循 Next.js App Router 的文件系统路由和分层架构：
- `src/app/(auth)/` - 认证相关页面组件
- `src/app/api/auth/` - 认证 API 路由
- `src/lib/config/` - 配置文件
- `src/lib/` - 共享工具和服务

## 代码复用分析

### 现有组件的利用
- **Prisma Client**: `src/lib/config/prisma.ts` - 数据库连接和查询 ✅ **已复用**
- **NextAuth 配置**: `src/lib/config/next.auth.ts` - 统一认证配置 ✅ **已复用**
- **加密工具**: `src/lib/crypto.ts` - Argon2 密码哈希 ✅ **已复用**
- **邮件服务**: `src/lib/email.ts` - SMTP 邮件发送 ✅ **已复用**
- **API 类型**: `src/types/api.ts` - 统一 API 响应格式 ✅ **已复用**

### 集成点
- **NextAuth 集成**: 与 `[...nextauth]/route.ts` 集成提供会话管理 ✅ **已集成**
- **数据库集成**: 使用 Prisma 适配器连接 NextAuth 和 PostgreSQL ✅ **已集成**
- **邮件集成**: 集成 Nodemailer 用于邮箱验证和密码重置 ✅ **已集成**

## 架构设计

### 模块化设计原则
- **单文件职责**: 每个路由文件专注于单一 HTTP 方法处理 ✅ **已实现**
- **组件隔离**: 页面组件、API 路由、业务逻辑分离 ✅ **已实现**
- **服务层分离**: 数据访问、业务逻辑、表示层明确分离 ✅ **已实现**
- **工具模块化**: 加密、邮件、数据库工具独立模块 ✅ **已实现**

```mermaid
graph TD
    A[前端页面 - (auth)] --> B[API 路由 - api/auth]
    B --> C[中间件 - middleware.ts]
    C --> D[业务服务 - service.ts]
    D --> E[数据层 - Prisma]
    D --> F[邮件服务 - email.ts]
    D --> G[加密服务 - crypto.ts]
    H[NextAuth 配置] --> B
    I[数据库模型] --> E
```

## 组件和接口

### 1. API 路由处理器
- **目的**: 处理 HTTP 请求并返回标准化响应
- **接口**: `POST` 方法，接收 JSON 请求体
- **依赖**: RouteMiddleware, Service 层
- **复用**: 统一的 ApiResponse 类型和错误处理

**已实现路由**:
- `POST /api/auth/login` ✅
- `POST /api/auth/register` ✅
- `POST /api/auth/forgot-password` ✅
- `POST /api/auth/reset-password` ✅

### 2. 业务服务层
- **目的**: 实现核心业务逻辑和数据验证
- **接口**: 异步函数，返回 Promise
- **依赖**: Prisma Client, 加密服务, 邮件服务
- **复用**: 共享的数据库连接和工具函数

**已实现服务**:
- `login(email, password)` ✅
- `signUp(userData)` ✅
- `forgotPassword(email, host)` ✅
- `resetPassword(token, newPassword)` ✅

### 3. 中间件层
- **目的**: 提供横切关注点如错误处理、日志记录
- **接口**: 高阶函数包装 API 处理器
- **依赖**: Next.js Request/Response
- **复用**: 统一的错误处理和响应格式

### 4. 前端页面组件
- **目的**: 提供用户界面和表单处理
- **接口**: React 服务器组件
- **依赖**: Next.js 路由, UI 组件库
- **复用**: 共享的表单组件和样式

**已实现页面**:
- `/login` - 登录页面 ✅
- `/register` - 注册页面 ✅
- `/forgot-password` - 忘记密码页面 ✅
- `/[token]/reset-password` - 重置密码页面 ✅

## 数据模型

### User 模型
```typescript
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime? @map("email_verified")
  image         String?
  password      String?   @db.Text  // Argon2 哈希
  accounts      Account[]
  sessions      Session[]
}
```

### VerificationToken 模型
```typescript
model VerificationToken {
  identifier String    // 用户邮箱
  token      String    // SHA256 哈希的重置令牌
  expires    DateTime  // 过期时间（1小时）
  
  @@unique([identifier, token])
}
```

### Account & Session 模型
NextAuth.js 标准模型，支持多种认证提供商和会话管理。

## 错误处理

### 错误场景
1. **用户不存在**
   - **处理**: 返回 404 状态码和错误消息
   - **用户影响**: 显示"用户不存在"提示

2. **密码错误**
   - **处理**: 返回 401 状态码和认证失败消息
   - **用户影响**: 显示"密码错误"提示

3. **邮箱已存在**
   - **处理**: 返回 409 状态码和冲突消息
   - **用户影响**: 显示"邮箱已被注册"提示

4. **令牌无效或过期**
   - **处理**: 返回 400 状态码和令牌错误消息
   - **用户影响**: 重定向到忘记密码页面

5. **邮件发送失败**
   - **处理**: 记录错误日志，返回 500 状态码
   - **用户影响**: 显示"邮件发送失败，请稍后重试"

6. **数据库连接错误**
   - **处理**: 捕获异常，返回 500 状态码
   - **用户影响**: 显示"系统暂时不可用"

## 安全设计

### 密码安全
- **哈希算法**: Argon2 - 业界推荐的密码哈希算法 ✅ **已实现**
- **盐值**: Argon2 内置随机盐值生成 ✅ **已实现**
- **存储**: 密码哈希存储在数据库，明文密码不持久化 ✅ **已实现**

### 令牌安全
- **生成**: 使用 Node.js crypto.randomBytes 生成安全随机令牌 ✅ **已实现**
- **哈希**: 使用 SHA256 哈希存储，原始令牌仅在邮件中传输 ✅ **已实现**
- **过期**: 1小时过期时间，使用后自动删除 ✅ **已实现**

### 会话安全
- **JWT**: NextAuth.js JWT 策略，无状态会话管理 ✅ **已实现**
- **HTTPS**: 生产环境强制 HTTPS（通过环境配置） ✅ **已配置**
- **Cookie**: HttpOnly, Secure, SameSite 属性保护 ✅ **已实现**

## 测试策略

### 单元测试
- **API 路由**: 测试各种输入场景和错误处理
- **服务层**: 模拟数据库和外部依赖的业务逻辑测试
- **工具函数**: 加密、邮件功能的独立测试

### 集成测试
- **数据库集成**: 使用测试数据库验证 CRUD 操作
- **邮件集成**: 使用邮件测试服务验证邮件发送
- **NextAuth 集成**: 验证认证流程和会话管理

### 端到端测试
- **用户注册流程**: 从页面输入到数据库记录创建
- **登录流程**: 完整的认证和会话创建流程
- **密码重置流程**: 从请求重置到新密码设置的完整流程

## 部署和配置

### 环境变量
```bash
# 数据库
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# SMTP 邮件
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-username
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@example.com
```

### 数据库迁移
```bash
# 应用数据库模式
npx prisma migrate deploy

# 生成 Prisma 客户端
npx prisma generate
```

## 性能考虑

### 数据库优化
- **索引**: User.email 字段唯一索引 ✅ **已实现**
- **连接池**: Prisma 内置连接池管理 ✅ **已实现**
- **查询优化**: 使用 findUnique 而非 findFirst 提高查询性能 ✅ **已实现**

### 缓存策略
- **会话缓存**: NextAuth.js JWT 无状态设计减少数据库查询 ✅ **已实现**
- **静态页面**: 认证页面可以静态生成，提高加载速度 ✅ **已实现**

### 邮件队列
- **当前实现**: 同步邮件发送
- **改进建议**: 实施异步邮件队列（Redis + Bull）以提高响应性能
