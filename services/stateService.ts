
import { User, Match, Transaction, AppNotification, MatchPlayer } from '../types.ts';

// The URL of your Render backend. 
// Removed trailing /api to prevent double prefixing in requests
const API_BASE = (import.meta as any).env?.VITE_API_URL;

class StateService {
  private async request(path: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but received:', text.substring(0, 100));
        throw new Error(`Server returned non-JSON response (${response.status})`);
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Network Protocol Failure');
      }
      return data;
    } catch (err: any) {
      console.error('Request failed:', path, err);
      throw err;
    }
  }

  async login(email: string, pin: string): Promise<User> {
    return this.request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, pin }),
    });
  }

  async getUsers(includeDeleted = false): Promise<User[]> {
    const users = await this.request('/api/users');
    return includeDeleted ? users : users.filter((u: User) => !u.isDeleted);
  }

  async getUserById(id: string): Promise<User | undefined> {
    const users = await this.getUsers();
    return users.find(u => u.id === id || (u as any)._id === id);
  }

  async addUser(user: Partial<User>): Promise<User> {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: string, updates: Partial<User>) {
    return this.request(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isDeleted: true }),
    });
  }

  async resetPassword(adminId: string, userId: string, pin: string) {
    return this.request(`/api/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ pin }),
    });
  }

  async adminAdjustBalance(adminId: string, userId: string, amount: number, description: string) {
    return this.request(`/api/users/${userId}/adjust`, {
      method: 'POST',
      body: JSON.stringify({ amount, description, adminId }),
    });
  }

  async getMatches(): Promise<Match[]> {
    return this.request('/api/matches');
  }

  async createMatch(name: string, teamA: MatchPlayer[], teamB: MatchPlayer[], creatorId: string): Promise<Match> {
    return this.request('/api/matches', {
      method: 'POST',
      body: JSON.stringify({ name, teamA, teamB, creatorId }),
    });
  }

  async settleMatch(matchId: string, winningTeam: 'A' | 'B'): Promise<Match> {
    return this.request(`/api/matches/${matchId}/settle`, {
      method: 'PATCH',
      body: JSON.stringify({ winningTeam }),
    });
  }

  async markLoserAsPaid(matchId: string, userId: string) {
    return this.request(`/api/matches/${matchId}/pay/${userId}`, {
      method: 'POST',
    });
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    return this.request(`/api/transactions/${userId}`);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return this.request('/api/transactions');
  }

  async getNotifications(userId: string): Promise<AppNotification[]> {
    return this.request(`/api/notifications/${userId}`);
  }

  async markAllNotificationsRead(userId: string) {
    return this.request(`/api/notifications/${userId}/read`, { method: 'POST' });
  }
}

export const stateService = new StateService();
