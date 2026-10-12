const fs = require('fs');
const path = require('path');

// Cache live data in memory
let liveData = null;
function getLiveData() {
  if (!liveData) {
    try {
      const dataPath = path.join(__dirname, '..', 'live_data.json');
      if (fs.existsSync(dataPath)) {
        liveData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      } else {
        liveData = {};
      }
    } catch (e) {
      console.error('[API] Failed to read live_data.json:', e);
      liveData = {};
    }
  }
  return liveData;
}

function success(data = {}, msg = 'success') {
  return {
    code: 0,
    msg,
    data
  };
}

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse path
  const urlPath = req.url.split('?')[0];
  const endpoint = urlPath.split('/').filter(Boolean).pop() || '';
  const endpointLower = endpoint.toLowerCase();

  const dataMap = getLiveData();

  // 1. Specific Handlers
  if (endpointLower === 'registerstate') {
    const base = (dataMap.RegisterState && dataMap.RegisterState.data) || {};
    return res.status(200).json(success({
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
  }

  // 2. Check exact match in live_data.json (case-insensitive)
  for (const key of Object.keys(dataMap)) {
    if (key.toLowerCase() === endpointLower) {
      return res.status(200).json(dataMap[key]);
    }
  }

  if (endpointLower === 'register' || endpointLower === 'login') {
    const body = req.body || {};
    const phone = body.mobile || body.phone || body.username || '7061121632';
    const token = `raxi_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const refreshToken = `raxi_refresh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return res.status(200).json(success({
      token,
      refreshToken,
      userId: "1001",
      parentUserId: 0,
      userName: `Mem_${String(phone).slice(-4) || 'VIP'}`,
      avatar: '1',
      vipLevel: 1,
      balance: 10000.0,
      webSocketUrl: '',
      webSocketChannels: [],
      tokenExpireAt: Date.now() + 86400000 * 30
    }, endpointLower === 'register' ? 'Registration successful' : 'Login successful'));
  }

  if (endpointLower === 'loginoff') {
    return res.status(200).json(success({}, 'Logged out successfully'));
  }

  if (endpointLower === 'refreshtoken') {
    const token = `raxi_token_${Date.now()}`;
    return res.status(200).json(success({
      token,
      refreshToken: token,
      tokenExpireAt: Date.now() + 86400000 * 30,
      webSocketUrl: '',
      webSocketChannels: []
    }));
  }

  if (endpointLower === 'getuserinfo') {
    return res.status(200).json(success({
      userId: "1001",
      userName: "Mem_1632",
      mobile: "7061121632",
      avatar: '1',
      vipLevel: 1,
      balance: 10000.0,
      totalBalance: 10000.0,
      userType: 1,
      invitationCode: '44128111216',
      isRealName: 0,
      email: '',
      creditScore: 100,
      rechargeAmount: 10000.0
    }));
  }

  if (['getbalance', 'getallwallets', 'getsaasallwallets', 'getargameandplatwallets'].includes(endpointLower)) {
    return res.status(200).json(success({
      balance: 10000.0,
      totalBalance: 10000.0,
      withdrawBalance: 10000.0,
      safeBalance: 0.0,
      wallets: [
        { id: 1, name: 'Main Wallet', balance: 10000.0 },
        { id: 2, name: 'Lottery Wallet', balance: 0.0 }
      ]
    }));
  }

  if (['smsverifycode', 'verifyphonecode', 'emailverifycode', 'verifyemailcode'].includes(endpointLower)) {
    return res.status(200).json(success({ verifyCode: '123456' }, 'Code sent: 123456'));
  }

  if (endpointLower === 'getagreement') {
    return res.status(200).json(success({ agreement: "Welcome to RAXI. Play responsibly." }));
  }

  // Universal Fallback
  return res.status(200).json(success({}, 'success'));
};
