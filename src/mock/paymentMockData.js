/**
 * Mock Data for Estimated Payment & Revenue Feature (SmartEMS)
 * Non-invasive, purely frontend mock data
 */

export const paymentTransactions = [
  {
    id: 1,
    missionId: "MS-00128",
    serviceType: "ALS",
    distanceKm: 12.0,
    baseFare: 200000,
    distanceFare: 216000,
    amount: 416000,
    status: "PENDING",
    completedAt: "26/08/2026 10:30"
  },
  {
    id: 2,
    missionId: "MS-00127",
    serviceType: "BLS",
    distanceKm: 8.5,
    baseFare: 100000,
    distanceFare: 102000,
    amount: 202000,
    status: "PENDING",
    completedAt: "26/08/2026 09:15"
  },
  {
    id: 3,
    missionId: "MS-00120",
    serviceType: "ALS",
    distanceKm: 15.0,
    baseFare: 200000,
    distanceFare: 270000,
    amount: 470000,
    status: "SUCCESS",
    completedAt: "25/08/2026 16:20"
  },
  {
    id: 4,
    missionId: "MS-00118",
    serviceType: "BLS",
    distanceKm: 6.0,
    baseFare: 100000,
    distanceFare: 72000,
    amount: 172000,
    status: "SUCCESS",
    completedAt: "25/08/2026 14:10"
  }
];

// Dynamically compute provider revenue summary to guarantee 100% data consistency
export const providerRevenueSummary = {
  estimatedRevenue: paymentTransactions.reduce((acc, t) => acc + t.amount, 0), // 1.260.000 ₫
  pendingPayment: paymentTransactions.filter(t => t.status === 'PENDING').reduce((acc, t) => acc + t.amount, 0), // 618.000 ₫
  paid: paymentTransactions.filter(t => t.status === 'SUCCESS').reduce((acc, t) => acc + t.amount, 0), // 642.000 ₫
};

export const adminPaymentSummary = {
  estimatedRevenue: 12500000,
  paid: 5000000,
  pending: 7500000,
  providers: [
    {
      id: 1,
      name: "Trung tâm Cấp cứu 115 Hoàn Kiếm (Provider A)",
      code: "PROV-A",
      pending: 5000000,
      paid: 2000000,
      total: 7000000
    },
    {
      id: 2,
      name: "Trung tâm Cấp cứu 115 Hai Bà Trưng (Provider B)",
      code: "PROV-B",
      pending: 2500000,
      paid: 3000000,
      total: 5500000
    }
  ]
};

export const missionPayment = {
  missionId: "MS-00128",
  paymentAmount: 416000,
  paymentStatus: "PENDING",
  serviceType: "ALS",
  distanceKm: 12.0,
  baseFare: 200000,
  distanceFare: 216000,
  completedAt: "26/08/2026 10:30"
};

/**
 * Calculate dynamic estimated fare breakdown based on service type and distance
 */
export const calculateEstimatedFare = (serviceType = 'BLS', distanceKm = 8.0) => {
  const normType = String(serviceType).toUpperCase();
  const isAls = normType.includes('ALS') || normType.includes('HỒI SỨC') || normType.includes('NÂNG CAO');
  const actualServiceType = isAls ? 'ALS' : 'BLS';
  const baseFare = isAls ? 200000 : 100000;
  const perKmRate = isAls ? 18000 : 12000;
  const validDistance = Math.max(1, Number(distanceKm) || 8.0);
  const distanceFare = Math.round(validDistance * perKmRate);
  const amount = baseFare + distanceFare;

  return {
    serviceType: actualServiceType,
    distanceKm: validDistance,
    baseFare,
    distanceFare,
    amount,
    status: 'PENDING'
  };
};

/**
 * Format number to Vietnamese Currency format (e.g. 416.000 ₫)
 */
export const formatVND = (val) => {
  if (val === null || val === undefined) return '0 ₫';
  return Number(val).toLocaleString('vi-VN') + ' ₫';
};

