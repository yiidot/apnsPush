var registry = module.exports = function(){
	var mysql = require('mysql');
	var config = require('../config/config');
	var connection = mysql.createConnection({
		host: config.sql[0].host, 
		user: config.sql[0].user, 
		password: config.sql[0].password, 
		port: config.sql[0].port, 
		database: config.sql[0].database
	});
	this.getDeviceToken = function(userId, callback){		
		for (var i = 0; i < result.length; i++) {
			connection.query("select * from viewactivity where UserId = ?" , [userId], function (err, result) {
				if(err){
					console.log('[SELECT ERROR] - ',err.message);
					callback({ErrorCode:1, SqlFeedback: 101});
					return;
				}
				callback(result);
			});
		}
	}
	this.getOnlineDevices = function(userId, callback){		
		connection.query("select * from viewactivity where UserId = ? order by `DateTime` desc" , [userId], function (err, result) {
			if(err){
				console.log('[SELECT ERROR] - ',err.message);
				callback({ErrorCode:1, SqlFeedback: 101});
				return;
			}
			callback(result);
		});
	}
	this.removeDevice = function (token, callback){
	    try{
	        connection.query("delete from activity where DeviceToken = ?" , [token], function (err, result) {
	            if(err){
	                console.log('[DELETE ERROR] - ',err.message);
	                callback({ErrorCode:1, SqlFeedback: 101});
	                return;
	            }
	        });
	    } catch(ex){
	        console.log(ex);
	    }     
	}
	this.getFriends = function(userId, callback){
		connection.query("select * from userfriends where userId = ? and onlineState = 2" , [userId], function (err, result) {
			if(err){
				console.log('[SELECT ERROR] - ',err.message);
				callback({ErrorCode:1, SqlFeedback: 101});
				return;
			}
			callback(result);
		});
	}
	this.getUser = function(userId, callback){
		connection.query("select * from userfriends where FriendId = ? and onlineState = 2" , [userId], function (err, result) {
			if(err){
				console.log('[SELECT ERROR] - ',err.message);
				callback({ErrorCode:1, SqlFeedback: 101});
				return;
			}
			callback(result);
		});
	}
}
