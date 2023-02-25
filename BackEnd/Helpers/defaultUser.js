const User = require('../Database/Model/User');

async function insertDefaultUser(){

    let users = await User.find({})


    if(users.length > 0){
        console.log('Cannot insert default user. User already exists')
        console.log(users)
        return;
    }
    else{
        let insertDefaultUser = await User.create({username:'admin',password:'admin'})
        console.log('Inserted default user admin') 
    }
}

module.exports = {
    insertDefaultUser
}
