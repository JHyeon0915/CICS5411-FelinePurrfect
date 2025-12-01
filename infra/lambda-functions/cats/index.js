exports.handler = async (event) => {
    console.log('Cats function called');
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Cats placeholder' })
    };
};
