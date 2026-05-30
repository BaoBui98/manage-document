import dataSource from '../database/data-source';
import { User, UserRole } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function seedAdmin() {
  try {
    console.log('🔄 Đang kết nối Database...');
    await dataSource.initialize();
    console.log('✅ Đã kết nối Database.');
    
    const userRepo = dataSource.getRepository(User);
    
    // Kiểm tra xem hệ thống đã có tài khoản Admin nào chưa
    const existingAdmin = await userRepo.findOne({ where: { role: UserRole.ADMIN } });
    if (existingAdmin) {
      console.log(`⚠️ Admin đã tồn tại trong hệ thống (Email: ${existingAdmin.email}). Bỏ qua seed.`);
      return;
    }

    console.log('⏳ Không tìm thấy Admin, tiến hành tạo tài khoản Admin mặc định...');
    
    const saltOrRounds = 10;
    // Mật khẩu mặc định là: admin123
    const hashedPassword = await bcrypt.hash('admin123', saltOrRounds);

    const newAdmin = userRepo.create({
      username: 'admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      phone: '0123456789' // Có thể sửa lại nếu cần
    });

    await userRepo.save(newAdmin);
    console.log(`🎉 Đã tạo thành công Admin mặc định:`);
    console.log(`   - Email: admin@gmail.com`);
    console.log(`   - Pass:  admin123`);

  } catch (error) {
    console.error('❌ Lỗi khi chạy seed Admin:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Đã đóng kết nối Database.');
    }
  }
}

seedAdmin();
