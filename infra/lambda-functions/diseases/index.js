exports.handler = async (event) => {
    console.log('Diseases function called');
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Diseases placeholder' })
    };
};
