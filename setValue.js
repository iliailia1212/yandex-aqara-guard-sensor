const {
    getSACredentialsFromJson,
    IamAuthService,
    Driver,
} = require('ydb-sdk');

module.exports.handler = async function (event, context) {
    const saCredentials = getSACredentialsFromJson('authorized_key.json');
    const authService = new IamAuthService(saCredentials);
    const driver = new Driver({
        endpoint: 'grpcs://ydb.serverless.yandexcloud.net:2135',
        database: '/ru-central1/b1gu23qp5ichl13koh86/etn5em93njqvbf2vutme',
        authService,
    });
    if (!await driver.ready(3000)) {
        console.warn('error connect ybd')
        process.exit(1);
    }

    const value = event.value ? 'true' : 'false';
    await driver.tableClient.withSession(async (session) => {
        const preparedQuery = await session.prepareQuery('DELETE FROM status; UPSERT INTO `status` ( `value` ) VALUES ( '+value+' );');
        const res = await session.executeQuery(preparedQuery);
    });
    return { value };
}

//DELETE FROM status
//UPSERT INTO `status` ( `value` ) VALUES ( false );
