var apn = require('apn');
var express = require('express');
var bodyParser = require('body-parser');
var Registry = require('./dao/registry');
var app = express();
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({
	extended: true
});
app.use(jsonParser);
app.use(urlencodedParser);
app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By", ' 3.2.1')
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
});
app.listen(8090, function() {
	console.log("Example app listening at http://localhost:8090");
})

let options = {
	token: {
		key: "./assets/AuthKey_QW76FB2PKU.p8",		// 开发者账号中生成的.p8文件
		keyId: "QW76FB2PKU",		// 开发者账号中生成的key
		teamId: "4CA9RGENWW"		// 开发者账号中设置的teamId
	},
	production: false
};

var registry = new Registry();

// 推送消息
function apnsPush(note, devToken) {
	var apnProvider = new apn.Provider(options);
	apnProvider.send(note, devToken).then((result) => {
		// 发送成功后关闭服务
		apnProvider.client.endpointManager._endpoints.forEach(endpoint => endpoint.destroy()); 
		apnProvider.shutdown();
	}).catch(err => console.log(err));
}

app.post('/api/pushNotifications', function(req, res) {
	var description = req.body.description;
	switch (description) {
		case "login":
			var userId = req.body.from;
			registry.getFriends(userId, function(users) {
				for (var i = 0; i < users.length; i++) {
					var name = users[i].FriendName;
					registry.getDeviceToken(users[i].FriendId, function(devices) {
						if (devices.length) {
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
						}
					});
				}
				res.json({
					ErrorCode: 0
				});
			});
			break;
		case "otherdevicelogin":
			var userId = req.body.FromId || req.body.userId;
			registry.getOnlineDevices(userId, function(devices) {
				for (var i = 0; i < devices.length; i++) {
					if (i > 0) {
						if (devices[i].DeviceType == 2) {
							var note = new apn.Notification();
							note.expiry = Math.floor(Date.now() / 1000) + 10;
							note.badge = 3;
							note.sound = "ping.aiff";
							note.payload = {
								'description': 'otherdevicelogin'
							};
							note.contentAvailable = 1;
							note.topic = "Tigerbimeeting";
							note.alert = "您已在其他设备登录";
							apnsPush(note, devices[i].DeviceToken);
							registry.removeDevice(devices[i].DeviceToken);
						}
					}
				}
			});
			break;
		case "logout":
			var userId = req.body.from;
			registry.getFriends(userId, function(users) {
				for (var i = 0; i < users.length; i++) {
					var name = users[i].FriendName;
					registry.getDeviceToken(users[i].FriendId, function(devices) {
						if (devices.length) {
							var note = new apn.Notification();
							note.expiry = Math.floor(Date.now() / 1000) + 10;
							note.badge = 3;
							note.sound = "ping.aiff";
							note.payload = {
								'description': 'logout'
							};
							note.topic = "Tigerbimeeting";
							note.alert = name + "下线了";
							apnsPush(note, devices[0].DeviceToken);
							res.json({
								ErrorCode: 0
							});
						}
					});
				}
			});
			break;
		case "add":
			registry.getDeviceToken(req.body.to, function(devices) {
				if (devices.length) {
					var note = new apn.Notification();
					note.expiry = Math.floor(Date.now() / 1000) + 10;
					note.alert = "您有一条新消息";
					note.payload = {
						description: "add"
					};
					note.topic = "Tigerbimeeting";
					apnsPush(note, devices[0].DeviceToken);
				}
				res.json({
					ErrorCode: 0
				});
			});
			break;
		case "accept":
			registry.getDeviceToken(req.body.to, function(devices) {
				if (devices.length) {
					var note = new apn.Notification();
					note.expiry = Math.floor(Date.now() / 1000) + 10;
					note.topic = "Tigerbimeeting";
					note.alert = req.body.userName + "已接受你的好友请求";
					note.payload = {
						description: "accept"
					};
					apnsPush(note, devices[0].DeviceToken);
					res.json({
						ErrorCode: 0
					});
				}
			});
			break;
		case "refuse":
			registry.getDeviceToken(req.body.to, function(devices) {
				if (devices.length) {
					var note = new apn.Notification();
					note.expiry = Math.floor(Date.now() / 1000) + 10;
					note.topic = "Tigerbimeeting";
					note.alert = req.body.userName + "拒绝了你的好友请求";
					note.payload = {
						description: "refuse"
					};
					apnsPush(note, devices[0].DeviceToken);
					res.json({
						ErrorCode: 0
					});
				}
			});
			break;
		case "delete":
			registry.getDeviceToken(req.body.to, function(devices) {
				if (devices.length) {
					var note = new apn.Notification();
					note.expiry = Math.floor(Date.now() / 1000) + 10;
					note.badge = 3;
					note.sound = "ping.aiff";
					note.payload = {
						'description': 'login'
					};
					note.topic = "Tigerbimeeting";
					note.alert = req.body.userName + "将您从好友列表中删除";
					apnsPush(note, devices[0].DeviceToken);
					res.json({
						ErrorCode: 0
					});
				}
			});
			break;
		case "roomInvitation":
			var from = req.body.from;
			var to = req.body.to;
			registry.getDeviceToken(to, function(devices) {
				if (devices.length) {
					var note = new apn.Notification();
					note.expiry = Math.floor(Date.now() / 1000) + 10;
					note.topic = "Tigerbimeeting";
					note.alert = req.body.from + "邀请您加入会议!";
					note.payload = {
						description: "roomInvitation"
					};
					apnsPush(note, devices[0].DeviceToken);
				}
				res.json({
					ErrorCode: 0
				});
			});
			break;
	}
});