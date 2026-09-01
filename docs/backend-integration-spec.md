# MCMS Backend Integration Specification

**Ngày lập:** 2026-09-01  
**Phạm vi:** Frontend Vite + React + TypeScript hiện tại trong `src/`  
**Trạng thái frontend:** UI hoàn chỉnh theo mock data; chưa có HTTP client/API thật.

## Phạm vi và quy ước

- Tất cả store hiện tại là Zustand in-memory, ngoại trừ `setting.store.ts` có thêm LocalStorage persistence.
- Frontend hiện chưa gọi `axios`, WebSocket, SSE hoặc MQTT trực tiếp.
- Các endpoint đánh dấu **Direct** ánh xạ trực tiếp từ type/action hiện có. Các endpoint **Extension** cần thiết để backend phục vụ đầy đủ hành vi UI (phân trang server, realtime, camera, export).
- ID hiện dùng các prefix: `TRAY-*`, `DEVICE-*`, `USER-*`, `TENANT-*`, `PACKAGE-*`, `BATCH-*`, `ALERT-*`, `THRESHOLD-*`.
- Thời gian truyền qua API phải là ISO-8601 có timezone, ví dụ `2026-09-01T08:35:00+07:00`; ngày nghiệp vụ dùng `YYYY-MM-DD`.

# PHẦN 1: TỔNG QUAN CÁC MODULE FRONTEND

## 1. Kiến trúc runtime

| Khu vực | File thực tế | Trách nhiệm |
|---|---|---|
| Entry | `src/main.tsx`, `src/App.tsx` | Khởi tạo React StrictMode và `RouterProvider`. |
| Layout | `src/app/layouts/AdminLayout.tsx` | Ant Design `Layout`, Sider, Header, Menu, `Outlet`; menu hiện có Dashboard, khay, IoT, gói cước, sinh trưởng, cảnh báo, báo cáo, khách thuê, tài khoản, cài đặt. |
| Auth guard | `src/app/router/guards/AuthGuard.tsx` | Đọc `isAuthenticated`, chuyển người chưa đăng nhập về `/login`. |
| Role guard | `src/routes/RoleGuard.tsx` | Chuẩn hóa role cũ (`admin`, `farm_manager`, `operator`) sang `ADMIN`, `OPERATOR`, `CUSTOMER`; redirect user không có quyền về `/` và tránh loop tại root. |
| Router | `src/app/router/index.tsx` | Browser routes từ `/login`, `/rooms`, `/rooms/:id`, `/devices`, `/packages`, `/cultivation`, `/alerts`, `/reports`, `/tenants`, `/users`, `/settings`. |
| Shared UI | Chưa có `src/components/` | Chưa có thư mục component dùng chung cấp ứng dụng; UI đang nằm theo feature/page. |

## 2. Auth và RBAC

**Files:**

- `src/features/auth/types/auth.types.ts`
- `src/features/auth/store/auth.store.ts`
- `src/features/auth/components/LoginForm.tsx`
- `src/features/auth/pages/LoginPage.tsx`
- `src/routes/RoleGuard.tsx`

**Contract thực tế:**

- `UserRole` cũ: `admin | farm_manager | operator`.
- `User`: `id`, `email`, `role`, `name`.
- `LoginCredentials`: `email`, `password`.
- Store: `user`, `token`, `isAuthenticated`, `login(credentials): Promise<string>`.
- Mock login duy nhất: `admin@mcms.vn` / `Admin@123`.
- Login có validate email, loading, lỗi; thành công dùng `navigate('/', { replace: true })`.
- Chưa có logout, refresh token, persistence phiên hoặc API thật.

## 3. Dashboard giám sát môi trường

**Files:** `src/features/dashboard/pages/DashboardPage.tsx`, `EnvironmentMetricCard.tsx`, `EnvironmentChart.tsx`.

- Metric cards hiện tại: nhiệt độ, độ ẩm, CO₂, cường độ sáng.
- `EnvironmentChart` dùng Recharts với data mock 24 giờ, hai trục Y cho nhiệt độ và độ ẩm.
- Chart đã nhận prop `data` để tái sử dụng cho trang chi tiết khay.
- Chưa có polling/API realtime trong Dashboard.

## 4. Quản lý khay trồng

**Files:** `src/features/rooms/types/room.types.ts`, `store/room.store.ts`, `components/RoomTable.tsx`, `RoomStatusTag.tsx`, `RoomForm.tsx`, `RoomListPage.tsx`, `TrayDetailPage.tsx`.

**Data:** `Room` gồm `id`, `name`, `deviceId`, `mushroomType`, `currentTrays`, `status` (`active | maintenance | inactive`). `currentTrays` còn tồn tại trong state để tương thích dữ liệu cũ nhưng không hiển thị trong UI khay.

**Đã chạy:**

- Danh sách mock bốn khay, mã ESP32 và loại nấm.
- Add vào đầu danh sách, ID tự sinh `TRAY-00X`, `currentTrays = 0`.
- Update, delete có `Modal.confirm`, status tag.
- Form validate tên khay, ESP32, loại nấm, trạng thái.
- Click tên khay tới `/rooms/:id`.
- `TrayDetailPage` có metrics, chart, trạng thái ESP32 và Switch quạt/bơm giả lập.

## 5. Quản lý khách thuê

**Files:** `src/features/tenants/types/tenant.types.ts`, `store/tenant.store.ts`, `components/TenantTable.tsx`, `components/TenantForm.tsx`, `pages/TenantListPage.tsx`.

