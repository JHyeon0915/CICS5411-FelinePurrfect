exports.handler = async (event) => {
    console.log('Authorizer function called');
    return {
        isAuthorized: true,
        context: {
            userId: 'test-user-id'
        }
    };
};
