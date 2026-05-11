import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockRentalFind = jest.fn();
const mockAuctionFind = jest.fn();

jest.unstable_mockModule('../models/RentalRequest.js', () => ({
  default: {
    find: mockRentalFind,
  },
}));

jest.unstable_mockModule('../models/AuctionRequest.js', () => ({
  default: {
    find: mockAuctionFind,
  },
}));

const { default: homeController } = await import('../controllers/home.controller.js');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('homeController.getHomeData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns top rentals and auctions', async () => {
    const topRentals = [{ _id: 'r1' }, { _id: 'r2' }];
    const topAuctions = [{ _id: 'a1' }, { _id: 'a2' }];

    const rentalLimit = jest.fn().mockResolvedValue(topRentals);
    const auctionLimit = jest.fn().mockResolvedValue(topAuctions);

    mockRentalFind.mockReturnValue({ sort: jest.fn().mockReturnValue({ limit: rentalLimit }) });
    mockAuctionFind.mockReturnValue({ sort: jest.fn().mockReturnValue({ limit: auctionLimit }) });

    const req = {};
    const res = createRes();

    await homeController.getHomeData(req, res);

    expect(mockRentalFind).toHaveBeenCalledWith({ status: 'available' });
    expect(mockAuctionFind).toHaveBeenCalledWith({ started_auction: 'yes' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: { topRentals, topAuctions },
      })
    );
  });

  it('returns 500 when rental query fails', async () => {
    mockRentalFind.mockImplementation(() => {
      throw new Error('db down');
    });

    const req = {};
    const res = createRes();

    await homeController.getHomeData(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        data: { topRentals: [], topAuctions: [] },
      })
    );
  });
});
