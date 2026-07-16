import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080/api/v1/auth' });

const testAccounts = [
  'admin01',
  'dispatcher01',
  'driver01',
  'medic01',
  'provider01'
];
const password = '123456';
const newPassword = 'password123';

async function runTests() {
  console.log("🚀 BẮT ĐẦU CHẠY KIỂM THỬ TỰ ĐỘNG CÁC CHỨC NĂNG AUTH...\n");
  
  for (const username of testAccounts) {
    console.log(`====================================================`);
    console.log(` 👤 ĐANG TEST TÀI KHOẢN: ${username}`);
    console.log(`====================================================`);
    
    let accessToken = '';
    let refreshToken = '';
    let currentPassword = password;
    
    try {
      // 1. LOGIN
      console.log(`[1] Đang test Đăng nhập (Login)...`);
      const loginRes = await api.post('/login', { username, password: currentPassword });
      if (loginRes.data.success) {
        accessToken = loginRes.data.data.accessToken;
        refreshToken = loginRes.data.data.refreshToken;
        console.log(`  ✅ Login THÀNH CÔNG! (Roles: ${loginRes.data.data.roles.join(', ')})`);
      }

      // 2. REFRESH TOKEN
      console.log(`[2] Đang test Cấp lại Token (Refresh Token)...`);
      const refreshRes = await api.post('/refresh', { refreshToken });
      if (refreshRes.data.success) {
        accessToken = refreshRes.data.data.accessToken;
        refreshToken = refreshRes.data.data.refreshToken;
        console.log(`  ✅ Refresh Token THÀNH CÔNG!`);
      }

      // 3. CHANGE PASSWORD
      console.log(`[3] Đang test Đổi mật khẩu (Change Password)...`);
      const changePwdRes = await api.post('/change-password', {
        oldPassword: currentPassword,
        newPassword: newPassword
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (changePwdRes.data.success) {
        currentPassword = newPassword;
        console.log(`  ✅ Đổi mật khẩu THÀNH CÔNG!`);
      }

      // 4. LOGOUT
      console.log(`[4] Đang test Đăng xuất (Logout)...`);
      const logoutRes = await api.post('/logout', { refreshToken });
      if (logoutRes.data.success) {
        console.log(`  ✅ Logout THÀNH CÔNG!`);
      }

      // 5. FORGOT PASSWORD (OTP)
      console.log(`[5] Đang test Quên mật khẩu (Forgot Password - Send OTP)...`);
      const forgotRes = await api.post('/forgot-password', { identity: username });
      let otp = '';
      if (forgotRes.data.success) {
         otp = forgotRes.data.data; // API backend trả về thẳng OTP để test
         console.log(`  ✅ Đã gửi OTP THÀNH CÔNG! (Mã OTP: ${otp})`);
      }

      // 6. RESET PASSWORD (set back to 123456)
      console.log(`[6] Đang test Đặt lại mật khẩu (Reset Password - Khôi phục MK cũ)...`);
      const resetOtp = otp || "123456"; 
      const resetRes = await api.post('/reset-password', {
        identity: username,
        otpCode: resetOtp,
        newPassword: password
      });
      if (resetRes.data.success) {
         currentPassword = password;
         console.log(`  ✅ Khôi phục mật khẩu THÀNH CÔNG! (Mật khẩu đã về '123456')`);
      }

    } catch (error) {
      console.error(`  ❌ LỖI KHI TEST ${username}:`, error.response?.data?.message || error.message);
      
      // Fallback an toàn: Khôi phục lại mật khẩu mặc định nếu bị lỗi ngang chừng (do đã đổi password ở step 3)
      try {
         await api.post('/reset-password', {
            identity: username,
            otpCode: "123456", // Backend chấp nhận mã cố định 123456
            newPassword: password
         });
         console.log(`  ⚠️ Khôi phục khẩn cấp mật khẩu về '123456' THÀNH CÔNG!`);
      } catch (e) {}
    }
    console.log('\n');
  }
  
  console.log(`🎉 HOÀN TẤT KIỂM THỬ TỰ ĐỘNG TẤT CẢ CÁC ROLE!`);
}

runTests();
