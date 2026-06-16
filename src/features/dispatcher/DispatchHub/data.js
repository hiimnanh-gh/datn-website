export const MOCK_PROVIDERS = [
  {
    id: "PROV-01",
    name: "115 Sài Gòn Emergency",
    fare: 1200000, // 1,200,000 VND
    commissionRate: 0.15, // 15%
    eta: "5 mins",
    distance: "1.5 km",
    rating: 4.8,
  },
  {
    id: "PROV-02",
    name: "Family Medical Practice Services",
    fare: 2500000, // 2,500,000 VND
    commissionRate: 0.18, // 18%
    eta: "8 mins",
    distance: "2.8 km",
    rating: 4.9,
  },
  {
    id: "PROV-03",
    name: "FV Hospital Ambulance",
    fare: 3000000, // 3,000,000 VND
    commissionRate: 0.20, // 20%
    eta: "11 mins",
    distance: "4.2 km",
    rating: 4.7,
  },
  {
    id: "PROV-04",
    name: "SOS Vietnam Rescue",
    fare: 1800000, // 1,800,000 VND
    commissionRate: 0.16, // 16%
    eta: "14 mins",
    distance: "5.5 km",
    rating: 4.5,
  },
];

export const INITIAL_INCIDENTS = [
  {
    id: "EMS-102",
    priority: "CRITICAL",
    category: "Cardiac Arrest",
    type: "Đặt cho người quen",
    timeAgo: "0m 45s",
    status: "Awaiting Dispatch",
    callerName: "Lê Thị Lan (Vợ)",
    callerPhone: "+84 901234521",
    victimName: "Nguyễn Văn Hùng",
    victimPhone: "0912345678",
    victimAddress: "123 Đường Cách Mạng Tháng 8, Phường 15, Quận 10, TP.HCM",
    victimConditions: "Đau ngực dữ dội, ngất xỉu, bất tỉnh, khó thở thoi thóp",
    genderAge: "MALE 55",
    providerSelected: null,
    transcription: [
      { time: "00:15", sender: "Caller", text: "Alo cứu hộ khẩn cấp phải không, chồng tôi tự nhiên lên cơn đau ngực rồi ngất xỉu giữa nhà rồi!" },
      { time: "00:22", sender: "Dispatcher", text: "Dạ chị bình tĩnh, ảnh còn tỉnh táo hay thở được không chị? Cho em xin địa chỉ chính xác ạ." },
      { time: "00:30", sender: "Caller", text: "Ảnh ngất xỉu bất tỉnh rồi, thở thoi thóp lắm. Nhà em ở 123 Đường Cách Mạng Tháng 8, Quận 10!" },
      { time: "00:38", sender: "Dispatcher", text: "Em đã tiếp nhận thông tin, đang tìm xe hỗ trợ. Chị có chọn đơn vị vận chuyển cứu hộ nào trước không?" },
      { time: "00:45", sender: "Caller", text: "Chưa, trước giờ tôi chưa đăng ký bên nào cả, có bên nào uy tín và giá cả hợp lý giới thiệu tôi gấp với!" }
    ]
  },
  {
    id: "EMS-103",
    priority: "URGENT",
    category: "Trauma (Fall)",
    type: "Đặt cho mình",
    timeAgo: "2m 12s",
    status: "Awaiting Dispatch",
    callerName: "Trần Minh Tâm",
    callerPhone: "+84 938765432",
    victimName: "Trần Minh Tâm",
    victimPhone: "+84 938765432",
    victimAddress: "Công viên Tao Đàn, Quận 1, TP.HCM",
    victimConditions: "Ngã gãy chân, nghi chấn thương đầu nhẹ, chảy máu đầu",
    genderAge: "MALE 28",
    providerSelected: "Family Medical Practice Services",
    transcription: [
      { time: "00:10", sender: "Caller", text: "Tôi vừa bị ngã xe ở trong khu vực Công viên Tao Đàn, chân đau lắm không đi nổi, đầu hơi chảy máu." },
      { time: "00:18", sender: "Dispatcher", text: "Nhận thông tin yêu cầu của anh. Anh có muốn chỉ định đơn vị cứu hộ cụ thể nào không?" },
      { time: "00:26", sender: "Caller", text: "Tôi có gói bảo hiểm của Family Medical Practice Services, chuyển tôi qua bên đó và gọi xe bên đó giúp tôi." },
      { time: "00:34", sender: "Dispatcher", text: "Vâng em ghi nhận thông tin, em sẽ chuyển tiếp thông tin và xác nhận xe của Family Medical cho anh ngay." }
    ]
  },
  {
    id: "EMS-104",
    priority: "STANDARD",
    category: "Severe Asthma Attack",
    type: "Đặt cho người quen",
    timeAgo: "5m 30s",
    status: "Awaiting Dispatch",
    callerName: "Nguyễn Minh Anh (Bạn)",
    callerPhone: "+84 902233445",
    victimName: "Phan Hoài Nam",
    victimPhone: "0987654321",
    victimAddress: "Phòng 402, Lô B, Cư xá Thanh Đa, Bình Thạnh, TP.HCM",
    victimConditions: "Lên cơn hen suyễn nặng, khó thở, tím tái môi, bình xịt hết thuốc",
    genderAge: "MALE 22",
    providerSelected: null,
    transcription: [
      { time: "00:12", sender: "Caller", text: "Bạn tôi đang bị lên cơn hen suyễn cấp tính rất nặng ở Cư xá Thanh Đa, có bình xịt nhưng đã hết thuốc rồi!" },
      { time: "00:20", sender: "Dispatcher", text: "Dạ em hiểu, bạn anh có còn tỉnh táo tự thở được không, và có cần xe hỗ trợ khẩn cấp từ bên nào không?" },
      { time: "00:28", sender: "Caller", text: "Đang tím tái môi hết rồi, rất khó thở. Bên nào đến nhanh nhất thì gọi giúp tôi đi!" }
    ]
  }
];
