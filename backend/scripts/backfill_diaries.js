const { Diary, User } = require('./src/models');

async function backfillUserIds() {
    try {
        const admin = await User.findOne({ where: { email: 'admin@masterdiary.com' } });
        if (!admin) {
            console.log("No admin user found to link diaries to.");
            return;
        }

        const orphans = await Diary.findAll({ where: { userId: null } });
        console.log(`Found ${orphans.length} orphan diaries. Linking to ${admin.email}...`);

        for (const diary of orphans) {
            await diary.update({ userId: admin.id });
        }

        console.log("Backfill complete. AI visibility restored.");
    } catch (e) {
        console.error("Backfill failed:", e);
    }
}

backfillUserIds();
