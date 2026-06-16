export const FAQS = [
  {
    q: "Làm thế nào để thêm người dùng mới vào hệ thống?",
    a: 'Vào trang Personnel → nhấn nút "Add Member" ở góc trên phải → điền thông tin và gán role tương ứng.',
  },
  {
    q: "Tại sao xe cứu thương không hiển thị trên bản đồ?",
    a: "Kiểm tra kết nối GPS của xe trong phần Integrations. Đảm bảo module GPS đang bật và có sóng di động.",
  },
  {
    q: "Làm thế nào để xuất báo cáo sự cố?",
    a: 'Vào Incident Logs → lọc theo ngày và loại → nhấn "Export CSV" hoặc "Print Log".',
  },
  {
    q: "Điều gì xảy ra khi tất cả xe đều bận?",
    a: 'Hệ thống hiển thị cảnh báo "No Available Units". Dispatcher sẽ cần điều phối từ vùng lân cận hoặc huy động xe dự phòng.',
  },
  {
    q: "Làm thế nào để đặt lại mật khẩu cho tài khoản nhân viên?",
    a: "Vào Personnel → chọn nhân viên → Edit Profile → Reset Password. Hệ thống sẽ gửi email đặt lại.",
  },
];

export const TICKETS = [
  {
    id: "TK-201",
    title: "GPS module lost signal on AMB-18",
    priority: "High",
    status: "Open",
    created: "2026-06-09",
    assignee: "IT Support",
  },
  {
    id: "TK-198",
    title: "Dispatch notification not received",
    priority: "Medium",
    status: "In Progress",
    created: "2026-06-08",
    assignee: "Dev Team",
  },
  {
    id: "TK-195",
    title: "Export PDF rendering issues on Safari",
    priority: "Low",
    status: "Open",
    created: "2026-06-07",
    assignee: "Dev Team",
  },
  {
    id: "TK-190",
    title: "Hospital API timeout under load",
    priority: "High",
    status: "Resolved",
    created: "2026-06-04",
    assignee: "Backend",
  },
  {
    id: "TK-185",
    title: "Incorrect incident count on Dashboard",
    priority: "Medium",
    status: "Resolved",
    created: "2026-06-01",
    assignee: "Dev Team",
  },
];

export const PRIORITY_BADGE = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-gray-100 text-gray-600",
};

export const STATUS_BADGE = {
  Open: "bg-blue-100 text-blue-700",
  "In Progress": "bg-purple-100 text-purple-700",
  Resolved: "bg-green-100 text-green-700",
};