- `Tenant`: `id`, `name`, `phone`, `assignedTrayId`, `startDate`, `status` (`active | expired`).
- CRUD Zustand immutable, ID `TENANT-00X`, ngày bắt đầu local khi add.
- Table hiển thị mã khách, họ tên, SĐT, khay, ngày bắt đầu, trạng thái.
- Form validate số điện thoại Việt Nam và chọn khay.
- Xóa dùng `Modal.confirm`; chưa có chống trùng khay ở frontend.

## 6. Quản lý Users & RBAC

**Files:** `src/types/user.types.ts`, `src/stores/user.store.ts`, `src/pages/users/components/UserFormModal.tsx`, `ResetPasswordModal.tsx`, `UserManagementPage.tsx`.

- Role mới: `ADMIN`, `OPERATOR`, `CUSTOMER`.
- Status: `ACTIVE`, `LOCKED`, `PENDING`.
- User gồm `id`, `username`, `name`, `email`, `phone`, `role`, `status`, `createdAt`.
- CRUD immutable; search tên/username/email/SĐT; filter role/status; pagination.
- Đổi role inline; khóa/mở khóa có `Popconfirm`; xóa có `Popconfirm`.
- Reset password dùng `crypto.getRandomValues`, tạo mã tạm tối thiểu 12 ký tự và hiển thị một lần trong modal.
- RoleGuard route `/users` chỉ cho `ADMIN`.

## 7. Thiết bị IoT và camera

**Files:** `src/types/device.types.ts`, `src/stores/device.store.ts`, `src/pages/devices/DeviceManagementPage.tsx`, `DeviceMetricsGrid.tsx`, `CameraStreamCard.tsx`, `ActuatorControlPanel.tsx`, `DeviceFormModal.tsx`.

- `DeviceStatus`: `ONLINE`, `OFFLINE`, `WARNING`, `ERROR`.
- `Device` gồm tray/IP/MAC/firmware/ping/RSSI/status, telemetry (`temperature`, `humidity`, `co2`, `soilMoisture`, `updatedAt`), actuator (`fanStatus`, `pumpStatus`, `lightStatus`, `mode`), camera (`streamUrl`, `resolution`, `fps`, `isLive`, `lastSnapshotUrl`).
- Add device ghép vào tray chưa có thiết bị; cấu hình IPv4, MAC, firmware, stream, resolution, FPS.
- Toggle relay optimistic trong Zustand; relay bị disable khi AUTO hoặc OFFLINE/ERROR.
- Ping/restart mock có loading; snapshot lưu URL placeholder.
- Telemetry simulation toggle cập nhật số ngẫu nhiên mỗi 5 giây, bỏ qua thiết bị OFFLINE.
- Camera placeholder có HUD LIVE/OFFLINE, FPS, resolution, timestamp, snapshot và view overview/close-up.
- Search IP/MAC/Device ID/Tray ID/tên khay; filter status; pagination.
- Route `/devices` được RoleGuard giới hạn `ADMIN`/`OPERATOR`.

## 8. Gói cước thuê

**Files:** `src/types/package.types.ts`, `src/stores/package.store.ts`, `src/pages/packages/components/PackageCard.tsx`, `PackageFormModal.tsx`, `PackageComparisonTable.tsx`, `PackageManagementPage.tsx`.

