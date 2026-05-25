# 📄 Manage Document

Ứng dụng quản lý tài liệu xây dựng bằng **NestJS**, triển khai trên **AWS ECS Fargate** thông qua CI/CD pipeline **Jenkins → ECR → ECS**.

---

## 📋 Mục lục

- [Yêu cầu](#-yêu-cầu)
- [Chạy Local](#-chạy-local-development)
- [Chạy bằng Docker](#-chạy-bằng-docker)
- [Kiến trúc CI/CD](#-kiến-trúc-cicd)
- [Triển khai lên AWS](#-triển-khai-lên-aws)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)

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

# 3. App chạy tại http://localhost:3000
```

### Các lệnh hữu ích

```bash
npm run build          # Build production
npm run start:prod     # Chạy production
npm run test           # Chạy tests
npm run test:e2e       # Chạy e2e tests
npm run lint           # Lint code
npm run format         # Format code
```

---

## 🐳 Chạy bằng Docker

```bash
# Build và chạy
docker compose up -d --build

# Xem logs
docker compose logs -f

# Dừng
docker compose down
```

App chạy tại: **http://localhost:3000**

---

## 🏗 Kiến trúc CI/CD

```
Git Push → Jenkins (EC2) → Docker Build → Push ECR → Deploy ECS Fargate
                                                          ↓
                                              ALB → User truy cập app
```

| Stage | Mô tả |
|-------|--------|
| Cleanup | Xóa Docker cache cũ trên Jenkins |
| Checkout | Clone code từ Git |
| Build Docker Image | Build image với tag = BUILD_NUMBER |
| Login to ECR | Đăng nhập AWS ECR bằng IAM role |
| Push to ECR | Push image lên ECR (tag: build number + latest) |
| Deploy to ECS | Trigger ECS force new deployment |
| Cleanup Images | Xóa local images tiết kiệm disk |

---

## 🚀 Triển khai lên AWS

### ✅ Bước 1: Tạo hạ tầng bằng Terraform (ĐÃ XONG)

```bash
cd terraform_manage_document
terraform plan
terraform apply
```

### ✅ Bước 2: SSH vào EC2 (ĐÃ XONG)

```bash
ssh -i ecommerce.pem ubuntu@47.131.75.110
```

> **Lưu ý:** Server là Ubuntu nên username là `ubuntu`, KHÔNG phải `ec2-user`.

---

### 📌 Bước 3: Cài đặt Docker, Jenkins, AWS CLI trên EC2

Sau khi SSH vào server, chạy từng lệnh theo thứ tự:

#### 3.1 — Cập nhật hệ thống

```bash
sudo apt-get update -y && sudo apt-get upgrade -y
```

#### 3.2 — Cài đặt Docker

```bash
# Cài Docker bằng script chính thức (tự detect Ubuntu version)
curl -fsSL https://get.docker.com | sudo sh

# Kiểm tra
docker --version
```

#### 3.3 — Cài đặt Java 21 (Jenkins yêu cầu Java 21+)

```bash
sudo apt-get install -y fontconfig openjdk-21-jre

# Kiểm tra (phải hiện version 21.x.x)
java -version
```

#### 3.4 — Cài đặt Jenkins

```bash
# Lấy Jenkins GPG key từ Ubuntu keyserver
sudo gpg --keyserver keyserver.ubuntu.com --recv-keys 7198F4B714ABFC68
sudo gpg --export 7198F4B714ABFC68 | sudo tee /etc/apt/keyrings/jenkins.gpg > /dev/null

# Thêm Jenkins repo
echo "deb [signed-by=/etc/apt/keyrings/jenkins.gpg] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

# Cài Jenkins
sudo apt-get update -y
sudo apt-get install -y jenkins

# Sửa Jenkins service dùng Java 21 (mặc định nó trỏ Java 17)
sudo sed -i 's|java-17|java-21|g' /lib/systemd/system/jenkins.service
sudo systemctl daemon-reload

# Cho phép Jenkins chạy Docker
sudo usermod -aG docker jenkins

# Khởi động Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Kiểm tra trạng thái (phải hiện "active (running)")
sudo systemctl status jenkins
```

#### 3.5 — Cài đặt AWS CLI v2

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo apt-get install -y unzip
unzip -o awscliv2.zip
sudo ./aws/install
rm -rf awscliv2.zip aws

# Kiểm tra
aws --version
```

#### 3.6 — Cài đặt Git

```bash
sudo apt-get install -y git

# Kiểm tra
git --version
```

#### 3.7 — Restart Jenkins (để nhận quyền Docker)

```bash
sudo systemctl restart jenkins
```

#### 3.8 — Lấy mật khẩu Jenkins

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

> **Ghi lại mật khẩu này** — cần dùng ở bước tiếp theo!

---

### 📌 Bước 4: Cấu hình Jenkins trên trình duyệt

#### 4.1 — Truy cập Jenkins UI

Mở trình duyệt và vào:

```
http://47.131.75.110:8080
```

#### 4.2 — Nhập mật khẩu admin

Paste mật khẩu từ bước 3.8 vào ô **Administrator password**.

#### 4.3 — Cài đặt Plugins

1. Chọn **"Install suggested plugins"** → Đợi cài xong
2. Sau đó vào **Manage Jenkins → Plugins → Available plugins**
3. Tìm và cài thêm 3 plugin:
   - ✅ `Docker Pipeline`
   - ✅ `Amazon ECR`
   - ✅ `Pipeline: AWS Steps`
4. Restart Jenkins sau khi cài plugins

#### 4.4 — Tạo Admin User

Điền thông tin tài khoản admin → **Save and Continue** → **Save and Finish**

---

### 📌 Bước 5: Tạo Pipeline Job

1. Trên trang chủ Jenkins, click **"New Item"**
2. Nhập tên: `manage-document`
3. Chọn loại: **Pipeline** → OK
4. Trong phần cấu hình:
   - Kéo xuống mục **Pipeline**
   - Definition: chọn **"Pipeline script from SCM"**
   - SCM: chọn **Git**
   - Repository URL: `https://github.com/BaoBui98/manage-document.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
5. Click **Save**

---

### 📌 Bước 6: Chạy Pipeline (Deploy lần đầu)

1. Trong job `manage-document`, click **"Build Now"**
2. Theo dõi pipeline chạy qua các stages:
   - ✅ Cleanup
   - ✅ Checkout
   - ✅ Build Docker Image
   - ✅ Login to ECR
   - ✅ Push to ECR
   - ✅ Deploy to ECS
   - ✅ Cleanup Images
3. Nếu tất cả xanh → Deploy thành công!

---

### 📌 Bước 7: Kiểm tra kết quả

```bash
# Kiểm tra image trên ECR
aws ecr list-images --repository-name manage-document --region ap-southeast-1

# Kiểm tra ECS service đang chạy
aws ecs describe-services \
  --cluster manage-document-cluster \
  --services manage-document-service \
  --region ap-southeast-1 \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}'

# Truy cập app (thay bằng ALB DNS từ terraform output)
curl http://<ALB_DNS_NAME>
```

Lấy ALB DNS:
```bash
cd terraform_manage_document
terraform output alb_dns_name
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
