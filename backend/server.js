const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Load real live production data
const liveDataFile = path.join(__dirname, 'live_data.json');
let liveData = {};
if (fs.existsSync(liveDataFile)) {
  try {
    liveData = JSON.parse(fs.readFileSync(liveDataFile, 'utf8'));
    console.log(`[Data] Loaded real live production data for ${Object.keys(liveData).length} endpoints`);
  } catch (err) {
    console.error('[Data] Failed to parse live_data.json:', err);
  }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve frontend static files
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

// Route for /web/config
app.get('/web/config', (req, res) => {
  res.type('application/javascript');
  res.send(`window._domain={"checkApiDomain":false,"checkApk":false,"VITE_SAAS_API_URL":"","VITE_SAAS_JSON_URL":"","VITE_BAST_URL":"","VITE_API_URL":"http://localhost:${PORT}","pwaDomain":""};`);
});

// Helper for unified success responses
function success(data = {}, msg = 'success') {
  return {
    code: 0,
    msg,
    data
  };
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1. Registration State & Settings
app.post(['/api/webapi/RegisterState', '/api/webapi/registerstate'], (req, res) => {
  const base = (liveData.RegisterState && liveData.RegisterState.data) || {};
  res.json(success({
    ...base,
    registerState: "1",
    registerMobileState: "1",
    registerEmailState: "1",
    registerSMSState: "0",
    isOpenRegisterSMS: "0",
    isOpenRegisterEmail: "0",
    isOpenRegisterCaptcha: "0",
    isOpenCaptcha: "0",
    isInvitecode: "1",
    registerPrivacyChecked: "1",
    registerStateMsg: ""
  }));
});

// 2. Home Settings
app.post(['/api/webapi/GetHomeSettings', '/api/webapi/gethomesettings'], (req, res) => {
  if (liveData.GetHomeSettings) {
    return res.json(liveData.GetHomeSettings);
  }
  res.json(success({
    isOpenVoice: "1",
    isOpenLotteryVoice: "1",
    homeCustomerServiceUrl: "",
    isOpenPWA: "0",
    areaPhoneLenList: [{ area: "+91", len: "10" }],
    isOpenRegisterPhoneFirstZeroSwitch: false
  }));
});

// 3. Game Categories (Popular, Lottery, Slot, Sport, Video, Chess, etc.)
app.post(['/api/webapi/GetGameCategoryList', '/api/webapi/getgamecategorylist'], (req, res) => {
  if (liveData.GetGameCategoryList) {
    return res.json(liveData.GetGameCategoryList);
  }
  res.json(success([]));
});

// 4. All Games Catalog
app.post(['/api/webapi/GetAllGameList', '/api/webapi/getallgamelist'], (req, res) => {
  if (liveData.GetAllGameList) {
    return res.json(liveData.GetAllGameList);
  }
  res.json(success({}));
});

// 5. Lottery Categories
app.post(['/api/webapi/GetLotteryCategoryList', '/api/webapi/getlotterycategorylist'], (req, res) => {
  if (liveData.GetLotteryCategoryList) {
    return res.json(liveData.GetLotteryCategoryList);
  }
  res.json(success([]));
});

// 6. Third Party Games
app.post(['/api/webapi/GetThirdGameList', '/api/webapi/getthirdgamelist'], (req, res) => {
  if (liveData.GetThirdGameList) {
    return res.json(liveData.GetThirdGameList);
  }
  res.json(success({ gameLists: [], gameCustomTypeLists: [] }));
});

// 7. Banners
app.post(['/api/webapi/GetBannerList', '/api/webapi/getbannerlist', '/api/webapi/GetBannerTypeList'], (req, res) => {
  if (liveData.GetBannerList) {
    return res.json(liveData.GetBannerList);
  }
  res.json(success([]));
});

// 8. Daily Profit Ranking & Winning Feed
app.post(['/api/webapi/GetDailyProfitRank', '/api/webapi/getdailyprofitrank'], (req, res) => {
  if (liveData.GetDailyProfitRank) {
    return res.json(liveData.GetDailyProfitRank);
  }
  res.json(success({ dataList: [], penarikanList: [] }));
});

// 9. Site Announcements & Marquee Messages
app.post(['/api/webapi/GetSiteMessageList', '/api/webapi/getsitemessagelist'], (req, res) => {
  if (liveData.GetSiteMessageList) {
    return res.json(liveData.GetSiteMessageList);
  }
  res.json(success({ list: [], total: 0 }));
});

// 10. Loaded Setting
app.post(['/api/webapi/GetLoadedSetting', '/api/webapi/getloadedsetting'], (req, res) => {
  if (liveData.GetLoadedSetting) {
    return res.json(liveData.GetLoadedSetting);
  }
  res.json(success({ needPopupFirstRecharge: true }));
});

// 10b. First Recharge List for Bonus Dialog
app.post(['/api/webapi/GetFirstRechargeList', '/api/webapi/getfirstrechargelist'], (req, res) => {
  if (liveData.GetFirstRechargeList) {
    return res.json(liveData.GetFirstRechargeList);
  }
  res.json(success([
    { id: 1, rechargeAmount: 200, rewardAmount: 18, canReceive: false, isFinshed: false },
    { id: 2, rechargeAmount: 500, rewardAmount: 58, canReceive: false, isFinshed: false },
    { id: 3, rechargeAmount: 1000, rewardAmount: 108, canReceive: false, isFinshed: false },
    { id: 4, rechargeAmount: 3000, rewardAmount: 288, canReceive: false, isFinshed: false }
  ]));
});

// 11. Activities
app.post(['/api/webapi/GetActivityList', '/api/webapi/getactivitylist'], (req, res) => {
  if (liveData.GetActivityList) {
    return res.json(liveData.GetActivityList);
  }
  res.json(success({ list: [] }));
});

// 12. PWA Domain List
app.post(['/api/webapi/GetPwaDomainList', '/api/webapi/getpwadomainlist'], (req, res) => {
  res.json(success([]));
});

// 13. Coupons & Agreements
app.post(['/api/webapi/GetInvitationNoAuthCouponByNum', '/api/webapi/getinvitationnoauthcouponbynum', '/api/webapi/GetCurrentUnReceivedCoupon'], (req, res) => {
  res.json(success(null));
});

app.post(['/api/webapi/GetAgreement', '/api/webapi/getagreement'], (req, res) => {
  res.json(success({ agreement: "Welcome to RAXI. Play responsibly." }));
});

// 14. Auth: Register
app.post(['/api/webapi/Register', '/api/webapi/register'], (req, res) => {
  const body = req.body || {};
  const phone = body.mobile || body.phone || body.username || `user_${Date.now()}`;
  const password = body.password || body.pwd || '123456';
  const invitationCode = body.invitationCode || body.inviteCode || body.invitecode || '44128111216';

  let user = db.findUserByPhone(phone);
  const token = `raxi_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const refreshToken = `raxi_refresh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  if (!user) {
    user = db.createUser({
      phone,
      password,
      invitation_code: invitationCode,
      token,
      refresh_token: refreshToken
    });
  } else {
    user = db.updateUserToken(phone, token, refreshToken);
  }

  res.json(success({
    token: user.token,
    refreshToken: user.refresh_token,
    userId: String(user.id),
    parentUserId: 0,
    userName: `Mem_${user.phone.slice(-4) || 'VIP'}`,
    avatar: '1',
    vipLevel: user.vip_level || 1,
    balance: user.balance || 10000.0,
    webSocketUrl: '',
    webSocketChannels: [],
    tokenExpireAt: Date.now() + 86400000 * 30
  }, 'Registration successful'));
});

// 15. Auth: Login
app.post(['/api/webapi/Login', '/api/webapi/login'], (req, res) => {
  const body = req.body || {};
  const phone = body.mobile || body.phone || body.username || '';
  const password = body.password || body.pwd || '';

  let user = db.findUserByPhone(phone);
  const token = `raxi_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const refreshToken = `raxi_refresh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  if (!user) {
    user = db.createUser({
      phone: phone || `user_${Date.now()}`,
      password,
      invitation_code: '44128111216',
      token,
      refresh_token: refreshToken
    });
  } else {
    user = db.updateUserToken(phone, token, refreshToken);
  }

  res.json(success({
    token: user.token,
    refreshToken: user.refresh_token,
    userId: String(user.id),
    parentUserId: 0,
    userName: `Mem_${user.phone.slice(-4) || 'VIP'}`,
    avatar: '1',
    vipLevel: user.vip_level || 1,
    balance: user.balance || 10000.0,
    webSocketUrl: '',
    webSocketChannels: [],
    tokenExpireAt: Date.now() + 86400000 * 30
  }, 'Login successful'));
});

// 16. Auth: Logout & Token Refresh
app.post(['/api/webapi/LoginOff', '/api/webapi/loginoff'], (req, res) => {
  res.json(success({}, 'Logged out successfully'));
});

app.post(['/api/webapi/RefreshToken', '/api/webapi/refreshtoken'], (req, res) => {
  const token = `raxi_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  res.json(success({
    token,
    refreshToken: token,
    tokenExpireAt: Date.now() + 86400000 * 30,
    webSocketUrl: '',
    webSocketChannels: []
  }));
});

// 17. User Profile
app.post(['/api/webapi/GetUserInfo', '/api/webapi/getuserinfo'], (req, res) => {
  const authHeader = req.headers.authorization || '';
  let user = db.findUserByToken(authHeader);

  if (!user) {
    user = {
      id: 1001,
      phone: '7061121632',
      vip_level: 1,
      balance: 10000.0,
      invitation_code: '44128111216'
    };
  }

  res.json(success({
    userId: String(user.id),
    userName: `Mem_${String(user.phone).slice(-4)}`,
    mobile: user.phone,
    avatar: '1',
    vipLevel: user.vip_level || 1,
    balance: user.balance || 10000.0,
    totalBalance: user.balance || 10000.0,
    userType: 1,
    invitationCode: user.invitation_code || '44128111216',
    isRealName: 0,
    email: user.email || '',
    creditScore: 100,
    rechargeAmount: 10000.0
  }));
});

// 18. Wallet & Balance
app.post([
  '/api/webapi/GetBalance',
  '/api/webapi/GetAllwallets',
  '/api/webapi/GetSaasAllwallets',
  '/api/webapi/GetARGameAndPlatWallets'
], (req, res) => {
  const authHeader = req.headers.authorization || '';
  const user = db.findUserByToken(authHeader) || { balance: 10000.0 };

  res.json(success({
    balance: user.balance || 10000.0,
    totalBalance: user.balance || 10000.0,
    withdrawBalance: user.balance || 10000.0,
    safeBalance: 0.0,
    wallets: [
      { id: 1, name: 'Main Wallet', balance: user.balance || 10000.0 },
      { id: 2, name: 'Lottery Wallet', balance: 0.0 }
    ]
  }));
});

// 19. SMS / Verification Codes
app.post([
  '/api/webapi/SmsVerifyCode',
  '/api/webapi/VerifyPhoneCode',
  '/api/webapi/EmailVerifyCode',
  '/api/webapi/VerifyEmailCode'
], (req, res) => {
  res.json(success({ verifyCode: '123456' }, 'Code sent: 123456'));
});

// 20. Universal API Mock Fallback
app.all('/api/webapi/*', (req, res) => {
  console.log(`[API Fallback] ${req.method} ${req.originalUrl}`);
  res.json(success({}, 'success'));
});

// SPA Fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/assets')) {
    return next();
  }
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` RAXI CLONE SERVER RUNNING LOCALLY ON YOUR LAPTOP `);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(`=================================================`);
});
