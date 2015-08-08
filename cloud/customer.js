/**
 * Created by aaron on 7/24/15.
 */

var request = require('request');
var Config = require('cloud/config');

//This section is used for customer management.
//Functions included:

//newCustomer();

//getCustomers();
//getCustomerById();
//getCustomerByOrder();

//deleteCustomer();

//updateCustomer();


/**
 *
 * Add a new customer
 *
 * @param request
 * @param response
 * @returns {*}
 */


function newCustomer(request, response) {
    // check params
    if (!(request.user && request.user.authenticated())) {
        return response.error('Not authorized');
    }
    //Just name is a necessity.
    if (request.params.name === undefined) {
        return response.error('Invalid parameters');
    }

    var ownerPtr = new AV.User();
    ownerPtr.id = request.user.id;

    var name = request.params.name;
    var address = request.params.address || '';
    var phone = request.params.phone || '';
    var idCard = request.params.idCard || '';
    var idAvatarPtr = AV.Object.createWithoutData('_File', '');
    var idAvatar = request.params.idAvatar || idAvatarPtr;

    var customer = new AV.Object('Customer');
    customer.set('name', name);
    customer.set('address', address);
    customer.set('phone', phone);
    customer.set('idCard', idCard);
    customer.set('idAvatar', idAvatar);


    // set ACL
    var acl = new AV.ACL();
    acl.setPublicReadAccess(true);
    acl.setWriteAccess(ownerPtr, true);
    acl.setRoleWriteAccess('Moderators', true);
    customer.setACL(acl);

    // save the collection and return the success promise containing the collection
    // it seems like nothing to do after save()
    customer.save()
        .then(function() {
            response.success(customer.toJSON());
        }, function(error) {
            console.error(error);
            response.error(error);
        });
}


/**
 *
 * @param request
 * @param response
 * @returns {*}
 */
function getCustomers(request, response) {
    // List all of the customers
    if(!(request.user && request.user.authenticated())) {
        return response.error('Not authorized');
    }

    var customerQuery = new AV.Query('Customer');
    customerQuery.descending("updatedAt");
    return customerQuery.find()
        .then(function(customers) {
            response.success(customers);
        }, function(error){
            response.error('Error: ' + error);
        });
}


exports.newCustomer = newCustomer;
exports.getCustomers = getCustomers;
