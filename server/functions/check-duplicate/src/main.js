const sdk = require('node-appwrite');

module.exports = async function (context) {
    const client = new sdk.Client()
        .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
        .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new sdk.Databases(client);
    const { uniqueId } = JSON.parse(context.req.body); // Data from frontend

    try {
        const response = await databases.listDocuments(
            'aidconnect_db',
            'deliveries',
            [
                sdk.Query.equal('beneficiaryId', uniqueId),
                sdk.Query.orderDesc('deliveryDate'),
                sdk.Query.limit(1)
            ]
        );

        if (response.total === 0) {
            return context.res.json({ eligible: true, message: "Fresh recipient." });
        }

        const lastDate = new Date(response.documents[0].deliveryDate);
        const daysAgo = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));

        if (daysAgo < 30) {
            return context.res.json({ 
                eligible: false, 
                message: `Duplicate! Only ${daysAgo} days since last aid. Wait ${30 - daysAgo} more days.` 
            });
        }

        return context.res.json({ eligible: true, message: "30-day window passed." });

    } catch (err) {
        return context.res.json({ eligible: false, error: err.message });
    }
};