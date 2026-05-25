# 📄 Manage Document

Ứng dụng quản lý tài liệu xây dựng bằng **NestJS**, triển khai trên **AWS ECS Fargate** thông qua CI/CD pipeline **Jenkins → ECR → ECS**.

---

## 📋 Mục lục

- [Yêu cầu](#-yêu-cầu)
- [Chạy Local (Development)](#-chạy-local-development)
- [Chạy bằng Docker](#-chạy-bằng-docker)
- [Kiến trúc CI/CD](#-kiến-trúc-cicd)
- [Triển khai lên AWS](#-triển-khai-lên-aws)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Biến môi trường](#-biến-môi-trường)

---

## 🔧 Yêu cầu

| Tool | Version |
|------|---------|
| Node.js | >= 22 |
| npm | >= 10 |
| Docker | >= 24 |
| Docker Compose | >= 2.x |
| Terraform | >= 1.5 (cho deploy AWS) |
| AWS CLI | v2 (cho deploy AWS) |

---

## 💻 Chạy Local (Development)

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy development mode (hot-reload)
npm run start:dev

# 3. App chạy tại
# http://localhost:3000
```

### Các lệnh hữu ích

```bash
# Build production
npm run build

# Chạy production
npm run start:prod

# Chạy tests
npm run test

# Chạy e2e tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format
```

---

## 🐳 Chạy bằng Docker

### Cách 1: Docker Compose (khuyến nghị)

```bash
# Build và chạy
docker compose up -d --build

# Xem logs
docker compose logs -f

# Dừng
docker compose down
```

### Cách 2: Docker thủ công

```bash
# Build image
docker build -t manage-document .

# Chạy container
docker run -d -p 3000:3000 --name manage-document \
  -e NODE_ENV=production \
  -e PORT=3000 \
  manage-document

# Xem logs
docker logs -f manage-document

# Dừng và xóa
docker stop manage-document && docker rm manage-document
```

App chạy tại: **http://localhost:3000**

---

## 🏗 Kiến trúc CI/CD

```
Git Push → Jenkins (EC2) → Docker Build → Push ECR → Deploy ECS Fargate
                                                          ↓
                                              ALB → User truy cập
```

### Pipeline Stages

| Stage | Mô tả |
|-------|--------|
| **Cleanup** | Xóa Docker cache cũ trên Jenkins |
| **Checkout** | Clone code từ Git repository |
| **Build Docker Image** | Build image với tag = BUILD_NUMBER |
| **Login to ECR** | Đăng nhập AWS ECR bằng IAM role |
| **Push to ECR** | Push image lên ECR (tag: build number + latest) |
| **Deploy to ECS** | Trigger ECS force new deployment |
| **Cleanup Images** | Xóa local images tiết kiệm disk |

---

## 🚀 Triển khai lên AWS

### Bước 1: Tạo hạ tầng bằng Terraform

```bash
cd terraform_manage_document

# Xem trước những gì sẽ tạo
terraform plan

# Tạo hạ tầng (ECR, ECS, ALB, IAM, Security Groups)
terraform apply
```

Terraform sẽ tạo:
- **ECR Repository** — lưu Docker images
- **ECS Cluster + Service** — chạy container (Fargate)
- **ALB** — Load Balancer nhận traffic
- **IAM Roles** — quyền cho Jenkins và ECS
- **Security Groups** — firewall rules

### Bước 2: Setup Jenkins trên EC2

```bash
# SSH vào EC2
ssh -i ecommerce.pem ec2-user@<JENKINS_IP>

# Chạy script setup (cài Docker, Java, Jenkins)
chmod +x setup-jenkins.sh
./setup-jenkins.sh
```

### Bước 3: Cấu hình Jenkins

1. Mở **http://\<JENKINS_IP\>:8080**
2. Nhập **initial admin password** (hiển thị cuối script setup)
3. Cài **Suggested Plugins** + thêm:
   - `Docker Pipeline`
   - `Amazon ECR`
   - `Pipeline: AWS Steps`
4. Tạo **Pipeline Job**:
   - Chọn **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: URL repo `manage-document`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`

### Bước 4: Deploy lần đầu

1. Click **Build Now** trên Jenkins
2. Theo dõi pipeline chạy qua các stages
3. Sau khi hoàn tất, truy cập app qua **ALB DNS** (lấy từ output terraform)

### Xác nhận deploy thành công

```bash
# Kiểm tra image trên ECR
aws ecr list-images --repository-name manage-document --region ap-southeast-1

# Kiểm tra ECS service
aws ecs describe-services \
  --cluster manage-document-cluster \
  --services manage-document-service \
  --region ap-southeast-1

# Truy cập app
curl http://<ALB_DNS_NAME>
```

---

## 📁 Cấu trúc thư mục

```
manage-document/
├── src/                    # Source code
│   ├── main.ts             # Entry point
│   ├── app.module.ts       # Root module
│   ├── app.controller.ts   # Root controller
│   └── app.service.ts      # Root service
├── test/                   # Test files
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Docker Compose config
├── .dockerignore           # Docker ignore rules
├── Jenkinsfile             # Jenkins CI/CD pipeline
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
└── README.md               # File này
```

---

## 🔐 Biến môi trường

| Biến | Mặc định | Mô tả |
|------|----------|--------|
| `PORT` | `3000` | Port ứng dụng |
| `NODE_ENV` | `development` | Môi trường (development / production) |

---

## 📝 License

UNLICENSED
