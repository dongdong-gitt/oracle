import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      membership?: string;
      phone?: string;
      role?: string;
      isGuest?: boolean;
    } & Session['user'];
    membership?: string;
  }

  interface User {
    id: string;
    membership?: string;
    phone?: string;
    role?: string;
    isGuest?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    membership?: string;
    phone?: string;
    role?: string;
    isGuest?: boolean;
  }
}
