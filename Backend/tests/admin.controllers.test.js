import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockUserCount = jest.fn();
const mockUserFind = jest.fn();

const mockRentalCostFind = jest.fn();
const mockRentalCostAggregate = jest.fn();
const mockRentalCostCount = jest.fn();

const mockPurchaseFind = jest.fn();
const mockPurchaseAggregate = jest.fn();
const mockPurchaseCount = jest.fn();

const mockAuctionBidFind = jest.fn();

const mockAuctionRequestFind = jest.fn();
const mockAuctionRequestAggregate = jest.fn();
const mockAuctionRequestCount = jest.fn();
const mockRentalRequestAggregate = jest.fn();
const mockRentalRequestCount = jest.fn();

jest.unstable_mockModule('../models/User.js', () => ({
  default: {
    countDocuments: mockUserCount,
    find: mockUserFind,
  },
}));

jest.unstable_mockModule('../models/RentalCost.js', () => ({
  default: {
    find: mockRentalCostFind,
    aggregate: mockRentalCostAggregate,
    countDocuments: mockRentalCostCount,
  },
}));

jest.unstable_mockModule('../models/Purchase.js', () => ({
  default: {
    find: mockPurchaseFind,
    aggregate: mockPurchaseAggregate,
    countDocuments: mockPurchaseCount,
  },
}));

jest.unstable_mockModule('../models/AuctionBid.js', () => ({
  default: {
    find: mockAuctionBidFind,
  },
}));

jest.unstable_mockModule('../models/AuctionRequest.js', () => ({
  default: {
    find: mockAuctionRequestFind,
    aggregate: mockAuctionRequestAggregate,
    countDocuments: mockAuctionRequestCount,
  },
}));

jest.unstable_mockModule('../models/RentalRequest.js', () => ({
  default: {
    countDocuments: mockRentalRequestCount,
    aggregate: mockRentalRequestAggregate,
  },
}));

jest.unstable_mockModule('../models/AuctionCost.js', () => ({
  default: {
    aggregate: jest.fn(),
  },
}));

const { default: dashboardControllers } = await import('../controllers/adminControllers/dashboard.controllers.js');
const { default: analyticsControllers } = await import('../controllers/adminControllers/analytics.controllers.js');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const chain = (value) => ({
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(value),
});

describe('selected admin controllers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    mockUserCount.mockResolvedValue(10);
    mockRentalCostFind.mockReturnValue(chain([]));
    mockPurchaseFind.mockReturnValue(chain([]));
    mockAuctionBidFind.mockReturnValue(chain([]));
    mockAuctionRequestFind.mockReturnValue(chain([]));
    mockUserFind.mockReturnValue(chain([]));

    mockAuctionRequestAggregate.mockResolvedValue([]);
    mockAuctionRequestCount.mockResolvedValue(0);
    mockRentalCostAggregate.mockResolvedValue([]);
    mockRentalCostCount.mockResolvedValue(0);
    mockPurchaseAggregate.mockResolvedValue([]);
    mockPurchaseCount.mockResolvedValue(0);
    mockRentalRequestAggregate.mockResolvedValue([]);
    mockRentalRequestCount.mockResolvedValue(0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('getAdminDashboard returns summary payload on success', async () => {
    mockUserCount
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(40)
      .mockResolvedValueOnce(30)
      .mockResolvedValueOnce(20);

    mockRentalCostFind.mockReturnValue(
      chain([{ totalCost: 1000, createdAt: new Date('2026-01-01') }])
    );

    mockPurchaseFind.mockReturnValue(
      chain([{ purchasePrice: 200000, purchaseDate: new Date('2026-01-02') }])
    );

    mockAuctionBidFind.mockReturnValue(chain([]));
    mockAuctionRequestFind.mockReturnValue(chain([]));
    mockUserFind.mockReturnValue(chain([]));

    const req = {};
    const res = createRes();

    await dashboardControllers.getAdminDashboard(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          totalUsers: 100,
          totalBuyers: 40,
          totalSellers: 30,
          totalMechanics: 20,
        }),
      })
    );
  });

  it('getAdminDashboard returns 500 on error', async () => {
    mockUserCount.mockRejectedValue(new Error('db fail'));
    const req = {};
    const res = createRes();

    await dashboardControllers.getAdminDashboard(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('getAnalytics returns success payload', async () => {
    mockUserCount
      .mockResolvedValueOnce(150)
      .mockResolvedValueOnce(50)
      .mockResolvedValueOnce(40)
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(5);

    mockAuctionRequestAggregate.mockResolvedValueOnce([{ name: 'SUV', value: 10 }]);
    mockAuctionRequestAggregate.mockResolvedValueOnce([{ name: 'Swift (hatchback)', value: 6 }]);
    mockAuctionRequestAggregate.mockResolvedValueOnce([{ name: 'Seller One', totalCarsListed: 9 }]);

    mockRentalCostAggregate
      .mockResolvedValueOnce([{ name: 'Rental Seller', totalRentalsListed: 4 }])
      .mockResolvedValueOnce([{ _id: null, total: 5000 }]);

    mockPurchaseAggregate
      .mockResolvedValueOnce([{ name: 'Top Buyer', totalPurchases: 3, totalSpent: 300000 }])
      .mockResolvedValueOnce([{ _id: null, total: 3000 }]);
    mockPurchaseCount.mockResolvedValueOnce(8);

    mockAuctionRequestCount
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(15)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(20);

    const req = {};
    const res = createRes();

    await analyticsControllers.getAnalytics(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          totalUsers: 150,
          userTypeDistribution: expect.any(Array),
          carTypeDistribution: expect.any(Array),
        }),
      })
    );
  });

  it('getAnalytics returns 500 on failure', async () => {
    mockUserCount.mockRejectedValue(new Error('analytics down'));
    const req = {};
    const res = createRes();

    await analyticsControllers.getAnalytics(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});