- `RentalPackage`: `id`, `name`, `code`, `price`, `billingCycle`, `durationDays`, `maxTrays`, `supportedMushrooms`, `features`, `status`, `isPopular`, `totalSubscribers`, `createdAt`.
- Status: `ACTIVE`, `INACTIVE`, `PROMOTION`; cycle: `MONTHLY`, `CROP_CYCLE`, `QUARTERLY`, `YEARLY`.
- CRUD, toggle status, toggle popular; Popconfirm trước tạm ngưng/xóa.
- Card View và Table View; tìm kiếm tên/mã; lọc cycle/status; phân trang.
- VND format bằng `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.
- Form dùng `Form.List` cho giống nấm và features, validate giá/thời hạn/số khay.
- Customer chỉ thấy gói không `INACTIVE` và nút chọn; Admin/Operator thấy CRUD.

## 9. Sinh trưởng và thu hoạch

**Files:** `src/types/cultivation.types.ts`, `src/stores/cultivation.store.ts`, `src/pages/cultivation/CultivationManagementPage.tsx`, `GrowthStageTimeline.tsx`, `CultivationBatchCard.tsx`, `HarvestScheduleModal.tsx`, `CultivationLogModal.tsx`.

- Stage: `INCUBATION`, `PINNING`, `FRUITING`, `READY_TO_HARVEST`, `HARVESTED`.
- Quality: `GRADE_A`, `GRADE_B`, `WARNING_CONTAMINATED`.
- Batch gồm mã mẻ/tray/nấm/ngày/sản lượng/operator/tenant/health/logs.
- `advanceStage`, `addLog`, `scheduleHarvest`, `recordHarvest`, `markContaminated` đều immutable.
- Steps, Progress, Timeline, dayjs days remaining.
- Customer chỉ xem batch có `tenantName` trùng user; Admin/Operator có action.
- Popconfirm trước chuyển stage/đánh dấu hỏng.

## 10. Alerts và Reports

**Files:** `src/types/alert.types.ts`, `src/stores/alert.store.ts`, `src/pages/alerts/*`, `src/pages/reports/*`.

- Alert severity: `INFO`, `WARNING`, `CRITICAL`; category: nhiệt độ, độ ẩm, CO₂, device offline, hardware fault.
- `SystemAlert` có `isRead`, `isAcknowledged`, người/thời điểm acknowledge.
- Mark read, mark all read, acknowledge đơn lẻ/all; filter severity/category/read/ack; Customer scope theo tray thuê.
- Reports có trend môi trường, donut quality, bar revenue; preset `TODAY`, `LAST_7_DAYS`, `LAST_30_DAYS`, `CURRENT_CROP` và CSV export.
- `EnvironmentTrendChart` dùng ResponsiveContainer và ba Y axis: temperature, humidity, CO₂.

## 11. Settings

**Files:** `src/types/setting.types.ts`, `src/stores/setting.store.ts`, `src/pages/settings/*`.

- Threshold profile theo loại nấm: min/max temperature/humidity/soil, CO₂ max, default profile.
- System config: telemetry interval, offline timeout, camera snapshot interval, auto relay, debug.
- Notification config: email, Telegram, Zalo, critical-only, daily report email.
- `ThresholdProfileTab` CRUD; default profile không xóa; Min < Max validation.
- `SystemConfigTab` và `NotificationConfigTab` chỉ Admin edit; Operator/Customer read-only.
- Persistence LocalStorage key `mcms-system-settings`; dữ liệu lỗi/quota/private mode fallback về memory/default.

# PHẦN 2: ĐẶC TẢ RESTful API BACKEND

## 2.1 Response envelope chung

Backend phải trả mọi response theo envelope:

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

Với danh sách phân trang, `data` dùng:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "total": 0
}
```

Các mẫu bên dưới viết phần `data` trong envelope để dễ đọc.

## 2.2 Auth và Users

### POST `/api/auth/login` — Direct

- **Query:** không.
- **Body:**

```json
{ "email": "admin@mcms.vn", "password": "Admin@123" }
```

- **Response 200:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "USER-001",
      "email": "admin@mcms.vn",
      "role": "ADMIN",
      "name": "Nguyễn Minh Quản"
    }
  }
}
```

### GET `/api/auth/me` — Direct/Extension

- **Query:** không.
- **Body:** không.
- **Response 200:** `data` là user hiện tại với `id`, `email`, `role`, `name`.

### POST `/api/auth/logout` — Extension

- **Query:** không.
- **Body:** không.
- **Response 200:** `{ "success": true, "data": null, "message": "Logged out" }`.

### GET `/api/users` — Direct

- **Query:** `page`, `pageSize`, `search`, `role`, `status`.
- **Body:** không.
- **Response 200:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "USER-001",
        "username": "admin.mcms",
        "name": "Nguyễn Minh Quản",
        "email": "admin@mcms.vn",
        "phone": "0901234567",
        "role": "ADMIN",
        "status": "ACTIVE",
        "createdAt": "2025-08-12"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

### POST `/api/users` — Direct

- **Query:** không.
- **Body:** `username`, `name`, `email`, `phone`, `role`, `status`; backend tự sinh `id`, `createdAt` và quy trình mật khẩu/invite.
- **Response 201:** `data` là user mới, không trả plaintext password.

### GET `/api/users/{id}` — Extension

- **Query:** không.
- **Body:** không.
- **Response 200:** `data` là một `User`.

### PATCH `/api/users/{id}` — Direct

- **Query:** không.
- **Body:** một phần của `username`, `name`, `email`, `phone`, `role`, `status`.
- **Response 200:** `data` là user sau cập nhật.

### PATCH `/api/users/{id}/status` — Direct

- **Query:** không.
- **Body:** `{ "status": "LOCKED" }` hoặc `{ "status": "ACTIVE" }`.
- **Response 200:** `{ "id": "USER-004", "status": "LOCKED" }`.

### POST `/api/users/{id}/reset-password` — Direct/Extension

- **Query:** không.
- **Body:** không; backend tạo mã tạm an toàn và nên lưu hash, không lưu plaintext.
- **Response 200:**

```json
{
  "success": true,
  "data": {
    "userId": "USER-003",
    "temporaryPassword": "F7!qK2@xM9pL",
    "expiresAt": "2026-09-01T10:00:00+07:00"
  }
}
```

### DELETE `/api/users/{id}` — Direct

- **Query:** không.
- **Body:** không.
- **Response 200:** `{ "deletedId": "USER-005" }`.

## 2.3 Khay trồng và thiết bị IoT

### GET `/api/trays` — Direct

- **Query:** `page`, `pageSize`, `search`, `status`, `mushroomType`.
- **Body:** không.
- **Response 200:** `data.items` gồm `id`, `name`, `deviceId`, `mushroomType`, `currentTrays`, `status`.

### POST `/api/trays` — Direct

- **Query:** không.
- **Body:**

```json
{
  "name": "Khay tầng 5",
  "deviceId": "ESP32-AA11",
  "mushroomType": "Nấm Hoàng Kim",
  "status": "active"
}
```

- **Response 201:** `data` là `Room` mới với `currentTrays: 0`.

### GET `/api/trays/{id}` — Direct/Extension

- **Query:** không.
- **Body:** không.
- **Response 200:** `data` là tray và metadata thiết bị hiện tại.

### PATCH `/api/trays/{id}` — Direct

- **Query:** không.
- **Body:** một phần `name`, `deviceId`, `mushroomType`, `status`.
- **Response 200:** `data` là tray sau cập nhật.

### DELETE `/api/trays/{id}` — Direct

- **Query:** không.
- **Body:** không.
- **Response 200:** `{ "deletedId": "TRAY-004" }`.

### GET `/api/trays/{id}/telemetry` — Extension

- **Query:** `from`, `to`, `interval` (`5m`, `1h`, `1d`).
- **Body:** không.
- **Response 200:** mảng `{ "time", "temperature", "humidity", "co2", "soilMoisture" }`.

### GET `/api/devices` — Direct/Extension

- **Query:** `page`, `pageSize`, `search`, `status`, `trayId`.
- **Body:** không.
- **Response 200:** `data.items` theo interface `Device`, bao gồm telemetry, actuators, camera.

### POST `/api/devices` — Direct

- **Query:** không.
- **Body:**

```json
{
  "trayId": "TRAY-005",
  "ipAddress": "192.168.1.120",
  "macAddress": "24:6F:28:AA:BB:CC",
  "firmwareVersion": "v1.4.2",
  "streamUrl": "rtsp://192.168.1.120/live",
  "resolution": "1280x720",
  "fps": 20
}
```

- **Response 201:** `data` là `Device` mới với status `ONLINE`, actuator mặc định `AUTO`, telemetry ban đầu.

### GET `/api/devices/{id}` — Extension

- **Query:** không.
- **Body:** không.
- **Response 200:** `data` là một `Device` đầy đủ.

### PATCH `/api/devices/{id}` — Direct

- **Query:** không.
- **Body:** các field cấu hình `trayId`, `ipAddress`, `macAddress`, `firmwareVersion`, `streamUrl`, `resolution`, `fps`.
- **Response 200:** `data` là device sau cập nhật.

### DELETE `/api/devices/{id}` — Direct/Extension

- **Query:** không.
- **Body:** không.
- **Response 200:** `{ "deletedId": "DEVICE-003" }`.

### POST `/api/devices/{id}/ping` — Direct

- **Query:** không.
- **Body:** không.
- **Response 200:**

```json
{
  "deviceId": "DEVICE-001",
  "status": "ONLINE",
  "lastPingTimestamp": "2026-09-01T09:00:00+07:00",
  "wifiRssi": -48
}
```

### POST `/api/devices/{id}/restart` — Direct

- **Query:** không.
- **Body:** không.
- **Response 202:** `{ "deviceId": "DEVICE-001", "commandId": "CMD-1001", "status": "QUEUED" }`.

### PATCH `/api/devices/{id}/actuators` — Direct

- **Query:** không.
- **Body:**

```json
{ "actuator": "fanStatus", "enabled": true }
```

- **Response 200:** `data.actuators` là actuator state mới.

### PATCH `/api/devices/{id}/control-mode` — Direct

- **Query:** không.
- **Body:** `{ "mode": "MANUAL" }` hoặc `{ "mode": "AUTO" }`.
- **Response 200:** `{ "deviceId": "DEVICE-001", "mode": "MANUAL" }`.

### POST `/api/devices/{id}/camera/snapshot` — Direct

- **Query:** không.
- **Body:** không.
- **Response 202:**

```json
{
  "deviceId": "DEVICE-001",
  "snapshotId": "SNAP-3001",
  "status": "QUEUED",
  "url": null
}
```

### GET `/api/devices/{id}/camera` — Extension

- **Query:** không.
- **Body:** không.
- **Response 200:** `data` là `CameraConfig`.

## 2.4 Gói cước và khách thuê

### GET `/api/packages` — Direct

- **Query:** `page`, `pageSize`, `search`, `billingCycle`, `status`.
- **Body:** không.
- **Response 200:** `data.items` theo `RentalPackage`.

### POST `/api/packages` — Direct

- **Query:** không.
- **Body:** `name`, `code`, `price`, `billingCycle`, `durationDays`, `maxTrays`, `supportedMushrooms`, `features`, `status`, `isPopular`.
- **Response 201:** package mới với `id`, `totalSubscribers: 0`, `createdAt`.

### GET `/api/packages/{id}` — Extension

- **Query:** không.
- **Body:** không.
- **Response 200:** `data` là một `RentalPackage`.

### PATCH `/api/packages/{id}` — Direct

- **Query:** không.
- **Body:** partial `CreatePackageInput`.
- **Response 200:** package sau cập nhật.

### PATCH `/api/packages/{id}/status` — Direct

- **Query:** không.
- **Body:** `{ "status": "ACTIVE" }`, `{ "status": "INACTIVE" }` hoặc `{ "status": "PROMOTION" }`.
- **Response 200:** `{ "id": "PACKAGE-004", "status": "ACTIVE" }`.

### PATCH `/api/packages/{id}/popular` — Direct

- **Query:** không.
- **Body:** `{ "isPopular": true }`.
- **Response 200:** `{ "id": "PACKAGE-002", "isPopular": true }`.

### DELETE `/api/packages/{id}` — Direct

- **Query:** không.
- **Body:** không.
- **Response 200:** `{ "deletedId": "PACKAGE-004" }`.

### GET `/api/tenants` — Direct

- **Query:** `page`, `pageSize`, `search`, `status`, `assignedTrayId`.
- **Body:** không.
- **Response 200:** `data.items` gồm `id`, `name`, `phone`, `assignedTrayId`, `startDate`, `status`.

### POST `/api/tenants` — Direct

- **Query:** không.
- **Body:** `{ "name": "Nguyễn Minh Anh", "phone": "0901234567", "assignedTrayId": "TRAY-001", "status": "active" }`.
- **Response 201:** tenant mới với `id` và `startDate` do backend sinh.

### GET `/api/tenants/{id}` — Extension

- **Query:** không.
- **Body:** không.
- **Response 200:** `data` là một `Tenant`.

### PATCH `/api/tenants/{id}` — Direct

- **Query:** không.
- **Body:** partial `TenantFormValues`.
- **Response 200:** tenant sau cập nhật.

### DELETE `/api/tenants/{id}` — Direct

- **Query:** không.
- **Body:** không.
- **Response 200:** `{ "deletedId": "TENANT-003" }`.

### POST `/api/tenants/{id}/subscriptions` — Extension

- **Query:** không.
- **Body:** `{ "packageId": "PACKAGE-002", "trayId": "TRAY-001", "startDate": "2026-09-01" }`.
- **Response 201:** hợp đồng thuê gồm `subscriptionId`, tenant, package, tray, dates, status.

## 2.5 Vòng đời sinh trưởng và thu hoạch

### GET `/api/cultivation/batches` — Direct

- **Query:** `page`, `pageSize`, `search`, `stage`, `mushroomType`, `healthStatus`, `trayId`, `tenantId`.
- **Body:** không.
- **Response 200:** `data.items` theo `CultivationBatch`.

### POST `/api/cultivation/batches` — Extension

- **Query:** không.
- **Body:** `batchCode`, `trayId`, `mushroomType`, `startDate`, `estimatedHarvestDate`, `expectedYieldKg`, `operatorInCharge`, `tenantName`.
- **Response 201:** batch mới ở `INCUBATION`, `progressPercent: 0`.

### GET `/api/cultivation/batches/{id}` — Direct

- **Query:** không.
- **Body:** không.
- **Response 200:** batch cùng `logs`.

### PATCH `/api/cultivation/batches/{id}/stage` — Direct

- **Query:** không.
- **Body:** `{ "stage": "READY_TO_HARVEST", "progressPercent": 90 }`.
- **Response 200:** `{ "id": "BATCH-003", "currentStage": "READY_TO_HARVEST", "progressPercent": 90 }`.

### POST `/api/cultivation/batches/{id}/logs` — Direct

- **Query:** không.
- **Body:** `{ "stage": "FRUITING", "note": "...", "loggedBy": "...", "actionTaken": "..." }`.
- **Response 201:** log mới gồm `id`, `timestamp` và các field body.

### PATCH `/api/cultivation/batches/{id}/harvest-schedule` — Direct

- **Query:** không.
- **Body:** `{ "estimatedHarvestDate": "2026-09-08", "expectedYieldKg": 4.5, "operatorInCharge": "Trần Quốc Huy" }`.
- **Response 200:** batch sau cập nhật lịch.

### POST `/api/cultivation/batches/{id}/harvest` — Direct

- **Query:** không.
- **Body:** `{ "actualHarvestDate": "2026-09-08", "actualYieldKg": 4.2, "quality": "GRADE_A", "notes": "..." }`.
- **Response 200:** batch `currentStage: HARVESTED`, `progressPercent: 100`, `actualYieldKg`, `actualHarvestDate`, `healthStatus` mới.

### PATCH `/api/cultivation/batches/{id}/health` — Direct

- **Query:** không.
- **Body:** `{ "healthStatus": "WARNING_CONTAMINATED" }`.
- **Response 200:** batch sau khi đánh dấu cảnh báo và log hệ thống.

## 2.6 Alerts và Reports

### GET `/api/alerts` — Direct

- **Query:** `page`, `pageSize`, `severity`, `category`, `trayId`, `deviceId`, `isRead`, `isAcknowledged`, `from`, `to`.
- **Body:** không.
- **Response 200:** `data.items` theo `SystemAlert`, có `isRead` và acknowledge metadata.

### PATCH `/api/alerts/{id}/read` — Direct

- **Query:** không.
- **Body:** `{ "isRead": true }`.
- **Response 200:** `{ "id": "ALERT-001", "isRead": true }`.

### PATCH `/api/alerts/read-all` — Direct

- **Query:** có thể nhận `trayId` để scope.
- **Body:** `{ "isRead": true }`.
- **Response 200:** `{ "updatedCount": 3 }`.

### PATCH `/api/alerts/{id}/acknowledge` — Direct

- **Query:** không.
- **Body:** `{ "acknowledgedBy": "Trần Quốc Huy" }`.
- **Response 200:** alert với `isAcknowledged: true`, `acknowledgedAt`.

### PATCH `/api/alerts/acknowledge-all` — Direct

- **Query:** có thể nhận `trayId` để scope.
- **Body:** `{ "acknowledgedBy": "Trần Quốc Huy" }`.
- **Response 200:** `{ "updatedCount": 4 }`.

### GET `/api/reports/environment` — Direct/Extension

- **Query:** `period` (`TODAY`, `LAST_7_DAYS`, `LAST_30_DAYS`, `CURRENT_CROP`), `from`, `to`, `trayId`, `interval`.
- **Body:** không.
- **Response 200:** mảng `EnvironmentHistoryPoint`.

### GET `/api/reports/yield` — Direct/Extension

- **Query:** `period`, `from`, `to`, `trayId`, `mushroomType`.
- **Body:** không.
- **Response 200:** mảng `YieldSummary`.

### GET `/api/reports/revenue` — Direct/Extension

- **Query:** `period`, `from`, `to`, `packageId`, `groupBy=month|package`.
- **Body:** không.
- **Response 200:** mảng `RevenueSummary`.

### GET `/api/reports/summary` — Extension

- **Query:** `period`, `from`, `to`, `trayId`.
- **Body:** không.
- **Response 200:** `{ "environmentPoints": 14, "yieldTypes": 4, "revenueMonths": 6 }`.

### GET `/api/reports/export` — Extension

- **Query:** `format=csv`, `period`, `from`, `to`, `trayId`.
- **Body:** không.
- **Response 200:** `Content-Type: text/csv; charset=utf-8`, có BOM UTF-8 để Excel đọc tiếng Việt.

## 2.7 Settings và threshold profiles

### GET `/api/settings/threshold-profiles` — Direct

- **Query:** `mushroomType`, `isDefault`.
- **Body:** không.
- **Response 200:** mảng `MushroomThresholdProfile`.

### POST `/api/settings/threshold-profiles` — Direct

- **Query:** không.
- **Body:**

```json
{
  "mushroomType": "Nấm Bào Ngư Xám",
  "name": "Profile mùa nóng",
  "tempMin": 20,
  "tempMax": 28,
  "humidityMin": 75,
  "humidityMax": 95,
  "co2Max": 1000,
  "soilMoistureMin": 60,
  "soilMoistureMax": 85
}
```

- **Response 201:** profile với `id`, `isDefault: false`, `updatedAt`.

### PATCH `/api/settings/threshold-profiles/{id}` — Direct

- **Query:** không.
- **Body:** các field ngưỡng trong `ThresholdProfileInput`.
- **Response 200:** profile sau cập nhật.

### PATCH `/api/settings/threshold-profiles/{id}/default` — Direct

- **Query:** không.
- **Body:** `{ "isDefault": true }`.
- **Response 200:** profile được chọn và các profile khác `isDefault: false`.

### DELETE `/api/settings/threshold-profiles/{id}` — Direct

- **Query:** không.
- **Body:** không.
- **Response 200:** `{ "deletedId": "THRESHOLD-006" }`; backend phải từ chối profile mặc định.

### GET `/api/settings/system` — Direct

- **Query:** không.
- **Body:** không.
- **Response 200:** `SystemIoTConfig`.

### PATCH `/api/settings/system` — Direct

- **Query:** không.
- **Body:** partial `SystemIoTConfig`.
- **Response 200:** config sau cập nhật.

### POST `/api/settings/system/reset` — Direct

- **Query:** không.
- **Body:** không.
- **Response 200:** `DEFAULT_SYSTEM_CONFIG`.

### GET `/api/settings/notifications` — Direct

- **Query:** không.
- **Body:** không.
- **Response 200:** `NotificationChannelConfig`; không nên trả token đầy đủ cho role không phải Admin.

### PATCH `/api/settings/notifications` — Direct

- **Query:** không.
- **Body:** partial `NotificationChannelConfig`.
- **Response 200:** config đã mask secret, ví dụ `telegramBotToken: "********"`.

### POST `/api/settings/notifications/reset` — Direct

- **Query:** không.
- **Body:** không.
- **Response 200:** `DEFAULT_NOTIFICATION_CONFIG` đã mask secret.

# PHẦN 3: REAL-TIME VÀ IOT GATEWAY

## 3.1 MQTT topic namespace

Khuyến nghị namespace:

```text
mcms/{farmId}/trays/{trayId}/devices/{deviceId}/telemetry
mcms/{farmId}/trays/{trayId}/devices/{deviceId}/commands
mcms/{farmId}/trays/{trayId}/devices/{deviceId}/command-ack
mcms/{farmId}/trays/{trayId}/devices/{deviceId}/status
```

Mỗi device chỉ được publish trong topic có `deviceId` đã đăng ký với `trayId`. Broker phải xác thực certificate/username riêng cho từng ESP32 và giới hạn ACL theo namespace đó.

## 3.2 Publish telemetry ESP32 → Backend

**Topic:** `mcms/farm-001/trays/TRAY-001/devices/DEVICE-001/telemetry`  
**QoS:** 1; không retain telemetry; TLS bắt buộc.

```json
{
  "schemaVersion": "1.0",
  "messageId": "TEL-20260901-000001",
  "deviceId": "DEVICE-001",
  "trayId": "TRAY-001",
  "timestamp": "2026-09-01T08:35:12+07:00",
  "telemetry": {
    "temperature": 25.6,
    "humidity": 87,
    "co2": 642,
    "soilMoisture": 74
  },
  "actuators": {
    "fanStatus": true,
    "pumpStatus": false,
    "lightStatus": true,
    "mode": "AUTO"
  },
  "network": {
    "ipAddress": "192.168.1.101",
    "macAddress": "24:6F:28:A1:B2:C3",
    "wifiRssi": -48
  },
  "firmwareVersion": "v1.4.2"
}
```

Backend phải validate:

- `deviceId`/`trayId` tồn tại và đang ghép đúng nhau.
- `timestamp` không lệch quá mức cho phép; lưu server receive time riêng.
- Sensor values là số hữu hạn, kiểm tra range vật lý trước khi tính alert.
- Idempotency theo `messageId`.
- Cập nhật `DeviceTelemetry`, `lastPingTimestamp`, `wifiRssi`, actuator snapshot và status.

## 3.3 Heartbeat và Last Will

**Online publish:**

```json
{
  "deviceId": "DEVICE-001",
  "trayId": "TRAY-001",
  "status": "ONLINE",
  "timestamp": "2026-09-01T08:35:00+07:00"
}
```

**Offline LWT:** publish retained vào `/status` khi broker phát hiện mất kết nối:

```json
{
  "deviceId": "DEVICE-001",
  "trayId": "TRAY-001",
  "status": "OFFLINE",
  "reason": "LWT",
  "timestamp": "2026-09-01T08:40:00+07:00"
}
```

Backend dùng `deviceOfflineTimeoutMinutes` từ settings để phân biệt offline thật với trễ mạng và tạo `DEVICE_OFFLINE` alert.

## 3.4 Command Backend → ESP32

**Topic:** `mcms/farm-001/trays/TRAY-001/devices/DEVICE-001/commands`  
**QoS:** 1; retain false; mỗi command có TTL và `commandId`.

### Set actuator

```json
{
  "schemaVersion": "1.0",
  "commandId": "CMD-1001",
  "deviceId": "DEVICE-001",
  "trayId": "TRAY-001",
  "command": "SET_ACTUATOR",
  "actuator": "fanStatus",
  "enabled": true,
  "mode": "MANUAL",
  "requestedBy": "USER-002",
  "requestedAt": "2026-09-01T08:40:00+07:00",
  "expiresAt": "2026-09-01T08:41:00+07:00"
}
```

### Set mode

```json
{
  "commandId": "CMD-1002",
  "deviceId": "DEVICE-001",
  "trayId": "TRAY-001",
  "command": "SET_MODE",
  "mode": "AUTO",
  "requestedBy": "USER-001",
  "requestedAt": "2026-09-01T08:42:00+07:00"
}
```

### Ping, restart, snapshot

```json
{
  "commandId": "CMD-1003",
  "deviceId": "DEVICE-001",
  "trayId": "TRAY-001",
  "command": "RESTART",
  "requestedAt": "2026-09-01T08:43:00+07:00"
}
```

`command` nhận `SET_ACTUATOR`, `SET_MODE`, `PING`, `RESTART`, `SNAPSHOT`. ESP32 phản hồi trên `/command-ack`:

```json
{
  "commandId": "CMD-1001",
  "deviceId": "DEVICE-001",
  "status": "APPLIED",
  "appliedAt": "2026-09-01T08:40:02+07:00",
  "actuators": {
    "fanStatus": true,
    "pumpStatus": false,
    "lightStatus": true,
    "mode": "MANUAL"
  },
  "errorCode": null
}
```

## 3.5 WebSocket/SSE Backend → Frontend

Hai lựa chọn tương thích:

- WebSocket: `GET /api/ws` với JWT query/header handshake.
- SSE: `GET /api/realtime/stream` với `Accept: text/event-stream`.

Dùng envelope chung:

```json
{
  "eventId": "EVT-9001",
  "type": "telemetry.updated",
  "occurredAt": "2026-09-01T08:35:12+07:00",
  "scope": {
    "farmId": "farm-001",
    "trayId": "TRAY-001",
    "deviceId": "DEVICE-001"
  },
  "data": {}
}
```

### Event `telemetry.updated`

```json
{
  "type": "telemetry.updated",
  "data": {
    "temperature": 25.6,
    "humidity": 87,
    "co2": 642,
    "soilMoisture": 74,
    "updatedAt": "2026-09-01T08:35:12+07:00"
  }
}
```

Frontend cập nhật `Device.telemetry` và Dashboard/DeviceMetricsGrid.

### Event `device.status`

```json
{
  "type": "device.status",
  "data": {
    "status": "OFFLINE",
    "lastPingTimestamp": "2026-09-01T08:30:00+07:00",
    "wifiRssi": -86
  }
}
```

### Event `actuator.updated`

```json
{
  "type": "actuator.updated",
  "data": {
    "fanStatus": true,
    "pumpStatus": false,
    "lightStatus": true,
    "mode": "AUTO"
  }
}
```

### Event `alert.created` / `alert.updated`

`data` là một `SystemAlert`; `alert.updated` được dùng khi mark read/acknowledge. Frontend cập nhật alert store và badge.

### Event `camera.snapshot.ready`

```json
{
  "type": "camera.snapshot.ready",
  "data": {
    "snapshotId": "SNAP-3001",
    "url": "https://cdn.example.com/snapshots/SNAP-3001.jpg",
    "capturedAt": "2026-09-01T08:45:00+07:00"
  }
}
```

### Event `cultivation.updated`

`data` chứa patch của `CultivationBatch`: stage/progress/log/harvest/health status. Frontend cập nhật batch theo `scope.trayId` hoặc `data.id`.

## 3.6 SSE wire format

```text
event: telemetry.updated
id: EVT-9001
data: {"eventId":"EVT-9001","type":"telemetry.updated","occurredAt":"2026-09-01T08:35:12+07:00","scope":{"trayId":"TRAY-001","deviceId":"DEVICE-001"},"data":{"temperature":25.6,"humidity":87,"co2":642,"soilMoisture":74}}

```

SSE phải gửi heartbeat comment tối đa mỗi 30 giây (`: keep-alive`) và hỗ trợ `Last-Event-ID` để reconnect.

# PHẦN 4: HƯỚNG DẪN TÍCH HỢP BACKEND

## 4.1 HTTP status codes

| Code | Sử dụng |
|---:|---|
| `200` | GET/PATCH/DELETE thành công hoặc command accepted theo API quy ước. |
| `201` | POST tạo resource thành công. |
| `202` | Command bất đồng bộ đã được xếp hàng (`restart`, `snapshot`). |
| `400` | Body/query sai schema, enum, range Min/Max hoặc validation nghiệp vụ. |
| `401` | Thiếu/sai/hết hạn JWT. |
| `403` | JWT hợp lệ nhưng role không đủ quyền hoặc resource ngoài scope Customer. |
| `404` | Không tìm thấy resource/device/tray/batch/profile. |
| `409` | Khuyến nghị cho duplicate code, MAC, device-tray hoặc package code. |
| `422` | Khuyến nghị cho lỗi validation domain chi tiết nếu framework hỗ trợ. |
| `500` | Lỗi server ngoài dự kiến; không trả stack trace cho client. |

Lỗi mẫu:

```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "errors": {
    "tempMin": "Must be lower than tempMax",
    "code": "Package code already exists"
  }
}
```

## 4.2 JWT Bearer authentication

Frontend gửi mọi request bảo vệ:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

Khuyến nghị JWT claims:

```json
{
  "sub": "USER-001",
  "email": "admin@mcms.vn",
  "role": "ADMIN",
  "tenantId": null,
  "iat": 1788220800,
  "exp": 1788307200
}
```

- Access token ngắn hạn; refresh token dùng HttpOnly Secure cookie hoặc endpoint riêng.
- Không lưu password, Telegram token hoặc secret notification trong frontend response dạng plaintext.
- Backend phải enforce authorization, không chỉ dựa vào việc ẩn nút UI.
- `ADMIN`: toàn quyền users, devices, packages, cultivation, settings.
- `OPERATOR`: vận hành devices, cultivation, threshold profiles; không sửa system/notification toàn cục.
- `CUSTOMER`: chỉ đọc packages/reports/alerts/cultivation/settings profile thuộc tray được assign; không acknowledge/đổi relay/sửa config.

## 4.3 Pagination, filter và sort

Query thống nhất:

```text
?page=1&pageSize=20&search=TRAY-001&sortBy=createdAt&sortOrder=desc
```

- `page` bắt đầu từ 1.
- `pageSize` giới hạn server, ví dụ tối đa 100.
- Filter enum phải trả `400` nếu không hợp lệ.
- `total` là tổng sau filter, không phải tổng trước filter.
- Customer scope phải áp dụng trước pagination để không rò rỉ count.

## 4.4 Date, number và money

- Timestamp: ISO-8601 timezone.
- Business date: `YYYY-MM-DD`.
- Nhiệt độ: số thực, °C.
- Độ ẩm/soil: phần trăm RH/%.
- CO₂: ppm.
- Sản lượng: kg, số thực tối đa 3 chữ số thập phân theo domain.
- Tiền: integer VNĐ trong JSON, không gửi chuỗi đã format; frontend format bằng `Intl.NumberFormat`.

## 4.5 Đồng bộ LocalStorage settings

Frontend hiện dùng key `mcms-system-settings` để giữ threshold/system/notification khi F5. Khi chuyển sang backend:

1. GET `/api/settings/*` sau khi hydrate user.
2. Backend là source of truth; LocalStorage chỉ dùng cache UI nếu cần.
3. Gắn `updatedAt`/`version` hoặc ETag để phát hiện ghi đè đồng thời.
4. Xóa cache khi logout hoặc đổi farm/tenant.
5. Không persist secret chưa mã hóa trong LocalStorage.

## 4.6 Checklist bàn giao backend

- [ ] Tạo JWT login/me/logout và middleware role/scope.
- [ ] Tạo schema cho Tray, Device, Tenant, User, Package, CultivationBatch, Alert, Settings.
- [ ] Enforce unique: `device.macAddress`, `device.trayId` (mỗi tray một ESP32), package `code`, user `username/email`, batch `batchCode`.
- [ ] Validate threshold `Min < Max`, giới hạn CO₂ > 0, interval thuộc enum.
- [ ] Tạo MQTT consumer/publisher, ACL, TLS, LWT, idempotency và command ack.
- [ ] Tạo alert engine từ telemetry + threshold profile + offline timeout.
- [ ] Tạo WebSocket/SSE fan-out có scope theo role/tray.
- [ ] Tạo report aggregation theo ngày/tháng, cache và CSV streaming.
- [ ] Tạo audit log cho đổi role, khóa user, reset password, relay command, threshold, acknowledge/harvest.
- [ ] Viết contract tests theo các JSON sample trong tài liệu này.
- [ ] Cấu hình CORS, rate limiting, request id, structured logging và secret management.
- [ ] Thay mock Zustand bằng Axios/query layer; giữ tên field hoặc thêm migration mapping rõ ràng.

## 4.7 Khoảng cách frontend hiện tại cần xử lý khi tích hợp

- Auth store đang dùng role lowercase cũ, trong khi user store dùng uppercase; backend nên trả canonical uppercase và frontend giữ mapper tạm thời.
- Auth chưa persistence/logout/refresh token.
- Room/Tenant/Device/Cultivation/Alert/Package stores chưa gọi API thật.
- Device telemetry simulation và camera stream đều là placeholder.
- Dashboard chưa subscribe realtime.
- `Tenant` chưa có email/userId; để scope Customer chắc chắn, backend nên bổ sung `userId`/`tenantId` vào Tenant và batch/alert/report query.
- `RevenueSummary` hiện không có `packageId`; nếu cần drill-down theo gói, backend nên trả thêm `packageId` hoặc group endpoint riêng.
- `EnvironmentHistoryPoint.date`, `trayId` và `YieldSummary.trayId` là field mở rộng phục vụ filter/scoping; giữ backward compatibility khi API trả về.

