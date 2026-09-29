# Hướng dẫn Setup GitHub Secrets cho CI/CD

## Tổng quan — Secrets cần thiết

| Secret | Dùng cho | Ví dụ giá trị |
|--------|----------|---------------|
| `DOCKERHUB_USERNAME` | Login Docker Hub | `nguyenhoanghiep` |
| `DOCKERHUB_TOKEN`    | Login Docker Hub (không dùng password) | `dckr_pat_xxxxx` |
| `DEPLOY_HOST`        | IP/domain server production | `123.456.789.0` |
| `DEPLOY_USER`        | SSH username trên server | `ubuntu` |
| `DEPLOY_SSH_KEY`     | Private key SSH (toàn bộ nội dung) | `-----BEGIN OPENSSH...` |
| `DEPLOY_PORT`        | SSH port (optional, mặc định 22) | `22` |

---

## BƯỚC 1 — Tạo Docker Hub Access Token

> Dùng token thay password — an toàn hơn, có thể revoke bất kỳ lúc nào.

1. Đăng nhập [hub.docker.com](https://hub.docker.com)
2. Click avatar → **Account Settings**
3. Chọn tab **Security** → **New Access Token**
4. **Token description:** `github-actions-phonestore`
5. **Permissions:** chọn `Read, Write, Delete`
6. Click **Generate**
7. **Copy token ngay** — chỉ hiển thị 1 lần!

---

## BƯỚC 2 — Tạo SSH Key để deploy server

Chạy trên máy local hoặc server:

```bash
# Tạo SSH key pair mới (không đặt passphrase)
ssh-keygen -t ed25519 -C "github-actions-phonestore" -f ~/.ssh/phonestore_deploy -N ""

# In private key (dán vào GitHub Secret)
cat ~/.ssh/phonestore_deploy

# In public key (thêm vào server)
cat ~/.ssh/phonestore_deploy.pub
```

**Thêm public key lên server production:**
```bash
# SSH vào server
ssh user@your-server-ip

# Thêm public key vào authorized_keys
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

## BƯỚC 3 — Thêm Secrets vào GitHub Repository

1. Vào repo: `https://github.com/nguyenhoanghiep2005thd-svg/dev`
2. Click **Settings** (tab trên cùng)
3. Sidebar trái → **Secrets and variables** → **Actions**
4. Click **New repository secret**

Thêm lần lượt từng secret:

### `DOCKERHUB_USERNAME`
```
nguyenhoanghiep2005thd-svg
```
*(hoặc username Docker Hub của bạn)*

### `DOCKERHUB_TOKEN`
```
dckr_pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
*(paste token vừa tạo ở Bước 1)*

### `DEPLOY_HOST`
```
123.456.789.0
```
*(IP hoặc domain của server production)*

### `DEPLOY_USER`
```
ubuntu
```
*(username SSH trên server — thường là `ubuntu`, `root`, hoặc `ec2-user`)*

### `DEPLOY_SSH_KEY`
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAA...
(toàn bộ nội dung file ~/.ssh/phonestore_deploy)
...AAAAA=
-----END OPENSSH PRIVATE KEY-----
```
⚠️ **Copy toàn bộ** kể cả dòng `-----BEGIN...` và `-----END...`

### `DEPLOY_PORT` *(optional)*
```
22
```

---

## BƯỚC 4 — Tạo Production Environment (optional nhưng khuyến nghị)

Để thêm bước manual approval trước khi deploy:

1. GitHub repo → **Settings** → **Environments**
2. Click **New environment** → đặt tên `production`
3. Tick **Required reviewers** → thêm username của bạn
4. Save

---

## BƯỚC 5 — Chuẩn bị Server Production

SSH vào server và chạy:

```bash
# Cài Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Cài Docker Compose plugin
sudo apt-get install -y docker-compose-plugin

# Tạo thư mục project
mkdir -p ~/phonestore

# Tạo file .env trên server (thay các giá trị thật)
cat > ~/phonestore/.env << 'EOF'
DEBUG=False
SECRET_KEY=your-super-secret-production-key-here
ALLOWED_HOSTS=your-domain.com,your-server-ip

DB_NAME=phonestore_db
DB_USER=postgres
DB_PASSWORD=your-strong-production-password
DB_HOST=db
DB_PORT=5432

CORS_ALLOWED_ORIGINS=https://your-domain.com
EOF
```

---

## BƯỚC 6 — Kiểm tra Pipeline chạy

Sau khi setup tất cả Secrets:

```bash
# Push bất kỳ thay đổi để trigger pipeline
git add .
git commit -m "test: trigger CI/CD pipeline"
git push origin main
```

Vào **GitHub → Actions** để xem pipeline chạy:
```
https://github.com/nguyenhoanghiep2005thd-svg/dev/actions
```

---

## Luồng Pipeline đầy đủ

```
git push main
     │
     ▼
┌─────────────────────────────────────────────┐
│  JOB 1: lint (~1 min)                       │
│  ✓ Validate docker-compose.yml              │
│  ✓ Check Dockerfile syntax                  │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│  JOB 2: build-and-push (~5-8 min)           │
│  ✓ Setup Docker Buildx                      │
│  ✓ Login Docker Hub                         │
│  ✓ Build backend image (multi-stage)        │
│  ✓ Build frontend image (multi-stage)       │
│  ✓ Push: latest + sha-xxxxxxx               │
│  ✓ GitHub Actions cache → build nhanh hơn  │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│  JOB 3: deploy (~2-3 min)                   │
│  ✓ SSH vào server                           │
│  ✓ git pull code mới                        │
│  ✓ docker compose pull images               │
│  ✓ Restart backend (không downtime)         │
│  ✓ Restart frontend                         │
│  ✓ Cleanup old images                       │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│  JOB 4: verify (~1 min)                     │
│  ✓ Health check frontend (HTTP 200)         │
│  ✓ Health check API (HTTP 200)              │
│  ✓ Deployment summary                       │
└─────────────────────────────────────────────┘

Tổng thời gian: ~10-12 phút
```

---

## Docker Hub images sau khi deploy

```
docker.io/YOUR_USERNAME/phonestore-backend:latest
docker.io/YOUR_USERNAME/phonestore-backend:sha-abc1234
docker.io/YOUR_USERNAME/phonestore-backend:main

docker.io/YOUR_USERNAME/phonestore-frontend:latest
docker.io/YOUR_USERNAME/phonestore-frontend:sha-abc1234
docker.io/YOUR_USERNAME/phonestore-frontend:main
```
