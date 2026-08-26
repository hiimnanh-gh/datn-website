import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFinanceStore = create(
  persist(
    (set, get) => ({
      // System Policy Settings
      settings: {
        minWalletBalance: 1000000, // 1,000,000 VND minimum balance threshold
        commissionRate: 0.10,      // 10% platform commission rate
        blsBasePrice: 500000,      // BLS base price (includes 5km)
        blsPerKmPrice: 20000,      // BLS price per km after 5km
        alsBasePrice: 1200000,     // ALS base price (includes 5km)
        alsPerKmPrice: 30000,      // ALS price per km after 5km
        doctorFee: 500000,         // Specialist doctor surcharge
        nurseFee: 300000,          // Nurse surcharge
        nightSurcharge: 200000,    // Night surcharge (22h - 6h)
      },

      // Mock Driver Wallets
      driverWallets: [
        {
          id: 1,
          driverName: 'Phan Văn Nam',
          phone: '0904000001',
          resourceCode: 'AMB-HK-001',
          providerId: 1,
          providerName: 'Trung tâm Cấp cứu 115 Hoàn Kiếm',
          serviceType: 'Xe cấp cứu cơ bản (BLS)',
          balance: 1500000,
          totalCompletedTrips: 18,
          totalTripRevenue: 42000000,
          totalCommissionPaid: 4200000,
          updatedAt: '2026-08-26 12:30',
        },
        {
          id: 2,
          driverName: 'Dương Văn Long',
          phone: '0904000002',
          resourceCode: 'AMB-HBT-001',
          providerId: 2,
          providerName: 'Trung tâm Cấp cứu 115 Hai Bà Trưng',
          serviceType: 'Xe cấp cứu cơ bản (BLS)',
          balance: 850000, // < 1,000,000 -> Below threshold!
          totalCompletedTrips: 12,
          totalTripRevenue: 28000000,
          totalCommissionPaid: 2800000,
          updatedAt: '2026-08-26 11:15',
        },
        {
          id: 3,
          driverName: 'Lý Thị Mai',
          phone: '0904000003',
          resourceCode: 'AMB-CG-001',
          providerId: 3,
          providerName: 'Trung tâm Cấp cứu 115 Cầu Giấy',
          serviceType: 'Xe hồi sức nâng cao (ALS)',
          balance: 2800000,
          totalCompletedTrips: 24,
          totalTripRevenue: 75000000,
          totalCommissionPaid: 7500000,
          updatedAt: '2026-08-26 13:00',
        },
        {
          id: 4,
          driverName: 'Bùi Văn Linh',
          phone: '0904000004',
          resourceCode: 'AMB-HK-002',
          providerId: 1,
          providerName: 'Trung tâm Cấp cứu 115 Hoàn Kiếm',
          serviceType: 'Xe cấp cứu cơ bản (BLS)',
          balance: 450000, // < 1,000,000 -> Below threshold!
          totalCompletedTrips: 8,
          totalTripRevenue: 18000000,
          totalCommissionPaid: 1800000,
          updatedAt: '2026-08-25 18:40',
        },
        {
          id: 5,
          driverName: 'Hoàng Quốc Bảo',
          phone: '0904000005',
          resourceCode: 'AMB-TX-001',
          providerId: 4,
          providerName: 'Trung tâm Cấp cứu 115 Thanh Xuân',
          serviceType: 'Xe hồi sức nâng cao (ALS)',
          balance: 1950000,
          totalCompletedTrips: 15,
          totalTripRevenue: 48000000,
          totalCommissionPaid: 4800000,
          updatedAt: '2026-08-26 10:20',
        },
      ],

      // Mock Transaction Feed (Commission deductions and Top-ups)
      transactions: [
        {
          id: 'TXN-20260826-005',
          type: 'COMMISSION_DEDUCT', // Hoa hồng trừ từ ví
          requestId: 3,
          requestCode: 'REQ-3',
          missionCode: 'MSN-103',
          driverId: 1,
          driverName: 'Phan Văn Nam',
          resourceCode: 'AMB-HK-001',
          providerName: 'Trung tâm Cấp cứu 115 Hoàn Kiếm',
          totalTripFare: 3000000,
          commissionRate: 0.10,
          amount: 300000, // Tiền hoa hồng sàn thu
          driverEarnings: 2700000,
          paymentMethod: 'CASH', // Khách trả tiền mặt trực tiếp
          status: 'SUCCESS',
          walletBalanceAfter: 1500000,
          timestamp: '2026-08-26 12:30:15',
          note: 'Trừ 10% hoa hồng ca cấp cứu REQ-3 (Hồ Hoàn Kiếm)',
        },
        {
          id: 'TXN-20260826-004',
          type: 'WALLET_TOPUP', // Nạp tiền vào ví
          driverId: 1,
          driverName: 'Phan Văn Nam',
          resourceCode: 'AMB-HK-001',
          providerName: 'Trung tâm Cấp cứu 115 Hoàn Kiếm',
          amount: 500000,
          paymentMethod: 'BANK_TRANSFER',
          status: 'SUCCESS',
          walletBalanceAfter: 1800000,
          timestamp: '2026-08-26 09:15:00',
          note: 'Nạp tiền ký quỹ ví tài xế qua chuyển khoản ngân hàng',
        },
        {
          id: 'TXN-20260826-003',
          type: 'COMMISSION_DEDUCT',
          requestId: 2,
          requestCode: 'REQ-2',
          missionCode: 'MSN-102',
          driverId: 2,
          driverName: 'Dương Văn Long',
          resourceCode: 'AMB-HBT-001',
          providerName: 'Trung tâm Cấp cứu 115 Hai Bà Trưng',
          totalTripFare: 1500000,
          commissionRate: 0.10,
          amount: 150000,
          driverEarnings: 1350000,
          paymentMethod: 'DIRECT_QR',
          status: 'SUCCESS',
          walletBalanceAfter: 850000,
          timestamp: '2026-08-26 11:15:22',
          note: 'Trừ 10% hoa hồng ca cấp cứu REQ-2 (Bạch Mai)',
        },
        {
          id: 'TXN-20260825-002',
          type: 'COMMISSION_DEDUCT',
          requestId: 1,
          requestCode: 'REQ-1',
          missionCode: 'MSN-101',
          driverId: 3,
          driverName: 'Lý Thị Mai',
          resourceCode: 'AMB-CG-001',
          providerName: 'Trung tâm Cấp cứu 115 Cầu Giấy',
          totalTripFare: 2200000,
          commissionRate: 0.10,
          amount: 220000,
          driverEarnings: 1980000,
          paymentMethod: 'CASH',
          status: 'SUCCESS',
          walletBalanceAfter: 2800000,
          timestamp: '2026-08-25 16:45:10',
          note: 'Trừ 10% hoa hồng ca cấp cứu REQ-1 (Cầu Giấy)',
        },
        {
          id: 'TXN-20260825-001',
          type: 'COMMISSION_DEDUCT',
          requestId: 8,
          requestCode: 'REQ-8',
          missionCode: 'MSN-100',
          driverId: 4,
          driverName: 'Bùi Văn Linh',
          resourceCode: 'AMB-HK-002',
          providerName: 'Trung tâm Cấp cứu 115 Hoàn Kiếm',
          totalTripFare: 1800000,
          commissionRate: 0.10,
          amount: 180000,
          driverEarnings: 1620000,
          paymentMethod: 'CASH',
          status: 'SUCCESS',
          walletBalanceAfter: 450000,
          timestamp: '2026-08-25 18:40:05',
          note: 'Trừ 10% hoa hồng ca cấp cứu REQ-8 (Hai Bà Trưng)',
        },
      ],

      // Actions
      topUpDriverWallet: (driverId, amount, paymentMethod = 'BANK_TRANSFER') => {
        const numAmount = Number(amount) || 0;
        if (numAmount <= 0) return false;

        set((state) => {
          const targetDriver = state.driverWallets.find((d) => d.id === driverId);
          if (!targetDriver) return state;

          const newBalance = targetDriver.balance + numAmount;
          const updatedWallets = state.driverWallets.map((d) =>
            d.id === driverId
              ? {
                  ...d,
                  balance: newBalance,
                  updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                }
              : d
          );

          const newTxn = {
            id: 'TXN-' + Date.now(),
            type: 'WALLET_TOPUP',
            driverId: targetDriver.id,
            driverName: targetDriver.driverName,
            resourceCode: targetDriver.resourceCode,
            providerName: targetDriver.providerName,
            amount: numAmount,
            paymentMethod,
            status: 'SUCCESS',
            walletBalanceAfter: newBalance,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            note: `Nạp ${numAmount.toLocaleString('vi-VN')} đ ký quỹ ví tài xế qua ${paymentMethod}`,
          };

          return {
            driverWallets: updatedWallets,
            transactions: [newTxn, ...state.transactions],
          };
        });

        return true;
      },

      // Complete a trip: subtract commission from driver, record transaction
      completeTripAndDeduct: (tripData) => {
        const {
          requestId,
          requestCode = `REQ-${requestId}`,
          driverId,
          totalTripFare,
          paymentMethod = 'CASH',
          note,
        } = tripData;

        const state = get();
        const driver = state.driverWallets.find((d) => d.id === driverId);
        if (!driver) return false;

        const commissionRate = state.settings.commissionRate;
        const commissionAmount = Math.round(totalTripFare * commissionRate);
        const driverEarnings = totalTripFare - commissionAmount;
        const newBalance = driver.balance - commissionAmount;

        const updatedWallets = state.driverWallets.map((d) =>
          d.id === driverId
            ? {
                ...d,
                balance: newBalance,
                totalCompletedTrips: d.totalCompletedTrips + 1,
                totalTripRevenue: d.totalTripRevenue + totalTripFare,
                totalCommissionPaid: d.totalCommissionPaid + commissionAmount,
                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              }
            : d
        );

        const newTxn = {
          id: 'TXN-' + Date.now(),
          type: 'COMMISSION_DEDUCT',
          requestId,
          requestCode,
          missionCode: `MSN-${Math.floor(100 + Math.random() * 900)}`,
          driverId: driver.id,
          driverName: driver.driverName,
          resourceCode: driver.resourceCode,
          providerName: driver.providerName,
          totalTripFare,
          commissionRate,
          amount: commissionAmount,
          driverEarnings,
          paymentMethod,
          status: 'SUCCESS',
          walletBalanceAfter: newBalance,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          note: note || `Trừ ${(commissionRate * 100).toFixed(0)}% hoa hồng ca ${requestCode}`,
        };

        set({
          driverWallets: updatedWallets,
          transactions: [newTxn, ...state.transactions],
        });

        return true;
      },

      // Update System Policy Settings
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        }));
      },

      // Helper to calculate EMS Fare Breakdown
      calculateFareEstimate: ({ serviceType = 'BLS', distanceKm = 10, hasDoctor = false, hasNurse = false, isNight = false }) => {
        const { settings } = get();
        const isAls = serviceType === 'ALS';
        const basePrice = isAls ? settings.alsBasePrice : settings.blsBasePrice;
        const perKmPrice = isAls ? settings.alsPerKmPrice : settings.blsPerKmPrice;

        const extraKm = Math.max(0, distanceKm - 5);
        let distanceFee = 0;

        if (extraKm > 0) {
          if (distanceKm <= 30) {
            distanceFee = extraKm * perKmPrice;
          } else {
            // Tiered: 5km to 30km standard, >30km discounted rate (-25%)
            const normalExtra = 25 * perKmPrice;
            const longDistanceKm = distanceKm - 30;
            const discountedPerKm = perKmPrice * 0.75;
            distanceFee = normalExtra + longDistanceKm * discountedPerKm;
          }
        }

        const doctorFee = hasDoctor ? settings.doctorFee : 0;
        const nurseFee = hasNurse ? settings.nurseFee : 0;
        const nightFee = isNight ? settings.nightSurcharge : 0;

        const totalFare = Math.round(basePrice + distanceFee + doctorFee + nurseFee + nightFee);
        const commissionAmount = Math.round(totalFare * settings.commissionRate);
        const driverEarnings = totalFare - commissionAmount;

        return {
          basePrice,
          includedKm: 5,
          extraKm,
          distanceFee,
          doctorFee,
          nurseFee,
          nightFee,
          totalFare,
          commissionRate: settings.commissionRate,
          commissionAmount,
          driverEarnings,
        };
      },
    }),
    {
      name: 'smartems-finance-storage',
    }
  )
);

export default useFinanceStore;
