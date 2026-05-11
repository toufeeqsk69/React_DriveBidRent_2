import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockFindById = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();
const mockChatFindOne = jest.fn();
const mockChatCreate = jest.fn();

const mockMessageFind = jest.fn();
const mockMessageCreate = jest.fn();
const mockMessageUpdateMany = jest.fn();
const mockMessageDeleteMany = jest.fn();

jest.unstable_mockModule('../models/Chat.js', () => ({
  default: {
    findById: mockFindById,
    findByIdAndUpdate: mockFindByIdAndUpdate,
    findByIdAndDelete: mockFindByIdAndDelete,
    findOne: mockChatFindOne,
    create: mockChatCreate,
    updateOne: jest.fn(),
  },
}));

jest.unstable_mockModule('../models/Message.js', () => ({
  default: {
    find: mockMessageFind,
    create: mockMessageCreate,
    updateMany: mockMessageUpdateMany,
    deleteMany: mockMessageDeleteMany,
    countDocuments: jest.fn(),
  },
}));

jest.unstable_mockModule('../models/RentalRequest.js', () => ({
  default: { findById: jest.fn() },
}));

jest.unstable_mockModule('../models/AuctionRequest.js', () => ({
  default: { findById: jest.fn() },
}));

const {
  getChatById,
  sendMessage,
  markMessagesRead,
  deleteChat,
} = await import('../controllers/chat.controller.js');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const leanValue = (value) => ({
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(value),
});

describe('chat.controller route handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('getChatById returns 404 when chat does not exist', async () => {
    mockFindById.mockReturnValue(leanValue(null));
    const req = { params: { chatId: 'c1' }, user: { _id: 'u1' } };
    const res = createRes();

    await getChatById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Chat not found' }));
  });

  it('getChatById returns 403 when requester is not a participant', async () => {
    mockFindById.mockReturnValue(
      leanValue({
        _id: 'c1',
        buyer: { _id: 'u2' },
        seller: { _id: 'u3' },
      })
    );
    const req = { params: { chatId: 'c1' }, user: { _id: 'u1' } };
    const res = createRes();

    await getChatById(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Access denied' }));
  });

  it('getChatById returns chat payload for allowed user', async () => {
    const chat = { _id: 'c1', buyer: { _id: 'u1' }, seller: { _id: 'u2' } };
    mockFindById.mockReturnValue(leanValue(chat));
    const req = { params: { chatId: 'c1' }, user: { _id: 'u1' } };
    const res = createRes();

    await getChatById(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ chat }),
      })
    );
  });

  it('sendMessage returns 400 when content is missing', async () => {
    const req = { params: { chatId: 'c1' }, body: { content: '   ' }, user: { _id: 'u1' } };
    const res = createRes();

    await sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Message content required' }));
  });

  it('sendMessage returns 404 when chat is not found', async () => {
    mockFindById.mockResolvedValue(null);
    const req = { params: { chatId: 'c1' }, body: { content: 'hello' }, user: { _id: 'u1' } };
    const res = createRes();

    await sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('sendMessage returns 403 for non participant', async () => {
    mockFindById.mockResolvedValue({ buyer: 'u2', seller: 'u3', expiresAt: '2099-01-01' });
    const req = { params: { chatId: 'c1' }, body: { content: 'hello' }, user: { _id: 'u1' } };
    const res = createRes();

    await sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Access denied' }));
  });

  it('sendMessage returns 403 when chat is expired', async () => {
    mockFindById.mockResolvedValue({ buyer: 'u1', seller: 'u2', expiresAt: '2000-01-01T00:00:00.000Z' });
    const req = { params: { chatId: 'c1' }, body: { content: 'hello' }, user: { _id: 'u1' } };
    const res = createRes();

    await sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Chat expired and read-only' }));
  });

  it('sendMessage creates message and updates chat metadata', async () => {
    mockFindById.mockResolvedValue({ buyer: 'u1', seller: 'u2', expiresAt: '2099-01-01T00:00:00.000Z' });
    const message = {
      _id: 'm1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      populate: jest.fn().mockResolvedValue(true),
    };
    mockMessageCreate.mockResolvedValue(message);

    const req = { params: { chatId: 'c1' }, body: { content: 'hello world' }, user: { _id: 'u1' } };
    const res = createRes();

    await sendMessage(req, res);

    expect(mockMessageCreate).toHaveBeenCalledWith(
      expect.objectContaining({ chat: 'c1', sender: 'u1', content: 'hello world' })
    );
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith('c1', expect.objectContaining({ lastMessage: 'hello world' }));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: message }));
  });

  it('markMessagesRead returns 404 when chat does not exist', async () => {
    mockFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    const req = { params: { chatId: 'c1' }, user: { _id: 'u1' } };
    const res = createRes();

    await markMessagesRead(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('markMessagesRead returns 403 when user has no access', async () => {
    mockFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ buyer: 'u2', seller: 'u3' }) });
    const req = { params: { chatId: 'c1' }, user: { _id: 'u1' } };
    const res = createRes();

    await markMessagesRead(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('markMessagesRead updates unread messages for participant', async () => {
    mockFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ buyer: 'u1', seller: 'u3' }) });
    mockMessageUpdateMany.mockResolvedValue({ modifiedCount: 3 });
    const req = { params: { chatId: 'c1' }, user: { _id: 'u1' } };
    const res = createRes();

    await markMessagesRead(req, res);

    expect(mockMessageUpdateMany).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, updated: 3 }));
  });

  it('deleteChat returns success when already deleted (race condition)', async () => {
    mockFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    const req = { params: { chatId: 'c1' }, user: { _id: 'u1' } };
    const res = createRes();

    await deleteChat(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('deleteChat returns 403 for non participant', async () => {
    mockFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ buyer: 'u2', seller: 'u3' }) });
    const req = { params: { chatId: 'c1' }, user: { _id: 'u1' } };
    const res = createRes();

    await deleteChat(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('deleteChat removes messages and chat for authorized user', async () => {
    mockFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ buyer: 'u1', seller: 'u2' }) });
    const req = { params: { chatId: 'c1' }, user: { _id: 'u1' } };
    const res = createRes();

    await deleteChat(req, res);

    expect(mockMessageDeleteMany).toHaveBeenCalledWith({ chat: 'c1' });
    expect(mockFindByIdAndDelete).toHaveBeenCalledWith('c1');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
