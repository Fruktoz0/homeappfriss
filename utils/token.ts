import { jwtDecode } from 'jwt-decode';
import type { DecodedToken, User } from '../types/user';

export function getUserFromToken(token: string): User | null {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return {
      id: decoded.id,
      email: decoded.email,
      displayName: decoded.displayName,
      isVerified: true, 
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}
