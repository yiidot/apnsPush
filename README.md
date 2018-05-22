# apnsPush
## iOS推送通知--push notifications

#### 使用nodejs、中间件apn实现iOS的消息推送
#### 来源：Bimeeting项目

### 核心代码
```
// 引入
var apn = require('apn');

// 配置
let options = {
	token: {
		key: "./assets/AuthKey_QW76FB2PKU.p8",		// 开发者账号中生成的.p8文件
		keyId: "QW76FB2PKU",		// 开发者账号中生成的key
		teamId: "4CA9RGENWW"		// 开发者账号中设置的teamId
	},
	production: false
};

// 推送消息
function apnsPush(note, devToken) {
	var apnProvider = new apn.Provider(options);
	apnProvider.send(note, devToken).then((result) => {
		// 发送成功后关闭服务
		apnProvider.client.endpointManager._endpoints.forEach(endpoint => endpoint.destroy()); 
		apnProvider.shutdown();
	}).catch(err => console.log(err));
}

// 使用
var note = new apn.Notification();
note.expiry = Math.floor(Date.now() / 1000) + 10;
note.badge = 3;
note.sound = "ping.aiff";
note.payload = {
  'description': 'login'
};
note.topic = "Tigerbimeeting";
note.alert = name + "上线了";
apnsPush(note, devices[0].DeviceToken);
```
