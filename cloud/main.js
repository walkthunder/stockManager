var Customer = require('cloud/customer');
/**
 * Hooks
 */


/**
 * before deleting the customer, there are some actions should be taken.
 */
AV.Cloud.beforeDelete('Customer', function(request, response) {

    if (request.object.id === undefined) {
        console.error('[Customer.beforeDelete], Customer not specified');
        return response.error('Customer not specified');
    }
    var customerId = request.object.id;
    //The customer about to be deleted
    var customerTarget = AV.Object.createWithoutData('Customer', customerId);

});


/**
 * Functions
 */


AV.Cloud.define("newUser", function(request, response) {

    //Just name is a necessity.
    if (request.params.name === undefined) {
        return response.error('Invalid parameters: name');
    }
    var user = new AV.User();
    user.set("username", "thunder");
    user.set("password", "123456");
    user.set("email", "walkthunder@163.com");

    user.set("phone", "186-1234-1234");

    user.signUp(null, {
        success: function(user) {
            // 注册成功，可以使用了.
        },
        error: function(user, error) {
            // 失败了
            alert("Error: " + error.code + " " + error.message);
        }
    });
});


AV.Cloud.define("initUserStats", function(request, response) {
    var userQuery = new AV.Query('_User');
    userQuery.find()
        .then(function(users){
            var initUserStatsPromise = [];
            users.forEach(function(user){
                var userPtr = AV.Object.createWithoutData('_User', user.id);
                var statsQuery = new AV.Query('UserStats');
                statsQuery.equalTo('user', userPtr);
                var userStatsPromise = statsQuery.first()
                    .then(function(stats){
                        if (stats === undefined) {
                            var userStats = new AV.Object('UserStats');
                            userStats.set('user', userPtr);
                            return userStats;
                        } else {
                            return stats;
                        }
                    }, function(error){
                        if (error.code === AV.Error.OBJECT_NOT_FOUND) {
                            console.info('OBJECT_NOT_FOUND. Will create UserStats for', userPtr.id);
                            var userStats = new AV.Object('UserStats');
                            userStats.set('user', userPtr);
                            return userStats;
                        }
                    });
                    // now we have the stats for the user

                initUserStatsPromise.push(userStatsPromise);
            });

            AV.Promise.when(initUserStatsPromise)
                .then(function(results) {
                    response.success(results);
                }, function(errors) {
                    console.error(errors);
                    response.error(errors);
                });
        });
});


//Customer features
AV.Cloud.define('newCustomer', Customer.newCustomer);
AV.Cloud.define('getCustomers', Customer.getCustomers);


