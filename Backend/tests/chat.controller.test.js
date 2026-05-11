import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockChatFindOne = jest.fn();
const mockChatCreate = jest.fn();
const mockChatUpdateOne = jest.fn();

jest.unstable_mockModule('../models/Chat.js', () => ({
  default: {
    findOne: mockChatFindOne,
    create: mockChatCreate,
    updateOne: mockChatUpdateOne,
  },
}));

jest.unstable_mockModule('../models/Message.js', () => ({
  default: {
    countDocuments: jest.fn(),
    find: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

jest.unstable_mockModule('../models/RentalRequest.js', () => ({
  default: {
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule('../models/AuctionRequest.js', () => ({
  default: {
    findById: jest.fn(),
  },
}));

const {
  createChatForRental,
  createChatForAuction,
  expireInspectionChat,
} = await import('../controllers/chat.controller.js');

describe('chat controller utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createChatForRental returns null when rental payload is invalid', async () => {
    await expect(createChatForRental(null)).resolves.toBeNull();
    await expect(createChatForRental({})).resolves.toBeNull();
  });

  it('createChatForRental returns existing chat if found', async () => {
    const existing = { _id: 'chat-existing' };
    const rental = { _id: 'r1', buyerId: 'b1', sellerId: 's1', vehicleName: 'Swift' };
    mockChatFindOne.mockResolvedValue(existing);

    const result = await createChatForRental(rental);

    expect(mockChatFindOne).toHaveBeenCalledWith({ rentalRequest: 'r1' });
    expect(result).toEqual(existing);
    expect(mockChatCreate).not.toHaveBeenCalled();
  });

  it('createChatForRental creates a chat when none exists', async () => {
    const rental = {
      _id: 'r2',
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      vehicleName: 'City',
      dropDate: '2026-01-10T00:00:00.000Z',
    };
    const created = { _id: 'chat-new' };

    mockChatFindOne.mockResolvedValue(null);
    mockChatCreate.mockResolvedValue(created);

    const result = await createChatForRental(rental);

    expect(result).toEqual(created);
    expect(mockChatCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'rental',
        rentalRequest: 'r2',
        buyer: 'buyer-1',
        seller: 'seller-1',
        title: 'Rental: City',
      })
    );
  });

  it('createChatForAuction creates a chat with winner and seller', async () => {
    const auction = {
      _id: 'a1',
      sellerId: 'seller-2',
      vehicleName: 'Creta',
      finalPurchasePrice: 950000,
    };
    const winnerId = 'buyer-2';
    const soldAt = new Date('2026-01-01T00:00:00.000Z');
    const created = { _id: 'chat-auction' };

    mockChatFindOne.mockResolvedValue(null);
    mockChatCreate.mockResolvedValue(created);

    const result = await createChatForAuction(auction, winnerId, soldAt);

    expect(result).toEqual(created);
    expect(mockChatCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'auction',
        auctionRequest: 'a1',
        buyer: 'buyer-2',
        seller: 'seller-2',
        finalPrice: 950000,
        title: 'Auction Won: Creta',
      })
    );
  });

  it('expireInspectionChat updates chat expiry and returns update result', async () => {
    const updateResult = { acknowledged: true, modifiedCount: 1 };
    mockChatUpdateOne.mockResolvedValue(updateResult);

    const result = await expireInspectionChat('auction-44');

    expect(mockChatUpdateOne).toHaveBeenCalledWith(
      { inspectionTask: 'auction-44', type: 'inspection' },
      { expiresAt: expect.any(Date) }
    );
    expect(result).toEqual(updateResult);
  });
});
