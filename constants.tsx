
import { User, UserRole } from './types';

export const ADMIN_USER: User = {
  id: 'admin-001',
  username: 'Admin',
  email: 'admin@gmail.com',
  pin: '444488',
  role: UserRole.ADMIN,
  balance: 0,
  isBlocked: false,
  isDeleted: false,
  canCreateMatch: true,
  totalMatchesPaid: 0,
  createdAt: Date.now()
};

export const INITIAL_USERS: User[] = [
  ADMIN_USER,
  {
    id: 'user-001',
    username: 'PLAYER_ONE',
    email: 'player1@gmail.com',
    pin: '123456',
    role: UserRole.PLAYER,
    balance: 500,
    isBlocked: false,
    isDeleted: false,
    canCreateMatch: false,
    totalMatchesPaid: 10,
    createdAt: Date.now()
  }
];

export const I18N = {
  en: {
    dashboard: "GRID HUB",
    squad_builder: "SQUAD BUILDER",
    battle_results: "BATTLE RESULTS",
    combat_logs: "COMBAT LOGS",
    rankings: "RANKINGS",
    wallet: "GRID WALLET",
    notifications: "NOTIFICATIONS",
    logout: "LOGOUT SESSION",
    welcome: "WELCOME BACK",
    credits: "GRID CREDITS",
    status: "BATTLEFIELD STATUS",
    active: "ACTIVE",
    login_title: "Command Log-In",
    register_title: "Recruit Operative",
    sign_in: "SIGN IN",
    join_grid: "JOIN GRID",
    initialize_auth: "INITIALIZE AUTHENTICATION",
    deploy_unit: "DEPLOY UNIT TO GRID"
  },
  hi: {
    dashboard: "ग्रिड हब",
    squad_builder: "दस्ता बिल्डर",
    battle_results: "युद्ध परिणाम",
    combat_logs: "लड़ाई लॉग",
    rankings: "रैंकिंग",
    wallet: "ग्रिड वॉलेट",
    notifications: "सूचनाएं",
    logout: "लॉगआउट",
    welcome: "वापसी पर स्वागत है",
    credits: "ग्रिड क्रेडिट",
    status: "युद्धक्षेत्र की स्थिति",
    active: "सक्रिय",
    login_title: "कमांड लॉगिन",
    register_title: "ऑपरेटिव भर्ती",
    sign_in: "साइन इन करें",
    join_grid: "ग्रिड से जुड़ें",
    initialize_auth: "प्रमाणीकरण शुरू करें",
    deploy_unit: "ग्रिड पर तैनात करें"
  }
};

export const COLORS = {
  primary: '#ff4d00',
  secondary: '#00f2ea',
  background: '#030508',
  card: 'rgba(10, 15, 25, 0.6)',
  success: '#00f2ea',
  danger: '#ef4444',
  warning: '#ffea00'
};
