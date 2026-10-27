export interface Room {
  id: string;
  name: string;
  blocked: boolean;
}

export interface Booking {
  id: string;
  roomId: string;
  start: number;
  end: number;
  title: string;
}

export interface CheckResult {
  available: boolean;
  reason: string;
}
